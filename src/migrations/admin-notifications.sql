-- =============================================================
-- ST-COMPANY: Admin Notifications for Events
-- Notifies all admin users when:
--   1. A new user registers
--   2. A moderator creates a new level template
--   3. A new group is created
--   4. A new direct message is sent
-- =============================================================

-- Helper: get all admin user IDs
CREATE OR REPLACE FUNCTION get_admin_ids()
RETURNS UUID[] AS $$
DECLARE
    v_admin_ids UUID[];
BEGIN
    SELECT array_agg(id) INTO v_admin_ids
    FROM profiles
    WHERE role = 'admin';
    RETURN COALESCE(v_admin_ids, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. New user registration
CREATE OR REPLACE FUNCTION notify_admins_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    FOR v_admin_id IN SELECT unnest(get_admin_ids())
    LOOP
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            v_admin_id,
            'New User Registered',
            COALESCE(NEW.username, 'A new user') || ' has joined the platform.',
            'info',
            '/moderator'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admins_new_user ON profiles;
CREATE TRIGGER trg_notify_admins_new_user
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_user();

-- 2. New level template created
CREATE OR REPLACE FUNCTION notify_admins_new_level()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
    v_creator TEXT;
BEGIN
    SELECT username INTO v_creator FROM profiles WHERE id = NEW.created_by;
    FOR v_admin_id IN SELECT unnest(get_admin_ids())
    LOOP
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            v_admin_id,
            'New Level Created',
            COALESCE(v_creator, 'A moderator') || ' created a new level: "' || COALESCE(NEW.title, 'Untitled') || '".',
            'info',
            '/moderator'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admins_new_level ON level_templates;
CREATE TRIGGER trg_notify_admins_new_level
    AFTER INSERT ON level_templates
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_level();

-- 3. New group created
CREATE OR REPLACE FUNCTION notify_admins_new_group()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
BEGIN
    FOR v_admin_id IN SELECT unnest(get_admin_ids())
    LOOP
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            v_admin_id,
            'New Group Created',
            'A new group "' || COALESCE(NEW.name, 'Untitled') || '" has been created.',
            'info',
            '/moderator'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admins_new_group ON groups;
CREATE TRIGGER trg_notify_admins_new_group
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_group();

-- 4. New direct message sent (general notification for admins)
CREATE OR REPLACE FUNCTION notify_admins_new_message()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
    v_sender TEXT;
    v_is_admin BOOLEAN;
BEGIN
    -- Don't notify if the sender is an admin (avoids self-notification)
    SELECT role = 'admin', username INTO v_is_admin, v_sender
    FROM profiles WHERE id = NEW.sender_id;

    IF v_is_admin THEN
        RETURN NEW;
    END IF;

    FOR v_admin_id IN SELECT unnest(get_admin_ids())
    LOOP
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            v_admin_id,
            'New Message',
            COALESCE(v_sender, 'Someone') || ' sent a new message.',
            'message',
            '/moderator'
        );
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_admins_direct_message ON direct_messages;
CREATE TRIGGER trg_notify_admins_direct_message
    AFTER INSERT ON direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_message();

DROP TRIGGER IF EXISTS trg_notify_admins_level_chat ON level_chats;
CREATE TRIGGER trg_notify_admins_level_chat
    AFTER INSERT ON level_chats
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_message();

DROP TRIGGER IF EXISTS trg_notify_admins_group_message ON group_messages;
CREATE TRIGGER trg_notify_admins_group_message
    AFTER INSERT ON group_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_admins_new_message();
