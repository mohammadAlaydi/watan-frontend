You are continuing to build "Watan" — a professional network for Palestinian
professionals worldwide. Landing page, auth, onboarding, dashboard, and 
profile pages are already built.

Now build the Company Profile page and the complete Review System.
This is the core value of the product. Build it with exceptional care.

TECH STACK REMINDER:
- Next.js 14+ App Router
- TypeScript strict
- Tailwind CSS with Watan design tokens (already configured)
- shadcn/ui components
- Framer Motion
- Clerk for auth
- Supabase for data
- Lucide React icons
- Zod for validation
- React Hook Form
- date-fns

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app/
  (dashboard)/
    companies/
      page.tsx                   ← company directory / search
      loading.tsx
      [slug]/
        page.tsx                 ← company profile
        loading.tsx
        reviews/
          page.tsx               ← all reviews for company
        salaries/
          page.tsx               ← salary data for company
        interviews/
          page.tsx               ← interview experiences

  (modals)/
    write-review/
      page.tsx                   ← intercepted modal route

components/
  companies/
    CompanyCard.tsx              ← card used in directory + search
    CompanyDirectory.tsx         ← searchable company list
    CompanyFilters.tsx           ← filter sidebar
    CompanySearch.tsx            ← search input with suggestions
  company-profile/
    CompanyHeader.tsx            ← logo, name, rating, actions
    CompanyOverview.tsx          ← about, size, industry, links
    CompanyRatings.tsx           ← overall rating breakdown
    CompanyReviewsList.tsx       ← paginated reviews
    CompanyReviewCard.tsx        ← individual review display
    CompanySalaries.tsx          ← salary data table
    CompanyInterviews.tsx        ← interview experiences
    CompanyJobs.tsx              ← open jobs at this company
    CompanyNav.tsx               ← tabs: Overview/Reviews/Salaries/Jobs
  review/
    WriteReviewModal.tsx         ← full review form modal
    ReviewStarInput.tsx          ← interactive star rating input
    ReviewCategoryRatings.tsx    ← sub-category ratings
    ReviewFormStep1.tsx          ← role + employment status
    ReviewFormStep2.tsx          ← ratings
    ReviewFormStep3.tsx          ← written review
    ReviewFormStep4.tsx          ← salary + interview (optional)
    ReviewSuccessState.tsx       ← post-submit success screen
    ReviewHelpfulButton.tsx      ← helpful vote button
    ReviewReportButton.tsx       ← report review button
    AnonymityBadge.tsx           ← explains anonymous protection

lib/
  companies/
    queries.ts                   ← all company Supabase queries
    actions.ts                   ← company server actions
    schema.ts                    ← Zod schemas
  reviews/
    queries.ts                   ← review queries
    actions.ts                   ← review server actions
    schema.ts                    ← review Zod schemas
    utils.ts                     ← rating calculations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — SUPABASE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Output as SQL comment block. Create these tables:

-- COMPANIES TABLE
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,         -- "google-dubai", "microsoft"
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  company_size TEXT,                 -- "1-10","11-50","51-200",
                                     -- "201-500","501-1000","1000+"
  founded_year INTEGER,
  headquarters TEXT,
  website_url TEXT,
  logo_url TEXT,
  cover_url TEXT,

  -- Aggregated stats (updated via trigger or function)
  total_reviews INTEGER DEFAULT 0,
  avg_overall_rating DECIMAL(3,2) DEFAULT 0,
  avg_culture_rating DECIMAL(3,2) DEFAULT 0,
  avg_management_rating DECIMAL(3,2) DEFAULT 0,
  avg_worklife_rating DECIMAL(3,2) DEFAULT 0,
  avg_compensation_rating DECIMAL(3,2) DEFAULT 0,
  avg_growth_rating DECIMAL(3,2) DEFAULT 0,
  recommend_percentage INTEGER DEFAULT 0,

  -- Verification
  is_claimed BOOLEAN DEFAULT FALSE,  -- employer claimed their page
  is_verified BOOLEAN DEFAULT FALSE,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS TABLE
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,         -- clerk_user_id (never exposed)

  -- Employment context
  job_title TEXT NOT NULL,
  employment_status TEXT NOT NULL,   -- "current","former","contractor"
  employment_start_year INTEGER,
  employment_end_year INTEGER,       -- null if current
  work_location TEXT,                -- city or "Remote"
  is_anonymous BOOLEAN DEFAULT TRUE,

  -- Ratings (1-5 scale)
  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  culture_rating INTEGER CHECK (culture_rating BETWEEN 1 AND 5),
  management_rating INTEGER CHECK (management_rating BETWEEN 1 AND 5),
  worklife_rating INTEGER CHECK (worklife_rating BETWEEN 1 AND 5),
  compensation_rating INTEGER CHECK (compensation_rating BETWEEN 1 AND 5),
  growth_rating INTEGER CHECK (growth_rating BETWEEN 1 AND 5),

  -- Written review
  title TEXT NOT NULL,               -- "Great culture, poor management"
  pros TEXT NOT NULL,                -- min 100 chars
  cons TEXT NOT NULL,                -- min 100 chars
  advice_to_management TEXT,         -- optional

  -- Additional data
  recommends_company BOOLEAN,
  ceo_approval BOOLEAN,

  -- Salary (optional, separate but linked)
  salary_amount INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  salary_period TEXT DEFAULT 'annual', -- "annual","monthly","hourly"

  -- Interview experience (optional)
  interview_difficulty TEXT,         -- "easy","medium","hard","very_hard"
  interview_experience TEXT,         -- "positive","negative","neutral"
  interview_questions TEXT[],        -- array of question strings
  got_offer BOOLEAN,

  -- Moderation
  status TEXT DEFAULT 'published',   -- "published","flagged","removed"
  flagged_count INTEGER DEFAULT 0,
  moderation_note TEXT,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,

  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEW HELPFUL VOTES
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,            -- clerk_user_id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, voter_id)        -- one vote per user per review
);

