-- =============================================================
-- GROUP-LEVEL RUNTIME SCOPING
--
-- Every Level attachment to a Group is a "GroupLevel" (a row in
-- group_level_assignments). All runtime data (chat, progress,
-- submissions, exams, study sessions, quiz attempts, notes,
-- activity) is anchored to the GroupLevel via group_level_id so
-- that each Group has completely isolated runtime data even when
-- the same Level content is shared across Groups.
-- =============================================================

-- 1. Add the group_level_id anchor column to runtime tables
---------------------------------------------------------------
ALTER TABLE level_chats              ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE student_progress         ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE exam_submissions         ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE lecture_task_submissions ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE quiz_attempts            ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE study_sessions           ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE CASCADE;
ALTER TABLE study_sessions           ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE moderator_notes          ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE student_activity_log     ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE grade_history            ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;
ALTER TABLE assignment_overrides     ADD COLUMN IF NOT EXISTS group_level_id UUID REFERENCES group_level_assignments(id) ON DELETE CASCADE;

-- 2. Backfill existing rows so legacy data keeps its group-level anchor
-----------------------------------------------------------------------
-- level_chats: already carries group_id + level_id
UPDATE level_chats lc
SET group_level_id = gla.id
FROM group_level_assignments gla
WHERE lc.group_level_id IS NULL
  AND lc.group_id IS NOT NULL
  AND lc.level_id = gla.level_template_id
  AND lc.group_id = gla.group_id;

-- student_progress / exam_submissions / lecture_task_submissions:
-- carry lecture_id + group_id -> resolve level via lecture_templates
UPDATE student_progress sp
SET group_level_id = gla.id
FROM lecture_templates lt
JOIN group_level_assignments gla ON gla.level_template_id = lt.level_template_id
WHERE sp.group_level_id IS NULL
  AND lt.id = sp.lecture_id
  AND gla.group_id = sp.group_id;

UPDATE exam_submissions es
SET group_level_id = gla.id
FROM lecture_templates lt
JOIN group_level_assignments gla ON gla.level_template_id = lt.level_template_id
WHERE es.group_level_id IS NULL
  AND lt.id = es.lecture_id
  AND gla.group_id = es.group_id;

UPDATE lecture_task_submissions lts
SET group_level_id = gla.id
FROM lecture_templates lt
JOIN group_level_assignments gla ON gla.level_template_id = lt.level_template_id
WHERE lts.group_level_id IS NULL
  AND lt.id = lts.lecture_id
  AND gla.group_id = lts.group_id;

-- quiz_attempts / study_sessions: only have lecture context; backfill
-- only when the student has exactly ONE group-level for that level.
UPDATE quiz_attempts qa
SET group_level_id = gla.id
FROM lecture_templates lt
JOIN group_level_assignments gla ON gla.level_template_id = lt.level_template_id
JOIN student_groups sg ON sg.group_id = gla.group_id
WHERE qa.group_level_id IS NULL
  AND lt.id = qa.lecture_id
  AND sg.student_id = qa.student_id
  AND NOT EXISTS (
      SELECT 1 FROM group_level_assignments gla2
      JOIN student_groups sg2 ON sg2.group_id = gla2.group_id
      WHERE sg2.student_id = qa.student_id
        AND gla2.level_template_id = lt.level_template_id
        AND gla2.group_id <> gla.group_id
  );

UPDATE study_sessions ss
SET group_id = gla.group_id, group_level_id = gla.id
FROM lecture_templates lt
JOIN group_level_assignments gla ON gla.level_template_id = lt.level_template_id
JOIN student_groups sg ON sg.group_id = gla.group_id
WHERE ss.group_level_id IS NULL
  AND (ss.metadata->>'lecture_id')::UUID = lt.id
  AND sg.student_id = ss.student_id
  AND NOT EXISTS (
      SELECT 1 FROM group_level_assignments gla2
      JOIN student_groups sg2 ON sg2.group_id = gla2.group_id
      WHERE sg2.student_id = ss.student_id
        AND gla2.level_template_id = lt.level_template_id
        AND gla2.group_id <> gla.group_id
  );

