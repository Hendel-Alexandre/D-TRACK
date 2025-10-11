-- DUAL MODE SYSTEM: Complete separation of Student and Work modes (FIXED)

-- 1. Add mode enum type
CREATE TYPE app_mode AS ENUM ('student', 'work');

-- 2. User mode preferences (tracks which modes are active)
CREATE TABLE public.user_mode_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  active_mode app_mode NOT NULL DEFAULT 'work',
  student_mode_enabled BOOLEAN DEFAULT false,
  work_mode_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_mode_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own mode settings"
ON public.user_mode_settings FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. STUDENT MODE: Profiles
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT,
  major TEXT,
  year TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own student profile"
ON public.student_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. WORK MODE: Profiles
CREATE TABLE public.work_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  job_title TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.work_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own work profile"
ON public.work_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. STUDENT MODE: Classes
CREATE TABLE public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instructor TEXT,
  location TEXT,
  color TEXT DEFAULT '#3b82f6',
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own classes"
ON public.student_classes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. STUDENT MODE: Assignments & Exams
CREATE TYPE assignment_type AS ENUM ('assignment', 'exam', 'project', 'other');
CREATE TYPE assignment_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

CREATE TABLE public.student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.student_classes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type assignment_type NOT NULL DEFAULT 'assignment',
  status assignment_status NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ NOT NULL,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assignments"
ON public.student_assignments FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. FILE STORAGE: Student files metadata
CREATE TABLE public.student_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  class_id UUID REFERENCES public.student_classes(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES public.student_assignments(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own student files"
ON public.student_files FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 8. FILE STORAGE: Work files metadata
CREATE TABLE public.work_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.work_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own work files"
ON public.work_files FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 9. STUDENT MODE: Conversations
CREATE TABLE public.student_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_conversations ENABLE ROW LEVEL SECURITY;

-- 10. STUDENT MODE: Conversation members (CREATE BEFORE POLICIES)
CREATE TABLE public.student_conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.student_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.student_conversation_members ENABLE ROW LEVEL SECURITY;

-- NOW ADD POLICIES FOR CONVERSATIONS (after members table exists)
CREATE POLICY "Users can view student conversations they're in"
ON public.student_conversations FOR SELECT
USING (
  id IN (
    SELECT conversation_id FROM public.student_conversation_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create student conversations"
ON public.student_conversations FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- POLICIES FOR CONVERSATION MEMBERS
CREATE POLICY "Users can view members in their student conversations"
ON public.student_conversation_members FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id FROM public.student_conversation_members 
    WHERE user_id = auth.uid()
  )
);

-- 11. STUDENT MODE: Messages
CREATE TABLE public.student_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.student_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their student conversations"
ON public.student_messages FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id FROM public.student_conversation_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their student conversations"
ON public.student_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (
    SELECT conversation_id FROM public.student_conversation_members 
    WHERE user_id = auth.uid()
  )
);

-- 12. WORK MODE: Mark existing tables as work-related by adding indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

-- 13. STUDENT MODE: Tasks (separate from work tasks)
CREATE TABLE public.student_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Todo',
  priority TEXT DEFAULT 'Medium',
  due_date DATE,
  class_id UUID REFERENCES public.student_classes(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES public.student_assignments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own student tasks"
ON public.student_tasks FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 14. Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-uploads', 'student-uploads', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('work-uploads', 'work-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- 15. Storage policies for student uploads
CREATE POLICY "Users can upload their own student files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own student files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own student files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'student-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 16. Storage policies for work uploads
CREATE POLICY "Users can upload their own work files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'work-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own work files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'work-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own work files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'work-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 17. Triggers for updated_at timestamps
CREATE TRIGGER update_user_mode_settings_updated_at
BEFORE UPDATE ON public.user_mode_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_profiles_updated_at
BEFORE UPDATE ON public.work_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_classes_updated_at
BEFORE UPDATE ON public.student_classes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_assignments_updated_at
BEFORE UPDATE ON public.student_assignments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_tasks_updated_at
BEFORE UPDATE ON public.student_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. Enable realtime for student features
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_tasks;