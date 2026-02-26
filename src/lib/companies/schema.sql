-- ═══════════════════════════════════════════════════════
-- WATAN — Company Profile & Review System SQL Schema
-- ═══════════════════════════════════════════════════════

-- COMPANIES TABLE
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  founded_year INTEGER,
  headquarters TEXT,
  website_url TEXT,
  logo_url TEXT,
  cover_url TEXT,

  -- Aggregated stats (updated via trigger)
  total_reviews INTEGER DEFAULT 0,
  avg_overall_rating DECIMAL(3,2) DEFAULT 0,
  avg_culture_rating DECIMAL(3,2) DEFAULT 0,
  avg_management_rating DECIMAL(3,2) DEFAULT 0,
  avg_worklife_rating DECIMAL(3,2) DEFAULT 0,
  avg_compensation_rating DECIMAL(3,2) DEFAULT 0,
  avg_growth_rating DECIMAL(3,2) DEFAULT 0,
  recommend_percentage INTEGER DEFAULT 0,

  -- Verification
  is_claimed BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_industry ON companies(industry);

-- REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,

  -- Employment context
  job_title TEXT NOT NULL,
  employment_status TEXT NOT NULL,
  employment_start_year INTEGER,
  employment_end_year INTEGER,
  work_location TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,

  -- Ratings (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  culture_rating INTEGER CHECK (culture_rating BETWEEN 1 AND 5),
  management_rating INTEGER CHECK (management_rating BETWEEN 1 AND 5),
  worklife_rating INTEGER CHECK (worklife_rating BETWEEN 1 AND 5),
  compensation_rating INTEGER CHECK (compensation_rating BETWEEN 1 AND 5),
  growth_rating INTEGER CHECK (growth_rating BETWEEN 1 AND 5),

  -- Written review
  title TEXT NOT NULL,
  pros TEXT NOT NULL,
  cons TEXT NOT NULL,
  advice_to_management TEXT,

  -- Additional data
  recommends_company BOOLEAN,
  ceo_approval BOOLEAN,

  -- Salary (optional, linked)
  salary_amount INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  salary_period TEXT DEFAULT 'annual',

  -- Interview experience (optional)
  interview_difficulty TEXT,
  interview_experience TEXT,
  interview_questions TEXT[],
  got_offer BOOLEAN,

  -- Moderation
  status TEXT DEFAULT 'published',
  flagged_count INTEGER DEFAULT 0,
  moderation_note TEXT,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);

-- PUBLIC VIEW: strips reviewer_id for safe querying
CREATE OR REPLACE VIEW public_reviews AS
SELECT
  id, company_id, job_title, employment_status,
  employment_start_year, employment_end_year, work_location,
  is_anonymous, overall_rating, culture_rating, management_rating,
  worklife_rating, compensation_rating, growth_rating,
  title, pros, cons, advice_to_management,
  recommends_company, ceo_approval,
  salary_amount, salary_currency, salary_period,
  interview_difficulty, interview_experience, interview_questions,
  got_offer, status, helpful_count, created_at, updated_at
FROM reviews;

-- REVIEW HELPFUL VOTES
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, voter_id)
);

-- REVIEW FLAGS (for reporting)
CREATE TABLE review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALARY DATA
CREATE TABLE salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  submitter_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  period TEXT DEFAULT 'annual',
  location TEXT,
  years_experience TEXT,
  employment_type TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_salaries_company ON salaries(company_id);

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;

-- Companies: anyone can read
CREATE POLICY "companies_read" ON companies
  FOR SELECT USING (true);

-- Reviews: anyone can read published reviews (use the view instead ideally)
CREATE POLICY "reviews_read_published" ON reviews
  FOR SELECT USING (status = 'published' OR reviewer_id = auth.uid()::text);

CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (reviewer_id = auth.uid()::text);

CREATE POLICY "reviews_delete_own" ON reviews
  FOR DELETE USING (reviewer_id = auth.uid()::text);

-- Helpful votes
CREATE POLICY "votes_read" ON review_helpful_votes
  FOR SELECT USING (true);

CREATE POLICY "votes_insert" ON review_helpful_votes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "votes_delete_own" ON review_helpful_votes
  FOR DELETE USING (voter_id = auth.uid()::text);

-- Flags
CREATE POLICY "flags_insert" ON review_flags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Salaries: anyone can read, authenticated can insert
CREATE POLICY "salaries_read" ON salaries
  FOR SELECT USING (true);

CREATE POLICY "salaries_insert" ON salaries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ═══════════════════════════════════════════════════════
-- TRIGGER: Recalculate company ratings
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_company_ratings()
RETURNS TRIGGER AS $$
DECLARE
  target_company_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_company_id := OLD.company_id;
  ELSE
    target_company_id := NEW.company_id;
  END IF;

  UPDATE companies
  SET
    total_reviews = (
      SELECT COUNT(*) FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
    ),
    avg_overall_rating = COALESCE((
      SELECT ROUND(AVG(overall_rating)::numeric, 2) FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
    ), 0),
    avg_culture_rating = COALESCE((
      SELECT ROUND(AVG(culture_rating)::numeric, 2) FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
        AND culture_rating IS NOT NULL
    ), 0),
    avg_management_rating = COALESCE((
      SELECT ROUND(AVG(management_rating)::numeric, 2) FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
        AND management_rating IS NOT NULL
    ), 0),
    avg_worklife_rating = COALESCE((
      SELECT ROUND(AVG(worklife_rating)::numeric, 2) FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
        AND worklife_rating IS NOT NULL
    ), 0),
    avg_compensation_rating = COALESCE((
      SELECT ROUND(AVG(compensation_rating)::numeric, 2) FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
        AND compensation_rating IS NOT NULL
    ), 0),
    avg_growth_rating = COALESCE((
      SELECT ROUND(AVG(growth_rating)::numeric, 2) FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
        AND growth_rating IS NOT NULL
    ), 0),
    recommend_percentage = COALESCE((
      SELECT ROUND(
        100.0 * COUNT(*) FILTER (WHERE recommends_company = true) /
        NULLIF(COUNT(*) FILTER (WHERE recommends_company IS NOT NULL), 0)
      )::integer FROM reviews
      WHERE company_id = target_company_id AND status = 'published'
    ), 0),
    updated_at = NOW()
  WHERE id = target_company_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_company_ratings
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_company_ratings();
