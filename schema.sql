-- Mindzi Database Schema
-- This file contains the SQL code to set up the necessary tables for the Mindzi application

-- Note: JWT secret should be configured in the Supabase dashboard settings
-- Do not attempt to set it via SQL as it requires superuser privileges

-- Create profiles table to store user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  education_type TEXT NOT NULL CHECK (education_type IN ('high_school', 'university', 'self_study', 'professional')),
  education_grade TEXT,
  education_major TEXT,
  education_field TEXT,
  study_hours_per_week INTEGER DEFAULT 0,
  study_goals TEXT DEFAULT '',
  study_preferences JSONB DEFAULT '{}',
  study_schedule JSONB DEFAULT '{}',
  study_stats JSONB DEFAULT '{
    "total_study_time": 0,
    "subjects_studied": 0,
    "flashcards_created": 0,
    "flashcards_reviewed": 0,
    "notes_created": 0,
    "assignments_completed": 0,
    "last_study_date": null
  }'
);

-- Create subjects table to store subjects that users are studying
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create topics table to store topics within subjects
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create notes table to store user notes
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create flashcards table for spaced repetition
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty INTEGER DEFAULT 0 NOT NULL,
  next_review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create chat_sessions table to store user chat history
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create chat_messages table to store individual messages in chat sessions
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create study_sessions table to track user study time
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  subject TEXT,
  topic TEXT,
  notes TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create assignments table for AI-assisted assignments
CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  subject TEXT NOT NULL,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('essay', 'presentation', 'report', 'spreadsheet', 'other')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted')) DEFAULT 'draft',
  ai_generated_content JSONB,
  user_content TEXT,
  feedback TEXT,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create assignment_steps table to track the AI-assisted writing process
CREATE TABLE IF NOT EXISTS assignment_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  step_type TEXT NOT NULL CHECK (step_type IN ('outline', 'research', 'draft', 'revision', 'final')),
  content TEXT NOT NULL,
  ai_suggestions JSONB,
  user_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS) policies
-- Profiles: Users can only read and update their own profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Subjects: Users can only CRUD their own subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subjects" 
  ON subjects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subjects" 
  ON subjects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subjects" 
  ON subjects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subjects" 
  ON subjects FOR DELETE 
  USING (auth.uid() = user_id);

-- Topics: Users can only CRUD their own topics (via subject ownership)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own topics" 
  ON topics FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM subjects WHERE id = topics.subject_id));

CREATE POLICY "Users can create their own topics" 
  ON topics FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM subjects WHERE id = topics.subject_id));

CREATE POLICY "Users can update their own topics" 
  ON topics FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM subjects WHERE id = topics.subject_id));

CREATE POLICY "Users can delete their own topics" 
  ON topics FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM subjects WHERE id = topics.subject_id));

-- Notes: Users can only CRUD their own notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes" 
  ON notes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
  ON notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
  ON notes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
  ON notes FOR DELETE 
  USING (auth.uid() = user_id);

-- Similar policies for other tables...

-- Create a trigger to automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    education_type,
    study_hours_per_week,
    study_goals,
    study_preferences,
    study_schedule,
    study_stats
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    new.raw_user_meta_data->'education'->>'type',
    0,
    '',
    '{}',
    '{}',
    '{
      "total_study_time": 0,
      "subjects_studied": 0,
      "flashcards_created": 0,
      "flashcards_reviewed": 0,
      "notes_created": 0,
      "assignments_completed": 0,
      "last_study_date": null
    }'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add RLS policies for assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignments" 
  ON assignments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assignments" 
  ON assignments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assignments" 
  ON assignments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assignments" 
  ON assignments FOR DELETE 
  USING (auth.uid() = user_id);

-- Add RLS policies for assignment_steps
ALTER TABLE assignment_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignment steps" 
  ON assignment_steps FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM assignments WHERE id = assignment_steps.assignment_id));

CREATE POLICY "Users can create their own assignment steps" 
  ON assignment_steps FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM assignments WHERE id = assignment_steps.assignment_id));

CREATE POLICY "Users can update their own assignment steps" 
  ON assignment_steps FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM assignments WHERE id = assignment_steps.assignment_id));

CREATE POLICY "Users can delete their own assignment steps" 
  ON assignment_steps FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM assignments WHERE id = assignment_steps.assignment_id));

-- Add trigger for assignment_steps updated_at
CREATE TRIGGER update_assignment_steps_updated_at
  BEFORE UPDATE ON assignment_steps
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add trigger for assignments updated_at
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add columns to study_sessions
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS notes TEXT;
