-- Fix: Allow authenticated users to view published levels, lectures, and exams
-- without requiring group assignment. Group-based drip access is handled at app level.

-- Level templates: allow any authenticated user to view published levels
DROP POLICY IF EXISTS "Students view assigned templates" ON level_templates;
CREATE POLICY "Students view assigned templates" ON level_templates
  FOR SELECT USING (is_moderator() OR (is_published = true));

-- Lecture templates: allow any authenticated user to view lectures for published levels
DROP POLICY IF EXISTS "Students view assigned lectures" ON lecture_templates;
CREATE POLICY "Students view assigned lectures" ON lecture_templates
  FOR SELECT USING (is_moderator() OR EXISTS (
    SELECT 1 FROM level_templates lt
    WHERE lt.id = lecture_templates.level_template_id AND lt.is_published = true
  ));

-- Exam templates: allow any authenticated user to view exams for published levels
DROP POLICY IF EXISTS "Students view assigned exams" ON exam_templates;
CREATE POLICY "Students view assigned exams" ON exam_templates
  FOR SELECT USING (is_moderator() OR EXISTS (
    SELECT 1 FROM level_templates lt
    WHERE lt.id = exam_templates.level_template_id AND lt.is_published = true
  ));