-- REVIEW FLAGS (for reporting)
CREATE TABLE review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id TEXT NOT NULL,
  reason TEXT NOT NULL,              -- "fake","offensive","irrelevant","other"
  description TEXT,
  status TEXT DEFAULT 'pending',     -- "pending","reviewed","dismissed"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SALARY DATA (standalone, also linked from reviews)
CREATE TABLE salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  submitter_id TEXT NOT NULL,        -- clerk_user_id (never exposed)
  job_title TEXT NOT NULL,
  salary_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  period TEXT DEFAULT 'annual',
  location TEXT,
  years_experience TEXT,
  employment_type TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security policies (output as SQL):
-- Reviews: anyone can read published reviews
-- Reviews: authenticated users can insert their own
-- Reviews: users can only update/delete their own
-- reviewer_id is NEVER returned in any SELECT query
--   (use a Postgres view or function that strips it)
-- Helpful votes: authenticated users can insert
-- Flags: authenticated users can insert

-- Postgres function to recalculate company ratings:
-- Called after INSERT/UPDATE/DELETE on reviews table
CREATE OR REPLACE FUNCTION update_company_ratings()
RETURNS TRIGGER AS $$
  -- Recalculate all avg_* columns and total_reviews
  -- Update companies table WHERE id = NEW.company_id
  -- Calculate recommend_percentage from recommends_company column
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_company_ratings
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_company_ratings();

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — COMPANY DIRECTORY PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/companies/page.tsx ──

Server component.
Accept searchParams: { q, industry, size, country, sort, page }
Query Supabase companies with filters applied.
Pagination: 20 per page.

Layout: max-w-7xl mx-auto px-6 py-8

Page header:
  H1: "Companies" font-bold text-3xl text-charcoal
  Subtitle: "Find workplaces reviewed by Palestinian professionals"
  text-muted text-sm
  
  Right: "Add a company +" button
    Outline olive button
    onClick: open AddCompanyModal (simple form: name, website, industry)

Two column layout:
  Left sidebar (filters, 280px, sticky):
    <CompanyFilters />
  Main content (flex-1):
    <CompanySearch /> (search bar at top)
    Results count: "Showing 47 companies" text-muted text-sm
    Sort dropdown: "Most reviewed" | "Highest rated" | "Recently added"
    <CompanyDirectory results={companies} />
    Pagination at bottom

── CompanyFilters.tsx ──

White card, rounded-2xl, border, p-5

"Filters" header + "Clear all" link text-olive text-sm

Filter sections:

  Industry (checkboxes):
    Technology, Finance, Healthcare, Education, Engineering,
    Design, Marketing, Media, NGO, Government, Consulting, Other
    Show 6 + "Show more" expand
    Each checkbox: olive accent color

  Company size (checkboxes):
    1–10, 11–50, 51–200, 201–500, 501–1000, 1000+

  Rating (star filter):
    "4+ stars" / "3+ stars" / "Any rating"
    Radio buttons, olive accent

  Location (checkboxes):
    Show top 8 countries from diaspora list
    "Remote-friendly" toggle at top

  "Has open jobs" toggle
  "Hiring Palestinians" toggle (companies that explicitly welcome)

Each filter change: updates URL searchParams (useRouter push)
Active filter count badge on mobile "Filters (3)"

── CompanyCard.tsx ──

Used in directory grid and search results.

White card, rounded-2xl, border, p-5
hover: translateY(-3px) shadow-md border-olive/20
transition: all 0.2s ease
cursor-pointer → navigate to /companies/[slug]

