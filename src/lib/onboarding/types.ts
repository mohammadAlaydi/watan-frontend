export interface Profile {
    id: string;
    clerk_user_id: string;
    full_name: string | null;
    headline: string | null;
    profile_photo_url: string | null;
    current_role: string | null;
    current_company: string | null;
    years_experience: string | null;
    industries: string[] | null;
    skills: string[] | null;
    bio: string | null;
    resume_url: string | null;
    linkedin_url: string | null;
    country: string | null;
    city: string | null;
    languages: string[] | null;
    timezone: string | null;
    job_seeking_status: string | null;
    preferred_roles: string[] | null;
    preferred_locations: string[] | null;
    salary_expectation_min: number | null;
    salary_expectation_max: number | null;
    salary_currency: string | null;
    work_arrangement: string[] | null;
    verification_status: string;
    verification_method: string | null;
    onboarding_completed: boolean;
    onboarding_step: number;
    created_at: string;
    updated_at: string;
}

export interface ActionResult {
    success: boolean;
    error?: string;
}

/*
-- Supabase SQL for creating the profiles table:

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  full_name TEXT,
  headline TEXT,
  profile_photo_url TEXT,
  current_role TEXT,
  current_company TEXT,
  years_experience TEXT,
  industries TEXT[],
  skills TEXT[],
  bio TEXT,
  resume_url TEXT,
  linkedin_url TEXT,
  country TEXT,
  city TEXT,
  languages TEXT[],
  timezone TEXT,
  job_seeking_status TEXT,
  preferred_roles TEXT[],
  preferred_locations TEXT[],
  salary_expectation_min INTEGER,
  salary_expectation_max INTEGER,
  salary_currency TEXT,
  work_arrangement TEXT[],
  verification_status TEXT DEFAULT 'unverified',
  verification_method TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
*/
