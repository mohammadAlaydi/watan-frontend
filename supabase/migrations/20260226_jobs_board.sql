-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- JOBS BOARD & APPLY FLOW — SUPABASE SCHEMA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Core info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  nice_to_have TEXT[],

  -- Classification
  department TEXT,
  seniority TEXT,
  employment_type TEXT,
  work_arrangement TEXT,

  -- Location
  country TEXT,
  city TEXT,
  timezone_requirement TEXT,

  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  salary_period TEXT DEFAULT 'annual',
  salary_public BOOLEAN DEFAULT TRUE,

  -- Application
  apply_type TEXT DEFAULT 'internal',
  external_apply_url TEXT,
  apply_email TEXT,
  application_questions JSONB,
  resume_required BOOLEAN DEFAULT TRUE,
  cover_letter_required BOOLEAN DEFAULT FALSE,

  -- Targeting (Palestinian professionals focus)
  welcomes_diaspora BOOLEAN DEFAULT TRUE,
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  relocation_assistance BOOLEAN DEFAULT FALSE,
  arabic_required BOOLEAN DEFAULT FALSE,
  arabic_preferred BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT DEFAULT 'active',
  featured BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,

  -- Engagement
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,

  -- Meta
  posted_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id TEXT NOT NULL,

  -- Application data
  resume_url TEXT,
  cover_letter TEXT,
  answers JSONB,
  linkedin_url TEXT,
  portfolio_url TEXT,

  -- Status
  status TEXT DEFAULT 'submitted',
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Meta
  applied_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_id, applicant_id)
);

-- SAVED JOBS
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- JOB ALERTS
CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[],
  locations TEXT[],
  departments TEXT[],
  seniority TEXT[],
  work_arrangement TEXT[],
  salary_min INTEGER,
  frequency TEXT DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_slug ON jobs(slug);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON jobs(seniority);
CREATE INDEX IF NOT EXISTS idx_jobs_arrangement ON jobs(work_arrangement);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON jobs(country);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON job_alerts(user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- Jobs: anyone can read active jobs
CREATE POLICY "Anyone can read active jobs"
  ON jobs FOR SELECT
  USING (status = 'active');

-- Jobs: authenticated users can read all their own jobs (any status)
CREATE POLICY "Posters can read own jobs"
  ON jobs FOR SELECT
  USING (auth.uid()::text = posted_by);

-- Jobs: authenticated users can insert jobs
CREATE POLICY "Authenticated users can post jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Jobs: poster can update own jobs
CREATE POLICY "Posters can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid()::text = posted_by);

-- Jobs: poster can delete own jobs
CREATE POLICY "Posters can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid()::text = posted_by);

-- Applications: applicant can read own applications
CREATE POLICY "Applicants can read own applications"
  ON applications FOR SELECT
  USING (auth.uid()::text = applicant_id);

-- Applications: authenticated users can insert applications
CREATE POLICY "Authenticated users can apply"
  ON applications FOR INSERT
  WITH CHECK (auth.uid()::text = applicant_id);

-- Applications: applicant can update own applications (withdraw)
CREATE POLICY "Applicants can update own applications"
  ON applications FOR UPDATE
  USING (auth.uid()::text = applicant_id);

-- Saved jobs: users can read own saved jobs
CREATE POLICY "Users can read own saved jobs"
  ON saved_jobs FOR SELECT
  USING (auth.uid()::text = user_id);

-- Saved jobs: users can save jobs
CREATE POLICY "Users can save jobs"
  ON saved_jobs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Saved jobs: users can unsave jobs
CREATE POLICY "Users can unsave jobs"
  ON saved_jobs FOR DELETE
  USING (auth.uid()::text = user_id);

-- Job alerts: users can manage own alerts
CREATE POLICY "Users can read own alerts"
  ON job_alerts FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create alerts"
  ON job_alerts FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own alerts"
  ON job_alerts FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own alerts"
  ON job_alerts FOR DELETE
  USING (auth.uid()::text = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGER: auto-update updated_at on jobs
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
