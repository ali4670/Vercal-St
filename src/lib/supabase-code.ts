import { createClient } from "@supabase/supabase-js";

// Get your Supabase URL and Anon Key from environment variables
const supabaseUrl =
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://hcfqtgydoonpyskxibyt.supabase.co";
const supabaseAnonKey =
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_rV89m4GouX2LLFqRgzSNEQ_AywB-6Ne";

/**
 * The Supabase client to interact with your database.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
  --- DATABASE SCHEMA (FINAL PRODUCTION V18.0) ---
  --- FULL CONSOLIDATED RESTORATION WITH STORAGE, RLS, & ANALYTICS ---

  -- 1. Create User Roles Type
  DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'student', 'parent');
  EXCEPTION
      WHEN duplicate_object THEN null;
  END $$;

  -- 2. Core Tables
  CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    score INTEGER DEFAULT 0,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    role user_role NOT NULL DEFAULT 'student',
    is_admin BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    work_duration INTEGER DEFAULT 25,
    break_duration INTEGER DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
  );

  -- Ensure phone_number exists
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number TEXT UNIQUE;

  -- Parent-Student Link Table
  CREATE TABLE IF NOT EXISTS parent_student_links (
      parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
      PRIMARY KEY (parent_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    level_order INTEGER UNIQUE NOT NULL,
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
  );

  CREATE TABLE IF NOT EXISTS lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_blocks JSONB DEFAULT '[]',
    video_url TEXT,
    pdf_url TEXT,
    slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 100),
    is_live BOOLEAN DEFAULT true,
    quiz_required BOOLEAN DEFAULT false,
    quiz_data JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(level_id, slot_number)
  );

  CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE UNIQUE,
    title TEXT NOT NULL,
    questions JSONB NOT NULL DEFAULT '[]',
    passing_score INTEGER DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
  );

  CREATE TABLE IF NOT EXISTS student_progress (
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    lecture_id UUID REFERENCES lectures(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (student_id, lecture_id)
  );

  CREATE TABLE IF NOT EXISTS level_access (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, level_id)
  );

  -- 3. Helper Functions
  CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
    BEGIN RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)); END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION is_moderator() RETURNS BOOLEAN AS $$
    BEGIN RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator')); END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION is_approved() RETURNS BOOLEAN AS $$
    BEGIN RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_approved = true OR role IN ('admin', 'moderator'))); END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION can_student_access_level(u_id UUID, target_level_id UUID) RETURNS BOOLEAN AS $$
    DECLARE prev_level_id UUID; current_level_order INTEGER; lectures_count INTEGER; completed_count INTEGER; has_manual BOOLEAN;
    BEGIN
      IF EXISTS (SELECT 1 FROM level_access WHERE user_id = u_id AND level_id = target_level_id) THEN RETURN TRUE; END IF;
      SELECT EXISTS (SELECT 1 FROM level_access WHERE user_id = u_id) INTO has_manual;
      SELECT level_order INTO current_level_order FROM levels WHERE id = target_level_id;
      IF current_level_order = 1 THEN 
        IF has_manual THEN RETURN FALSE; ELSE RETURN TRUE; END IF;
      END IF;
      IF has_manual THEN RETURN FALSE; END IF;
      SELECT id INTO prev_level_id FROM levels WHERE level_order < current_level_order ORDER BY level_order DESC LIMIT 1;
      IF prev_level_id IS NULL THEN RETURN TRUE; END IF;
      SELECT COUNT(*) INTO lectures_count FROM lectures WHERE level_id = prev_level_id AND is_live IS NOT FALSE;
      SELECT COUNT(*) INTO completed_count FROM student_progress JOIN lectures ON student_progress.lecture_id = lectures.id WHERE student_progress.student_id = u_id AND lectures.level_id = prev_level_id;
      RETURN completed_count >= lectures_count;
    END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION has_level_access(l_id UUID) RETURNS BOOLEAN AS $$
    BEGIN
      IF is_moderator() THEN RETURN TRUE; END IF;
      IF EXISTS (SELECT 1 FROM level_access WHERE user_id = auth.uid() AND level_id = l_id) THEN RETURN TRUE; END IF;
      RETURN is_approved() AND can_student_access_level(auth.uid(), l_id);
    END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION can_access_lecture(p_lecture_id UUID) RETURNS BOOLEAN AS $$
    DECLARE v_level_id UUID; v_slot_number INTEGER; v_incomplete_count INTEGER;
    BEGIN
      IF is_moderator() THEN RETURN TRUE; END IF;
      SELECT level_id, slot_number INTO v_level_id, v_slot_number FROM lectures WHERE id = p_lecture_id;
      IF NOT has_level_access(v_level_id) THEN RETURN FALSE; END IF;
      IF v_slot_number = 1 THEN RETURN TRUE; END IF;
      SELECT COUNT(*) INTO v_incomplete_count FROM lectures l LEFT JOIN student_progress sp ON l.id = sp.lecture_id AND sp.student_id = auth.uid() WHERE l.level_id = v_level_id AND l.slot_number < v_slot_number AND sp.lecture_id IS NULL;
      RETURN v_incomplete_count = 0;
    END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE OR REPLACE FUNCTION complete_lecture_secure(p_lecture_id UUID) RETURNS VOID AS $$
    BEGIN
      IF NOT can_access_lecture(p_lecture_id) THEN RAISE EXCEPTION 'Lecture locked or prerequisites not met.'; END IF;
      INSERT INTO student_progress (student_id, lecture_id) VALUES (auth.uid(), p_lecture_id) ON CONFLICT (student_id, lecture_id) DO NOTHING;
    END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
*/