-- 3. Performance indexes on the new anchor column
--------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_level_chats_group_level ON level_chats(group_level_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_group_level ON student_progress(group_level_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_group_level ON exam_submissions(group_level_id);
CREATE INDEX IF NOT EXISTS idx_task_submissions_group_level ON lecture_task_submissions(group_level_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_group_level ON quiz_attempts(group_level_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_group_level ON study_sessions(group_level_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_group ON study_sessions(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moderator_notes_group_level ON moderator_notes(group_level_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_group_level ON student_activity_log(group_level_id);
CREATE INDEX IF NOT EXISTS idx_grade_history_group_level ON grade_history(group_level_id);
CREATE INDEX IF NOT EXISTS idx_assignment_overrides_group_level ON assignment_overrides(group_level_id);

-- 4. Helper: resolve the GroupLevel id for a group + level
-----------------------------------------------------------
CREATE OR REPLACE FUNCTION get_group_level_id(p_group_id UUID, p_level_template_id UUID)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id
    FROM group_level_assignments
    WHERE group_id = p_group_id AND level_template_id = p_level_template_id
    LIMIT 1;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. complete_lecture_secure now anchors progress on the GroupLevel
-------------------------------------------------------------------
DROP FUNCTION IF EXISTS complete_lecture_secure(uuid,uuid);
CREATE OR REPLACE FUNCTION complete_lecture_secure(p_lecture_id UUID, p_group_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_student_id UUID;
  v_effective_group_id UUID;
  v_group_level_id UUID;
  v_level_id UUID;
  v_row_count INTEGER;
  v_inserted BOOLEAN;
BEGIN
  v_student_id := auth.uid();
  IF v_student_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF NOT can_access_lecture(p_lecture_id, p_group_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lecture locked or prerequisites not met.');
  END IF;

  SELECT level_template_id INTO v_level_id FROM lecture_templates WHERE id = p_lecture_id;

  v_effective_group_id := p_group_id;

  IF v_effective_group_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM groups WHERE id = v_effective_group_id) THEN
    v_effective_group_id := NULL;
  END IF;

  IF v_effective_group_id IS NULL THEN
    SELECT gla.group_id INTO v_effective_group_id
    FROM group_level_assignments gla
    JOIN get_my_group_ids() g ON g = gla.group_id
    WHERE gla.level_template_id = v_level_id
    LIMIT 1;
  END IF;

  IF v_effective_group_id IS NULL THEN
    v_effective_group_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  SELECT id INTO v_group_level_id
  FROM group_level_assignments
  WHERE group_id = v_effective_group_id AND level_template_id = v_level_id
  LIMIT 1;

  INSERT INTO student_progress (student_id, lecture_id, group_id, group_level_id)
  VALUES (v_student_id, p_lecture_id, v_effective_group_id, v_group_level_id)
  ON CONFLICT (student_id, lecture_id, group_id) DO NOTHING;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  v_inserted := v_row_count > 0;

  IF v_inserted THEN
    UPDATE profiles SET
      xp = COALESCE(xp, 0) + 50,
      score = COALESCE(score, 0) + 10
    WHERE id = v_student_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'is_new', v_inserted);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Group chat notifications
-- When someone posts in a group's level_chat, notify every member of that
-- group (except the sender) via the notifications table. The NotificationBell
-- picks these up through realtime and shows the unread badge.
-----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_group_chat_message()
RETURNS TRIGGER AS $$
DECLARE
    v_sender_name TEXT;
    v_group_name TEXT;
    v_context TEXT;
    v_link TEXT;
BEGIN
    IF NEW.group_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT COALESCE(username, 'A member') INTO v_sender_name FROM profiles WHERE id = NEW.sender_id;
    SELECT COALESCE(name, 'Group') INTO v_group_name FROM groups WHERE id = NEW.group_id;

    IF NEW.lecture_id IS NOT NULL THEN
        SELECT COALESCE(title, 'a lecture') INTO v_context FROM lecture_templates WHERE id = NEW.lecture_id;
        v_link := '/lecture/' || NEW.lecture_id::text || '?tab=chat';
    ELSE
        SELECT COALESCE(title, 'the classroom') INTO v_context FROM level_templates WHERE id = NEW.level_id;
        v_link := '/levels/classroom/' || NEW.level_id::text || '?group_id=' || NEW.group_id::text;
    END IF;

    INSERT INTO notifications (user_id, title, message, type, link)
    SELECT
        member_id,
        'New chat message',
        v_sender_name || ' posted in ' || v_group_name || ' - ' || v_context,
        'message',
        v_link
    FROM (
        SELECT student_id AS member_id FROM student_groups WHERE group_id = NEW.group_id
        UNION
        SELECT id AS member_id FROM profiles WHERE group_id = NEW.group_id
    ) members
    WHERE member_id <> NEW.sender_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_group_chat_message ON level_chats;
CREATE TRIGGER trg_notify_group_chat_message
AFTER INSERT ON level_chats
FOR EACH ROW
EXECUTE FUNCTION notify_group_chat_message();

-- Ensure the notifications table is on the realtime publication so the
-- NotificationBell updates live (safe no-op if already present).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;
