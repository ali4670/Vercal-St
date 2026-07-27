ALTER TABLE level_templates ADD COLUMN IF NOT EXISTS force_all_live BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION can_access_lecture(p_lecture_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_level_template_id UUID;
    v_slot_number INTEGER;
    v_drip_interval INTEGER;
    v_level_access_granted_at TIMESTAMP WITH TIME ZONE;
    v_incomplete_count INTEGER;
    v_force_all_live BOOLEAN;
BEGIN
    IF is_moderator() THEN RETURN TRUE; END IF;

    SELECT level_template_id, slot_number INTO v_level_template_id, v_slot_number FROM lecture_templates WHERE id = p_lecture_id;

    IF NOT has_level_access(v_level_template_id) THEN RETURN FALSE; END IF;

    SELECT force_all_live INTO v_force_all_live FROM level_templates WHERE id = v_level_template_id;
    IF v_force_all_live THEN RETURN TRUE; END IF;

    SELECT granted_at INTO v_level_access_granted_at 
    FROM level_access 
    WHERE user_id = auth.uid() AND level_id = v_level_template_id;

    IF v_level_access_granted_at IS NULL THEN
        v_level_access_granted_at := NOW();
    END IF;

    SELECT drip_interval_days INTO v_drip_interval FROM level_templates WHERE id = v_level_template_id;
    v_drip_interval := COALESCE(v_drip_interval, 0);

    IF (v_slot_number - 1) * v_drip_interval > EXTRACT(DAY FROM (NOW() - v_level_access_granted_at)) THEN
        RETURN FALSE;
    END IF;

    IF v_slot_number = 1 THEN RETURN TRUE; END IF;

    SELECT COUNT(*) INTO v_incomplete_count
    FROM lecture_templates lt
    LEFT JOIN student_progress sp ON lt.id = sp.lecture_id AND sp.student_id = auth.uid()
    WHERE lt.level_template_id = v_level_template_id
      AND lt.slot_number < v_slot_number
      AND sp.lecture_id IS NULL;

    RETURN v_incomplete_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
