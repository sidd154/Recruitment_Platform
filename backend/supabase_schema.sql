-- Supabase schema for SkillBridge

-- Create Enums
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE application_status AS ENUM ('applied', 'interview_pending', 'interview_done', 'reviewed', 'accepted', 'rejected');
CREATE TYPE interview_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE headhunt_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE notification_type AS ENUM ('headhunt', 'interview_complete', 'application_update', 'passport_issued', 'passport_failed');
CREATE TYPE job_type_enum AS ENUM ('remote', 'hybrid', 'onsite');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- candidates
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  college TEXT NOT NULL,
  graduation_year INT NOT NULL,
  degree TEXT NOT NULL,
  resume_path TEXT,
  extracted_skills JSONB,
  tenth_marks TEXT,
  twelfth_marks TEXT,
  github_link TEXT,
  leetcode_link TEXT,
  linkedin_link TEXT,
  github_score FLOAT,
  leetcode_score FLOAT,
  total_portfolio_score FLOAT,
  passport_id UUID, -- FK will be added later
  created_at TIMESTAMPTZ DEFAULT now()
);

-- recruiters
CREATE TABLE public.recruiters (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_domain TEXT NOT NULL,
  company_size TEXT NOT NULL,
  designation TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- skill_passports
CREATE TABLE public.skill_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  skills JSONB NOT NULL,
  proctoring_score FLOAT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Alter candidates to add the FK now that skill_passports exists
ALTER TABLE public.candidates 
  ADD CONSTRAINT fk_candidate_passport 
  FOREIGN KEY (passport_id) 
  REFERENCES public.skill_passports(id) ON DELETE SET NULL;

-- test_sessions
CREATE TABLE public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  questions JSONB NOT NULL,
  answers JSONB,
  proctoring_consent BOOLEAN DEFAULT false,
  proctoring_log JSONB,
  score FLOAT,
  passed BOOLEAN,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- improvement_roadmaps
CREATE TABLE public.improvement_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  test_session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  failed_skills JSONB NOT NULL,
  roadmap JSONB NOT NULL,
  retake_available_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  job_type job_type_enum NOT NULL,
  required_skills JSONB NOT NULL,
  min_experience_years INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- job_briefs
CREATE TABLE public.job_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID UNIQUE REFERENCES public.jobs(id) ON DELETE CASCADE,
  focus_areas JSONB NOT NULL,
  recruiter_mcqs JSONB NOT NULL,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('candidate_applied', 'recruiter_headhunted')),
  status application_status DEFAULT 'applied',
  mcq_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- interview_sessions
CREATE TABLE public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  transcript JSONB DEFAULT '[]'::JSONB,
  summary JSONB,
  interview_scorecard JSONB,
  status interview_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- headhunt_invitations
CREATE TABLE public.headhunt_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status headhunt_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  payload JSONB NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS & Security (Optional for hackathon but good practice)
-- By default, Supabase creates tables with RLS disabled. 
-- For a hackathon timeline, leaving RLS disabled is okay since backend enforces JWT middleware on every endpoint.