Card layout:
  Top row:
    Company logo (48px rounded-xl, bg-olive-pale fallback with initials)
    Company name: font-bold text-charcoal text-base
    Industry badge: text-xs bg-olive-subtle text-olive rounded-md px-2 py-0.5
    Right: Overall star rating (large, gold) + number

  Middle:
    One-line description, text-sm text-muted, truncate

  Stats row (border-t mt-3 pt-3):
    📍 Headquarters location
    👥 Company size
    ⭐ {N} reviews
    💼 {N} open jobs
    Each: text-xs text-muted with icon

  Bottom row (if has reviews):
    Rating bar mini preview:
      4 thin bars showing culture/mgmt/worklife/growth
      Olive filled proportionally
    
    "Recommends" pill:
      "{X}% would recommend"
      ≥70%: bg-green-50 text-green-700
      40-69%: bg-yellow-50 text-yellow-700
      <40%: bg-red-50 text-red-700

── CompanySearch.tsx ──

Client component.
Input: full width, white bg, border, rounded-xl, h-12
Lucide Search icon left, olive on focus
Placeholder: "Search companies by name, industry, or location..."

On type (debounced 300ms):
  Show dropdown of suggestions (max 6)
  Each suggestion: company logo + name + industry
  Keyboard navigable (arrow keys)
  Enter or click: navigate to company profile OR update search

On submit (Enter without selecting):
  Update URL ?q= param
  Filter company list

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — COMPANY PROFILE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/companies/[slug]/page.tsx ──

Server component.
Get slug from params.
Query company by slug from Supabase.
If not found: notFound()

Parallel fetch:
  - Company data
  - Latest 5 reviews
  - Salary summary (avg by role, top 5 roles)
  - Open jobs (from jobs table)
  - Interview experiences (latest 3)

Check if current user has already reviewed this company:
  hasReviewed = check reviews table for (company_id + reviewer_id)

Layout: max-w-6xl mx-auto

Full width at top: <CompanyHeader />
Then: <CompanyNav /> (sticky tabs)
Then: tabbed content area

Default tab: Overview (shows CompanyOverview + CompanyRatings + 
  first 3 reviews preview + salary preview)

── CompanyHeader.tsx ──

Props: company, hasReviewed, reviewCount

Cover area (200px tall):
  If company.cover_url: show image
  Else: gradient bg-gradient-to-r from-charcoal to-charcoal-mid
  Subtle olive geometric pattern overlay at low opacity

Below cover (white bg, border-b, pb-6):
  max-w-6xl mx-auto px-6

  Row 1: Logo + basic info
    Company logo: 80px rounded-2xl, border-4 border-white
    -mt-10 relative z-10
    
    Right of logo:
      Company name: text-3xl font-black text-charcoal tracking-tight
      Industry · Size · Founded year
      text-sm text-muted
      
      If is_claimed: "Claimed ✓" badge olive
      If is_verified: "Verified" badge with shield icon

  Row 2: Rating summary + Actions
    Left: Rating display
      Large number: overall rating (e.g. "4.2")
      font-black text-5xl text-charcoal
      
      Gold stars (filled proportionally)
      
      "{N} reviews" text-muted text-sm
      
      "Recommended by {X}%" 
      Color coded green/yellow/red

    Right: Action buttons
      If hasReviewed:
        "✓ You reviewed this company" 
        Disabled olive-pale button
      Else:
        "Write a review" → opens WriteReviewModal
        filled olive button, prominent
      
      "Share" ghost button with share icon
      Three dots → "Claim this page" (for employers)

  Below: Quick stat pills row
    🌐 website.com (external link)
    📍 Headquarters
    👥 Size range
    🏭 Industry
    Each: bg-olive-subtle rounded-full px-3 py-1 text-xs text-charcoal

── CompanyNav.tsx ──

Sticky below header (top-16, z-30)
White bg, border-b

Tabs: Overview | Reviews ({count}) | Salaries | Interviews | Jobs ({count})

Each tab:
  px-5 py-4 text-sm font-medium
  Active: border-b-2 border-olive text-olive
  Inactive: text-muted hover:text-charcoal
  
