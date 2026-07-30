-- =============================================================
-- Migration: Per-group scoping for all student data
-- Run this in Supabase SQL Editor (safe to re-run)
-- =============================================================

-- 1. Add group_id to exam_submissions (safe re-run)
ALTER TABLE exam_submissions ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- 2. Add group_id to student_progress and rework PK
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS group_id UUID;
UPDATE student_progress SET group_id = '00000000-0000-0000-0000-000000000000' WHERE group_id IS NULL;
ALTER TABLE student_progress ALTER COLUMN group_id SET NOT NULL;
ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_pkey CASCADE;
ALTER TABLE student_progress ADD PRIMARY KEY (student_id, lecture_id, group_id);

-- 3. Change unique on lecture_task_submissions to include group_id
ALTER TABLE lecture_task_submissions DROP CONSTRAINT IF EXISTS lecture_task_submissions_student_id_lecture_id_key CASCADE;
ALTER TABLE lecture_task_submissions ADD UNIQUE (student_id, lecture_id, group_id);

-- 4. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_student_progress_group ON student_progress(student_id, group_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_group ON exam_submissions(group_id);
DROP INDEX IF EXISTS idx_task_submissions_unique_group;

-- 5. FK for exam_submissions
ALTER TABLE exam_submissions DROP CONSTRAINT IF EXISTS fk_exam_submissions_group;
ALTER TABLE exam_submissions ADD CONSTRAINT fk_exam_submissions_group
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

-- =============================================================
-- Recreate RPC functions with p_group_id parameter
-- =============================================================

-- 6. can_access_lecture(p_lecture_id, p_group_id DEFAULT NULL)
CREATE OR REPLACE FUNCTION can_access_lecture(p_lecture_id UUID, p_group_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_student_id UUID;
  v_level_id UUID;
  v_lecture_order INTEGER;
  v_previous_lecture_id UUID;
  v_has_progress BOOLEAN;
  v_effective_group_id UUID;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN RETURN FALSE; END IF;

  SELECT level_template_id, slot_number INTO v_level_id, v_lecture_order
  FROM lecture_templates WHERE id = p_lecture_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  IF v_lecture_order = 1 THEN RETURN TRUE; END IF;

  SELECT id INTO v_previous_lecture_id
  FROM lecture_templates
  WHERE level_template_id = v_level_id AND slot_number = v_lecture_order - 1;
  IF NOT FOUND THEN RETURN TRUE; END IF;

  v_effective_group_id := COALESCE(p_group_id, '00000000-0000-0000-0000-000000000000');
  SELECT EXISTS (
    SELECT 1 FROM student_progress
    WHERE student_id = v_student_id AND lecture_id = v_previous_lecture_id
    AND group_id = v_effective_group_id
  ) INTO v_has_progress;

  RETURN v_has_progress;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. complete_lecture_secure(p_lecture_id, p_group_id DEFAULT NULL)
CREATE OR REPLACE FUNCTION complete_lecture_secure(p_lecture_id UUID, p_group_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_effective_group_id UUID;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  v_effective_group_id := COALESCE(p_group_id, '00000000-0000-0000-0000-000000000000');

  INSERT INTO student_progress (student_id, lecture_id, group_id)
  VALUES (v_student_id, p_lecture_id, v_effective_group_id)
  ON CONFLICT (student_id, lecture_id, group_id) DO NOTHING;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. can_student_access_level(u_id, target_level_id, p_group_id DEFAULT NULL)
CREATE OR REPLACE FUNCTION can_student_access_level(u_id UUID, target_level_id UUID, p_group_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  prev_level_id UUID;
  current_level_order INTEGER;
  lectures_count INTEGER;
  completed_count INTEGER;
  v_effective_group_id UUID;
BEGIN
  IF p_group_id IS NOT NULL THEN
    SELECT level_order INTO current_level_order FROM level_templates WHERE id = target_level_id;
    IF current_level_order = 1 THEN RETURN TRUE; END IF;

    SELECT id INTO prev_level_id FROM level_templates WHERE level_order = current_level_order - 1;
    IF prev_level_id IS NULL THEN RETURN TRUE; END IF;

    v_effective_group_id := COALESCE(p_group_id, '00000000-0000-0000-0000-000000000000');

    SELECT COUNT(*) INTO completed_count
    FROM student_progress sp
    JOIN lecture_templates lt ON sp.lecture_id = lt.id
    WHERE sp.student_id = u_id AND lt.level_template_id = prev_level_id
      AND sp.group_id = v_effective_group_id;

    SELECT COUNT(*) INTO lectures_count
    FROM lecture_templates WHERE level_template_id = prev_level_id AND is_live = true;

    RETURN completed_count >= lectures_count;
  END IF;

  SELECT level_order INTO current_level_order FROM level_templates WHERE id = target_level_id;
  IF current_level_order = 1 THEN RETURN TRUE; END IF;

  SELECT id INTO prev_level_id FROM level_templates WHERE level_order = current_level_order - 1;
  IF prev_level_id IS NULL THEN RETURN TRUE; END IF;

  SELECT COUNT(*) INTO completed_count
  FROM student_progress sp
  JOIN lecture_templates lt ON sp.lecture_id = lt.id
  WHERE sp.student_id = u_id AND lt.level_template_id = prev_level_id;

  SELECT COUNT(*) INTO lectures_count
  FROM lecture_templates WHERE level_template_id = prev_level_id AND is_live = true;

  RETURN completed_count >= lectures_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. can_access_next_lecture(p_current_lecture_id, p_student_id, p_group_id DEFAULT NULL) [1st copy]
CREATE OR REPLACE FUNCTION can_access_next_lecture(p_current_lecture_id UUID, p_student_id UUID, p_group_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_level_id UUID;
  v_current_slot INTEGER;
  v_last_lecture_id UUID;
  v_last_slot INTEGER;
  v_submission_count INTEGER;
  v_exam_count INTEGER;
BEGIN
  SELECT level_template_id, slot_number INTO v_level_id, v_current_slot
  FROM lecture_templates WHERE id = p_current_lecture_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  SELECT id, slot_number INTO v_last_lecture_id, v_last_slot
  FROM lecture_templates
  WHERE level_template_id = v_level_id
  ORDER BY slot_number DESC LIMIT 1;

  IF p_current_lecture_id = v_last_lecture_id THEN
    RETURN TRUE;
  END IF;

  SELECT COUNT(*) INTO v_exam_count
  FROM exam_submissions
  WHERE student_id = p_student_id AND lecture_id = p_current_lecture_id
    AND (p_group_id IS NULL OR group_id = p_group_id);

  IF v_exam_count = 1 THEN
    SELECT COUNT(*) INTO v_submission_count
    FROM lecture_task_submissions
    WHERE student_id = p_student_id AND lecture_id = p_current_lecture_id
      AND (p_group_id IS NULL OR group_id = p_group_id);
    RETURN v_submission_count = 1;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. can_access_next_lecture (2nd copy, same signature — kept for migration compatibility)
-- (The 2nd copy is identical in the full schema; re-run the same CREATE OR REPLACE above)

-- =============================================================
-- Done
-- =============================================================