Tab switching:
  Use URL hash (#reviews, #salaries etc.)
  OR use searchParams ?tab=reviews
  Prefer searchParams for shareable URLs

── CompanyOverview.tsx ──

Two column layout below nav (main 7 cols + sidebar 5 cols)

Main column:

  "About {company name}" card:
    White, rounded-2xl, border, p-6, mb-4
    Company description text
    Founded, HQ, Website link
    If no description: EmptyState with "Be the first to add company info"

  CompanyRatings card:
    White, rounded-2xl, border, p-6, mb-4
    
    "Ratings overview" header
    
    Overall large rating display:
      Center: huge number (4.2) font-black text-6xl text-charcoal
      Stars below: gold, proportional fill
      "{N} ratings" text-muted text-sm
      
    5 category rating bars:
      Culture & Values
      Senior Management
      Work-Life Balance
      Compensation & Benefits
      Career Growth
      
      Each row:
        Label (text-sm text-charcoal font-medium, w-40)
        Progress bar (flex-1, h-2, bg-olive-pale rounded-full)
          Fill: bg-olive, width proportional to rating
          Animate width on mount with Framer Motion
        Rating number (text-sm font-bold text-charcoal, w-8 text-right)
    
    Recommend meter:
      Horizontal split bar
        Left (olive): recommends%
        Right (muted): doesn't recommend%
      "{X}% of reviewers recommend this company"
    
    Rating distribution (star histogram):
      5 rows: 5★ 4★ 3★ 2★ 1★
      Each: star label + bar + count
      Bar filled proportionally, olive color
      Animate on mount

Sidebar column:

  "Write a review" CTA card (if not yet reviewed):
    White card, rounded-2xl, border, p-5, mb-4
    Olive gradient top border (3px)
    
    Title: "Share your experience"
    Subtitle: "Help other Palestinians find great workplaces"
    text-sm text-muted mb-4
    
    "Write a review →" full width olive button
    
    AnonymityBadge below:
      Shield icon + "Your identity is always protected"
      text-xs text-muted

  "Salary insights" preview card:
    White card, rounded-2xl, border, p-5, mb-4
    
    Top 3 roles with avg salary:
      Role title + avg salary range
      "View all salaries →" link

  "Open positions" card:
    Count of open jobs
    3 job title previews
    "View all jobs →" link

── CompanyReviewsList.tsx ──

Full width section (when Reviews tab active)

Header row:
  "Reviews" font-bold text-xl
  Total count badge
  
  Right: Sort dropdown
    "Most recent" | "Most helpful" | "Highest rated" | "Lowest rated"

Filter row (below header):
  Pill filters:
    All | Current employees | Former employees
    Full-time | Part-time | Contract
  
  Location filter dropdown
  Rating filter (star minimum)

If no reviews: 
  Large centered EmptyState
  "No reviews yet. Be the first to share your experience."
  "Write a review →" olive button

Reviews list:
  <CompanyReviewCard /> for each
  Paginate: "Load more" button (append, not new page)
  Show 10 per load

── CompanyReviewCard.tsx ──

This is the most important component. Build with care.

White card, rounded-2xl, border, p-6, mb-4
Subtle left border: 4px, color based on overall rating
  5★: border-green-400
  4★: border-olive
  3★: border-yellow-400
  2★: border-orange-400
  1★: border-red-400

Layout sections:

SECTION 1 — Header row
  Left:
    Overall star rating (gold stars, large)
    Review title: font-bold text-charcoal text-lg mt-1
    
  Right:
    Date: "March 2024" (month + year only, never exact date)
    Employment status badge:
      "Current Employee" or "Former Employee"
      + years: "· 3 years"
      bg-olive-subtle text-olive text-xs rounded-md px-2 py-1

SECTION 2 — Role info row
  Job title · Work location
  text-sm text-muted
  
  AnonymityBadge (inline, small):
    🔒 "Anonymous review"
    text-xs text-muted/70

SECTION 3 — Category ratings (compact horizontal)
  5 mini rating displays in a row:
    Each: label (tiny text) + mini star or number
    Culture · Management · Work-Life · Pay · Growth
    Compact, doesn't dominate card

SECTION 4 — Written review body
  "Pros" section:
    Green thumb up icon (Lucide ThumbsUp, olive color)
    "Pros" label font-semibold text-sm text-charcoal
    Prose text: text-sm text-charcoal leading-relaxed
    
  "Cons" section (mt-4):
    Orange thumb down icon  
    "Cons" label font-semibold text-sm text-charcoal
    Prose text

  "Advice to management" section (if exists, mt-4):
    Lightbulb icon
    "Advice" label
    Prose text

  Long text handling:
    If pros/cons > 250 chars: truncate + "Read more" toggle
    Expand with smooth Framer Motion height animation

SECTION 5 — Recommend + CEO
  Row: 
    "✓ Recommends this company" (if true, olive text)
    OR "✗ Does not recommend" (if false, red text)
    Icon + text, text-sm font-medium

SECTION 6 — Footer row
  Left: 
    ReviewHelpfulButton:
      "Helpful ({count})" button
      Default: ghost, border-border text-muted
      If user voted: bg-olive-pale border-olive text-olive
      Disabled if own review
      onClick: toggle helpful vote via server action
      Optimistic update (update count instantly, revert on error)
  
  Right:
    ReviewReportButton:
      "Report" text-xs text-muted hover:text-red-500
      onClick: open ReportModal

── ReportModal (Dialog) ──

shadcn Dialog component

Title: "Report this review"
Subtitle: "Help us keep Watan trustworthy and accurate"

Radio options:
  "This review appears to be fake"
  "This review contains offensive content"
  "This review is about a different company"
  "This review reveals private information"
  "Other"

Optional description textarea (if "Other" selected):
  Placeholder: "Please describe the issue..."

Submit button: "Submit report" olive
Cancel: ghost

On submit:
  Insert to review_flags table
  Show success toast: "Report submitted. We'll review within 48 hours."
  Close modal

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — WRITE REVIEW MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the most important flow in the product.
It must feel trustworthy, clear, and frictionless.

── WriteReviewModal.tsx ──

Triggered from: Company header button, Overview CTA card,
any "Write a review" button across the app.

Implementation: shadcn Dialog, max-w-2xl, 
full screen on mobile (inset-0 on mobile)

State machine:
  currentStep: 1 | 2 | 3 | 4 | 'success'
  formData: accumulated across steps

Modal header (fixed, doesn't scroll):
  Left: Company logo (32px) + name
  Center: Step progress dots (4 dots, filled = completed)
  Right: X close button
  Border-b below header

Modal body (scrollable):
  <AnimatePresence mode="wait">
    Render current step component
    Each step: motion.div key={step}
      initial: opacity 0, x 40
      animate: opacity 1, x 0
      exit: opacity 0, x -40
      transition: duration 0.25

Modal footer (fixed, doesn't scroll):
  Left: "Back" ghost button (hidden on step 1)
  Center: AnonymityBadge
    🔒 "Your identity is protected"
    text-xs text-muted
  Right: "Continue →" olive button (steps 1-3)
         "Submit review" olive button (step 4)
  
  Continue button disabled until step validation passes
  Show loading spinner on submit

── ReviewFormStep1.tsx — "Your role" ──

"Tell us about your experience at {company}"
text-charcoal font-bold text-xl mb-1
"This helps others find relevant reviews" text-muted text-sm mb-8

Fields:

1. Job title (required)
   Input, placeholder: "e.g. Software Engineer"
   Autocomplete from common titles list

2. Employment status (required)
   3 card options (same UI as onboarding job status cards):
   
   🏢 "Current Employee"
      "I currently work here"
   
   📦 "Former Employee"  
      "I no longer work here"
   
   🤝 "Contractor / Freelancer"
      "I worked here on contract"
   
   Selected: border-olive bg-olive-subtle

3. Years at company (show if status selected):
   If current: "How long have you worked here?"
     Dropdown: "Less than 1 year" | "1-2 years" | "3-5 years" | "5+ years"
   If former: "Start year" + "End year" (two number inputs)
     e.g. 2019 → 2022

4. Work location:
   Input, placeholder: "Dubai, UAE" or "Remote"
   
5. Anonymity reminder card:
   Olive-pale bg, rounded-xl, p-4
   Shield icon (olive) + text:
   "Your review will be posted anonymously. 
   We never share your name, employer email, 
   or any identifying information with anyone."
   text-sm text-charcoal

── ReviewFormStep2.tsx — "Rate your experience" ──

"How would you rate {company}?"
text-charcoal font-bold text-xl mb-8

Overall rating (most prominent):
  Label: "Overall rating" font-semibold text-charcoal
  Large interactive stars (5 stars, 40px each)
  Hover: gold fill up to hovered star
  Click: set rating
  Below stars: rating label text
    1: "Very dissatisfied"
    2: "Dissatisfied"  
    3: "Neutral"
    4: "Satisfied"
    5: "Very satisfied"
  Required — cannot proceed without this

5 category ratings (below overall):
  Each category:
    Label (text-sm font-medium text-charcoal)
    5 smaller stars (28px each)
    Optional label text-xs text-muted ml-2
  
  Categories:
    🏛️ Culture & Values
    👔 Senior Management
    ⚖️  Work-Life Balance
    💰 Compensation & Benefits
    📈 Career Growth Opportunities
  
  These are optional (show "optional" label)
  Unanswered stars show as outlined (not filled)

Bottom: recommend toggle
  "Would you recommend {company} to a friend?"
  Large toggle or Yes/No button pair:
    Yes: bg-olive text-white (when selected)
    No: bg-red-50 text-red-600 border-red-200 (when selected)
    Unselected: bg-white border-border text-charcoal

── ReviewFormStep3.tsx — "Write your review" ──

"Tell us more about working at {company}"
text-charcoal font-bold text-xl mb-2
"Be specific and honest. Your review helps thousands of professionals."
text-muted text-sm mb-8

Fields:

1. Review title (required)
   Input, max 100 chars
   Placeholder: "Great culture, but limited growth opportunities"
   Character counter
   
2. Pros (required, min 100 chars)
   Label: "What did you like about working here?" font-semibold
   Textarea, 5 rows
   Placeholder: "Describe the positive aspects — culture, 
   team, management, perks, growth..."
   Character counter: current/100 min (red if under min)
   Helper: "Minimum 100 characters for a helpful review"

3. Cons (required, min 100 chars)
   Label: "What could be improved?"
   Same textarea setup
   Placeholder: "Be constructive — what would make this 
   a better workplace?"

4. Advice to management (optional)
   Label: "Advice to management"
   Textarea, 3 rows
   Placeholder: "What would you tell leadership to improve?"

Content guidelines reminder card:
  Below all fields
  bg-cream border border-border rounded-xl p-4
  "Community guidelines" font-semibold text-sm mb-2
  Bullet points (text-xs text-muted):
    • Be specific and constructive
    • Focus on workplace experience, not personal disputes
    • Do not include names of individuals
    • Do not include confidential company information
    • False or misleading reviews violate our terms

── ReviewFormStep4.tsx — "Almost done!" ──

This step is optional — clearly marked as such.
"Add more detail (optional)" header
"These details help with salary and interview research." text-muted text-sm

Section A: Salary (optional)
  Collapsed by default, "Add salary info +" expand button
  When expanded:
    Currency select (USD/EUR/GBP/AED/JOD/SAR)
    Amount input (numbers only)
    Period: Annual / Monthly / Hourly (segmented control)
    
    Privacy note: "Salary is shown as a range, 
    never your exact figure" text-xs text-muted

Section B: Interview experience (optional)
  Collapsed by default, "Add interview experience +" expand button
  When expanded:
    "How did you get the interview?" 
      Select: Online application / Referral / Recruiter / 
      Career fair / Other
    
    "Overall interview experience"
      3 cards: 😊 Positive / 😐 Neutral / 😟 Negative
    
    "Difficulty level"
      5-point scale pills: Very Easy / Easy / Medium / 
      Hard / Very Hard
    
    "Did you get an offer?"
      Yes / No / Waiting
    
    "Interview questions" (optional)
      Tag input: type question, press Enter to add
      Max 5 questions
      "e.g. Tell me about a time you handled conflict"

── ReviewSuccessState.tsx ──

Replaces modal content after successful submission.
Do NOT close modal — show this state instead.

Large centered animation:
  Olive circle (80px) with white checkmark
  Use Framer Motion:
    Circle: scale 0 → 1, spring bounce
    Checkmark: path draw animation (SVG strokeDashoffset)

"Review submitted!" 
font-bold text-2xl text-charcoal text-center mt-6

"Thank you for helping the community. Your review 
will appear shortly after a quick check."
text-muted text-sm text-center max-w-xs mx-auto mt-2

Stats row (3 items, centered):
  ✓ Anonymous · ✓ Protected · ✓ Verified by community
  text-xs text-muted

Two buttons:
  "View your review" → close modal + scroll to reviews section
  "Review another company" → reset form, close modal, 
  navigate to /companies
  
  Olive filled + olive ghost side by side

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — SALARY & INTERVIEW PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/companies/[slug]/salaries/page.tsx ──

"Salary data at {company}" header
Subtitle: "Based on {N} anonymous submissions"

Top: "Add your salary +" button → opens AddSalaryModal

Table layout (white card):
  Columns: Job Title | Location | Experience | Salary Range | 
           Submissions | Last updated
  
  Group rows by job title
  Sort by: most submissions first
  
  Salary range display:
    Show as range not exact: "$95k – $115k / year"
    Never show individual salary
    Only show if 3+ submissions for that role (privacy threshold)
    Else: "Not enough data" with "Add yours →" link

  Each row hover: bg-olive-subtle/30

AddSalaryModal:
  Simple 4-field form:
    Job title, location, salary amount + currency + period,
    years of experience
  Submit → insert to salaries table
  Success toast

── app/(dashboard)/companies/[slug]/interviews/page.tsx ──

"Interview experiences at {company}" header

Filter row: All | Positive | Negative | Neutral

Interview cards:
  Similar structure to ReviewCard but focused on interview:
  
  Role applied for + date
  How they applied (Online / Referral etc.)
  Experience badge: 😊 Positive / 😐 Neutral / 😟 Negative
  Difficulty badge: Easy / Medium / Hard etc.
  Offer received: Yes ✓ / No ✗ / Waiting...
  
  Interview questions section (if provided):
    "Questions asked:" label
    Bulleted list of questions in olive-subtle pills
  
  Helpful button + Report button (same as review cards)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — SERVER ACTIONS & QUERIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lib/reviews/actions.ts

submitReview(data: ReviewFormData): Promise<ActionResult>
  - Auth check (must be logged in)
  - Check: has user already reviewed this company?
    If yes: return { error: "You have already reviewed this company" }
  - Validate with ReviewSchema (Zod)
  - Insert to reviews table WITH reviewer_id (clerk userId)
    But NEVER return reviewer_id in any response
  - If salary data included: also insert to salaries table
  - Supabase trigger auto-updates company rating aggregates
  - Return { success: true, reviewId }

toggleHelpfulVote(reviewId: string): Promise<ActionResult>
  - Auth check
  - Check if vote exists for (reviewer_id + review_id)
  - If exists: delete it (un-vote)
  - If not: insert it
  - Return { success: true, newCount: number, voted: boolean }

flagReview(reviewId: string, reason: string, 
           description?: string): Promise<ActionResult>
  - Auth check
  - Insert to review_flags
  - Increment reviews.flagged_count
  - If flagged_count >= 5: auto-set status to 'flagged' 
    (pending moderation)
  - Return { success: true }

lib/reviews/queries.ts

getCompanyReviews(companyId: string, options: {
  sort: 'recent'|'helpful'|'highest'|'lowest',
  status: 'current'|'former'|'all',
  page: number,
  limit: number
}): Promise<{ reviews: Review[], total: number }>
  IMPORTANT: Never select reviewer_id column

getReviewById(id: string): Promise<Review | null>
getUserVotedReviews(clerkUserId: string): Promise<string[]>
  Returns array of review IDs the user has upvoted

hasUserReviewedCompany(clerkUserId: string, 
  companyId: string): Promise<boolean>

lib/companies/queries.ts

getCompanyBySlug(slug: string): Promise<Company | null>
getCompanies(filters: CompanyFilters): Promise<{
  companies: Company[], 
  total: number 
}>
searchCompanies(query: string, limit = 6): Promise<Company[]>
getCompanySalaries(companyId: string): Promise<SalarySummary[]>
  Group by job_title, return averages (min 3 submissions)
getCompanyInterviews(companyId: string): Promise<Interview[]>

lib/companies/actions.ts

addCompany(data: AddCompanyData): Promise<ActionResult>
  - Auth check
  - Validate
  - Generate slug from name (slugify)
  - Check slug uniqueness
  - Insert to companies table
  - Return { success: true, slug }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — ZOD SCHEMAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lib/reviews/schema.ts

export const ReviewStep1Schema = z.object({
  job_title: z.string().min(2).max(100),
  employment_status: z.enum(['current','former','contractor']),
  years_at_company: z.string().optional(),
  employment_start_year: z.number().optional(),
  employment_end_year: z.number().optional(),
  work_location: z.string().min(2).max(100)
})

export const ReviewStep2Schema = z.object({
  overall_rating: z.number().int().min(1).max(5),
  culture_rating: z.number().int().min(1).max(5).optional(),
  management_rating: z.number().int().min(1).max(5).optional(),
  worklife_rating: z.number().int().min(1).max(5).optional(),
  compensation_rating: z.number().int().min(1).max(5).optional(),
  growth_rating: z.number().int().min(1).max(5).optional(),
  recommends_company: z.boolean().optional()
})

export const ReviewStep3Schema = z.object({
  title: z.string().min(10).max(100),
  pros: z.string().min(100).max(2000),
  cons: z.string().min(100).max(2000),
  advice_to_management: z.string().max(1000).optional()
})

export const ReviewStep4Schema = z.object({
  salary_amount: z.number().positive().optional(),
  salary_currency: z.string().optional(),
  salary_period: z.enum(['annual','monthly','hourly']).optional(),
  interview_difficulty: z.enum(
    ['easy','medium','hard','very_hard']).optional(),
  interview_experience: z.enum(
    ['positive','negative','neutral']).optional(),
  interview_questions: z.array(z.string()).max(5).optional(),
  got_offer: z.boolean().optional()
})

export const FullReviewSchema = ReviewStep1Schema
  .merge(ReviewStep2Schema)
  .merge(ReviewStep3Schema)
  .merge(ReviewStep4Schema)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — ANONYMITY SYSTEM (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Anonymity is Watan's most important trust feature.
Implement it with zero compromise.

Database layer:
  reviewer_id stored in DB but NEVER returned via API
  Create Postgres view: public_reviews
    SELECT all review columns EXCEPT reviewer_id
  All public queries use this view, never the raw table
  
  RLS policies:
    SELECT on public_reviews: allow for authenticated users
    SELECT on reviews: allow only WHERE reviewer_id = auth.uid()
      (users can see their own full review)
    INSERT on reviews: allow for authenticated users
    UPDATE/DELETE on reviews: allow WHERE reviewer_id = auth.uid()

Application layer:
  ReviewCard component: NEVER receives or displays reviewer_id
  Anonymous display shows ONLY:
    Job title
    Employment status + approximate tenure
    Work location (city level, never exact)
    Month + Year only (never exact date)
  
  DO NOT show:
    Full name
    Profile photo
    LinkedIn
    Exact dates
    Any identifying information

AnonymityBadge.tsx:
  Used in: WriteReviewModal, ReviewCard footer, 
           CompanyProfile sidebar CTA
  
  Design: 
    🔒 icon (Lucide Lock, 14px, olive)
    "Anonymous review — your identity is always protected"
    text-xs text-muted
    
  Extended version (in modal):
    Shield icon (larger, olive-pale bg)
    Title: "Your identity is protected"
    font-semibold text-sm text-charcoal
    
    3 bullet points:
      ✓ Your name is never shown
      ✓ We never share reviewer data with employers
      ✓ Your review cannot be traced back to you
    
    text-xs text-muted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — EDGE CASES & STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Handle all these states:

Company with no reviews yet:
  CompanyRatings: show empty state with illustration
  "No reviews yet" + "Be the first to review" CTA
  Overall rating shows "--" not 0

Company with 1-2 reviews:
  Show rating but add disclaimer:
  "Based on limited data. Rating may not be representative."
  text-xs text-muted italic

Review text too short (< 100 chars):
  Inline red error below textarea
  Continue button disabled
  Character counter turns red

User tries to review own company:
  Detect if review job_title + company matches profile's 
  current_company
  Show warning modal: "Are you reviewing your current employer?
  Remember our guidelines require honest, accurate reviews."
  Let them proceed but flag for extra moderation check

User already reviewed this company:
  "Write a review" button replaced with:
  "You reviewed this company · Edit review"
  Edit opens same modal pre-filled with their data

Network error during review submission:
  Show error toast: "Something went wrong. Your review was saved 
  as a draft."
  Save form data to localStorage under key 'watan_review_draft_{companyId}'
  On next modal open for same company: 
  "You have an unsaved draft. Continue where you left off?"
  Yes/No options

Review flagged (status = 'flagged'):
  Don't show to other users
  Show to reviewer: "Your review is under review by our team"
  Show estimated resolution time

Review removed (status = 'removed'):
  Don't show in list
  If reviewer accesses their profile reviews:
  Show grayed out card: "This review was removed for 
  violating community guidelines"
  Link to guidelines

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- TypeScript strict, no any types
- reviewer_id NEVER exposed through any component or API response
- Optimistic updates on helpful votes (instant UI, background sync)
- All forms: React Hook Form + Zod, real-time validation
- Company rating bars: always animate on mount (Framer Motion)
- Star inputs: smooth hover and click interactions
- All cards: consistent hover lift animations
- WriteReviewModal: step transitions with AnimatePresence
- Mobile: modal is full screen drawer on mobile
- Loading skeletons match exact component dimensions
- Proper og:tags on company pages for social sharing
- Slug generation: lowercase, hyphens, no special chars
  "Google Dubai" → "google-dubai"
- revalidatePath('/companies/[slug]') after review submit
- Error boundaries on each major section

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELIVER IN THIS ORDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SQL schema (as comment block)
lib/reviews/schema.ts
lib/reviews/utils.ts
lib/reviews/queries.ts
lib/reviews/actions.ts
lib/companies/queries.ts
lib/companies/actions.ts
components/review/AnonymityBadge.tsx
components/review/ReviewStarInput.tsx
components/review/ReviewCategoryRatings.tsx
components/review/ReviewFormStep1.tsx
components/review/ReviewFormStep2.tsx
components/review/ReviewFormStep3.tsx
components/review/ReviewFormStep4.tsx
components/review/ReviewSuccessState.tsx
components/review/ReviewHelpfulButton.tsx
components/review/ReviewReportButton.tsx
components/review/WriteReviewModal.tsx
components/companies/CompanyCard.tsx
components/companies/CompanyFilters.tsx
components/companies/CompanySearch.tsx
components/companies/CompanyDirectory.tsx
components/company-profile/CompanyHeader.tsx
components/company-profile/CompanyNav.tsx
components/company-profile/CompanyOverview.tsx
components/company-profile/CompanyRatings.tsx
components/company-profile/CompanyReviewCard.tsx
components/company-profile/CompanyReviewsList.tsx
components/company-profile/CompanySalaries.tsx
components/company-profile/CompanyInterviews.tsx
components/company-profile/CompanyJobs.tsx
app/(dashboard)/companies/page.tsx
app/(dashboard)/companies/loading.tsx
app/(dashboard)/companies/[slug]/page.tsx
app/(dashboard)/companies/[slug]/loading.tsx
app/(dashboard)/companies/[slug]/salaries/page.tsx
app/(dashboard)/companies/[slug]/interviews/page.tsx

No summaries. No placeholders. Every file complete.
Zero compromise on anonymity implementation.