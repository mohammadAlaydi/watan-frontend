You are continuing to build "Watan" — a professional network for Palestinian
professionals worldwide. Landing page, auth, onboarding, dashboard, profile,
company profiles, and review system are all built.

Now build the complete Jobs Board and Apply Flow.
This is the feature that drives daily active usage and employer revenue.

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
    jobs/
      page.tsx                    ← jobs board (search + listings)
      loading.tsx                 ← skeleton
      [id]/
        page.tsx                  ← full job detail page
        loading.tsx
    saved-jobs/
      page.tsx                    ← user's saved jobs
    applications/
      page.tsx                    ← user's job applications history

components/
  jobs/
    JobsBoard.tsx                 ← main board layout (split view)
    JobsList.tsx                  ← scrollable left panel
    JobCard.tsx                   ← card in list panel
    JobCardCompact.tsx            ← compact version for saved/applied
    JobDetail.tsx                 ← right panel full job view
    JobFilters.tsx                ← filter sidebar / drawer
    JobSearch.tsx                 ← search bar with suggestions
    JobSortBar.tsx                ← sort + results count
    JobMatchBadge.tsx             ← "94% match" indicator
    JobStatusBadge.tsx            ← Remote/Hybrid/On-site badge
    SaveJobButton.tsx             ← bookmark toggle button
    ApplyModal.tsx                ← full application flow modal
    ApplyStep1.tsx                ← contact info + resume
    ApplyStep2.tsx                ← cover letter + questions
    ApplyStep3.tsx                ← review + submit
    ApplySuccessState.tsx         ← post-apply success screen
    ApplicationCard.tsx           ← card for applications history
    JobsEmptyState.tsx            ← no results state
    JobAlertsBanner.tsx           ← set up job alerts CTA

lib/
  jobs/
    queries.ts                    ← all job Supabase queries
    actions.ts                    ← server actions
    schema.ts                     ← Zod schemas
    utils.ts                      ← matching score, formatting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — SUPABASE SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Output as SQL comment block:

-- JOBS TABLE
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  -- Core info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,           -- rich text / markdown
  requirements TEXT[],                 -- array of requirement strings
  responsibilities TEXT[],             -- array of responsibility strings
  nice_to_have TEXT[],                 -- optional nice to haves

  -- Classification
  department TEXT,                     -- "Engineering", "Design", etc.
  seniority TEXT,                      -- "junior","mid","senior","lead",
                                       -- "manager","director","vp","c-level"
  employment_type TEXT,                -- "full-time","part-time",
                                       -- "contract","internship"
  work_arrangement TEXT,               -- "remote","hybrid","on-site"

  -- Location
  country TEXT,
  city TEXT,
  timezone_requirement TEXT,           -- "UTC+3 to UTC+5" or "Any"

  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  salary_period TEXT DEFAULT 'annual', -- "annual","monthly","hourly"
  salary_public BOOLEAN DEFAULT TRUE,  -- employer can hide salary

  -- Application
  apply_type TEXT DEFAULT 'internal',  -- "internal","external","email"
  external_apply_url TEXT,             -- if apply_type = external
  apply_email TEXT,                    -- if apply_type = email
  application_questions JSONB,         -- [{question, required, type}]
  resume_required BOOLEAN DEFAULT TRUE,
  cover_letter_required BOOLEAN DEFAULT FALSE,

  -- Targeting (Palestinian professionals focus)
  welcomes_diaspora BOOLEAN DEFAULT TRUE,
  visa_sponsorship BOOLEAN DEFAULT FALSE,
  relocation_assistance BOOLEAN DEFAULT FALSE,
  arabic_required BOOLEAN DEFAULT FALSE,
  arabic_preferred BOOLEAN DEFAULT FALSE,

  -- Status
  status TEXT DEFAULT 'active',        -- "active","paused","closed","draft"
  featured BOOLEAN DEFAULT FALSE,      -- paid featured placement
  expires_at TIMESTAMPTZ,

  -- Engagement
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0,
  saved_count INTEGER DEFAULT 0,

  -- Meta
  posted_by TEXT NOT NULL,             -- clerk_user_id of poster
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- JOB APPLICATIONS
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id TEXT NOT NULL,          -- clerk_user_id

  -- Application data
  resume_url TEXT,                     -- Supabase storage URL
  cover_letter TEXT,
  answers JSONB,                       -- [{question_id, answer}]
  linkedin_url TEXT,
  portfolio_url TEXT,

  -- Status
  status TEXT DEFAULT 'submitted',     -- "submitted","reviewing",
                                       -- "interview","offer","rejected",
                                       -- "withdrawn"
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Meta
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(job_id, applicant_id)         -- one application per job
);

-- SAVED JOBS
CREATE TABLE saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,               -- clerk_user_id
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, user_id)
);

-- JOB ALERTS
CREATE TABLE job_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,              -- clerk_user_id
  name TEXT NOT NULL,                 -- "Senior Engineer, Remote"
  keywords TEXT[],
  locations TEXT[],
  departments TEXT[],
  seniority TEXT[],
  work_arrangement TEXT[],
  salary_min INTEGER,
  frequency TEXT DEFAULT 'weekly',    -- "daily","weekly","instant"
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES:
-- jobs: anyone can read active jobs
-- jobs: authenticated users can insert (for employers)
-- jobs: poster can update/delete own jobs
-- applications: applicant can read own applications only
--   (company cannot read applicant personal data without consent)
-- applications: authenticated users can insert
-- applications: applicant can update (withdraw) own applications
-- saved_jobs: users can read/insert/delete own saved jobs
-- job_alerts: users can read/insert/update/delete own alerts

-- INDEX for performance:
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX idx_jobs_featured ON jobs(featured, created_at DESC);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — JOBS BOARD PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/jobs/page.tsx ──

Server component.
Accept searchParams: { q, department, seniority, arrangement,
country, salary_min, sort, page, id }

The ?id= param: if present, pre-select that job in detail panel.

Fetch in parallel:
  - Jobs list (with filters applied, 20 per batch)
  - Total count for filters
  - User's saved job IDs (to show bookmark state)
  - User's applied job IDs (to show applied state)
  - User profile (for match score calculation)

Pass all to <JobsBoard /> client component.

── JobsBoard.tsx ──

Client component — manages selected job state.

Page header (above split view):
  H1: "Jobs" font-bold text-3xl text-charcoal
  Subtitle: "Opportunities curated for Palestinian professionals"
  text-muted text-sm
  
  Right: "Post a job" olive outline button
    → opens PostJobModal (simple form for employers)

<JobAlertsBanner /> (below header, dismissible)

Split view layout (below header):
  Left panel (420px, fixed height, overflow-y-scroll):
    <JobSearch />
    <JobSortBar />
    <JobsList /> with selectedJobId state

  Right panel (flex-1, sticky, overflow-y-scroll):
    If selectedJobId: <JobDetail jobId={selectedJobId} />
    Else: <JobDetailPlaceholder /> (illustrated empty state)

  Mobile (below 768px):
    Single column
    JobsList full width
    Clicking a card: navigate to /jobs/[id] (separate full page)
    No split view on mobile

State management:
  selectedJobId: string | null (useState)
  When user clicks JobCard: setSelectedJobId(job.id)
  Update URL: router.push(?id=jobId) without page reload
    (so URL is shareable and back button works)
  
  When selectedJobId changes:
    Right panel scrolls to top
    Fetch full job details if not already loaded
    (Use SWR or React cache for client-side caching)

── JobSearch.tsx ──

Sticky top of left panel.
White bg, border-b, p-4.

Row 1: Main search input
  Full width, h-11, rounded-xl
  Lucide Search icon left (olive on focus)
  Placeholder: "Job title, keyword, or company..."
  Clear X button when has value
  
  On type (300ms debounce):
    Show autocomplete dropdown (max 6 items)
    Two sections:
      "Job titles": matching titles from jobs
      "Companies": matching company names
    Each item: icon + label + count
    Click: populate search + close dropdown
  
  On submit: update URL searchParams

Row 2: Quick filter pills (horizontal scroll, no wrap)
  "Remote" | "Full-time" | "Senior" | "Visa Sponsorship"
  | "Arabic Preferred" | "Featured"
  
  Each pill: 
    Default: bg-white border border-border text-charcoal text-xs
    Active: bg-olive text-white border-olive
    Hover: bg-olive-subtle
    rounded-full px-3 py-1.5 font-medium

── JobSortBar.tsx ──

Row below search, p-4 pt-0.
  
Left: "{N} jobs found" text-sm text-muted
  If filters active: " · Filtered" text-olive

Right: Sort select
  "Most recent" | "Best match" | "Salary: High to Low" 
  | "Most applications"
  
  shadcn Select component, small variant
  Default: "Best match" (uses match score algorithm)

── JobsList.tsx ──

Scrollable list, divide-y divide-border.

If loading: show 5 <JobCard.skeleton /> 

If no results: <JobsEmptyState />

For each job: <JobCard />

"Load more" button at bottom:
  "Show 20 more jobs" olive outline button
  Appends next batch (no page reload)
  Shows loading spinner while fetching

── JobCard.tsx ──

This is the most interacted component on the jobs board.
Build it with precision.

Props: job, isSelected, isSaved, isApplied, matchScore,
       onSelect, onSaveToggle

Container:
  p-4 cursor-pointer border-b border-border
  transition-colors duration-150
  
  Default: bg-white hover:bg-olive-subtle/40
  Selected: bg-olive-subtle border-l-4 border-l-olive
  Applied: slight opacity reduction on non-selected state

On click: call onSelect(job.id)

Layout:

ROW 1: Company + Save button
  Left: 
    Company logo (36px rounded-lg, olive-pale bg, initials fallback)
    Company name: text-sm text-muted font-medium ml-2
  Right: 
    <SaveJobButton isSaved={isSaved} onToggle={onSaveToggle} />

ROW 2: Job title
  font-bold text-charcoal text-base leading-tight
  If featured: gold star icon inline before title ✦

ROW 3: Key details (flex wrap, gap-2)
  <JobStatusBadge arrangement={work_arrangement} />
  Location pill: "📍 Dubai, UAE" text-xs
  Seniority pill: "Senior" text-xs bg-cream border
  All: rounded-md px-2 py-0.5 text-xs text-muted border border-border

ROW 4: Salary + Match
  Left: Salary range
    If salary_public and salary_min/max:
      "$95k – $115k / yr" text-sm font-semibold text-charcoal
    Else: "Salary not disclosed" text-sm text-muted italic
  
  Right: <JobMatchBadge score={matchScore} />

ROW 5: Tags row
  "Visa Sponsorship ✓" if visa_sponsorship
  "Relocation ✓" if relocation_assistance
  "Arabic preferred" if arabic_preferred
  Each: text-xs olive text-[10px] font-medium
  Only show if true

ROW 6: Footer
  Left: Time ago (date-fns formatDistanceToNow)
    text-xs text-muted
    If posted < 24hrs ago: "🆕 New today" in gold text
    If featured: "⭐ Featured" in gold text
  
  Right: Application count
    "{N} applicants" text-xs text-muted
    If > 100: "100+ applicants" (social proof)

── JobMatchBadge.tsx ──

Props: score (0–100)

If score >= 80:
  bg-green-50 text-green-700 border border-green-200
  "⚡ {score}% match"

If score 60-79:
  bg-olive-pale text-olive border border-olive/20
  "{score}% match"

If score < 60:
  Don't show badge (return null)

Score is: text-xs font-bold rounded-full px-2 py-0.5

── JobStatusBadge.tsx ──

Props: arrangement: "remote" | "hybrid" | "on-site"

Remote: 
  bg-blue-50 text-blue-700 border border-blue-200
  "🌐 Remote"

Hybrid:
  bg-purple-50 text-purple-700 border border-purple-200
  "⚡ Hybrid"

On-site:
  bg-gray-50 text-gray-600 border border-gray-200
  "🏢 On-site"

All: text-xs font-medium rounded-full px-2.5 py-1

── SaveJobButton.tsx ──

Client component.
Props: isSaved, onToggle, jobId

Button: ghost, p-1.5, rounded-lg
  Default: Lucide Bookmark icon, stroke-only, text-muted
    hover: text-olive bg-olive-subtle
  Saved: Lucide BookmarkCheck icon, fill-olive text-olive

Optimistic update:
  Click → immediately toggle local state
  Call server action in background
  On error: revert state + show toast "Failed to save job"

Animation:
  Framer Motion: scale 0.8 → 1.1 → 1 on toggle (spring)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — JOB DETAIL PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── JobDetail.tsx ──

Right panel content. Also used in /jobs/[id] full page.
Props: jobId (fetches own data with SWR/cache)

Sticky top action bar (white, border-b, p-4):
  Left:
    Company logo (40px) + company name text-sm text-muted
    Job title: font-bold text-xl text-charcoal mt-0.5
  
  Right: action buttons
    <SaveJobButton />
    
    If already applied:
      "Applied ✓" button — disabled, bg-olive-pale text-olive
    Else:
      "Apply now" button — bg-olive text-white font-semibold
      px-5 py-2.5 rounded-xl hover:bg-charcoal
      onClick: open <ApplyModal />
    
    Share button (ghost icon)

Scrollable content below:

SECTION 1: Key details grid
  White card, rounded-2xl, border, p-5, mb-4
  
  2x3 grid of detail items:
    Each: icon + label (tiny muted) + value (font-medium charcoal)
    
    Items:
      💼 Employment: "Full-time"
      🌐 Arrangement: "Remote"
      📍 Location: "Dubai, UAE"
      💰 Salary: "$95k – $115k / yr" (or "Not disclosed")
      📅 Posted: "3 days ago"
      👥 Team size: company size
  
  Tags row below grid (border-t pt-3):
    Visa sponsorship badge (if true): 
      ✈️ "Visa sponsorship available" 
      bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs
    
    Relocation badge (if true):
      📦 "Relocation assistance"
      bg-purple-50 text-purple-700
    
    Arabic badge (if required/preferred):
      "Arabic required" or "Arabic preferred"
      bg-olive-pale text-olive

SECTION 2: About the role
  White card, rounded-2xl, border, p-5, mb-4
  
  "About this role" font-bold text-lg text-charcoal mb-3
  
  Description rendered as formatted text
  Support basic markdown: **bold**, bullet lists, headers
  Use a lightweight markdown renderer (react-markdown or custom)

SECTION 3: Responsibilities
  White card, rounded-2xl, border, p-5, mb-4
  
  "What you'll do" font-bold mb-3
  
  Bullet list:
    Each item: flex gap-3
    Left: olive dot or checkmark circle (8px)
    Right: text-sm text-charcoal leading-relaxed

SECTION 4: Requirements
  White card, rounded-2xl, border, p-5, mb-4
  
  "What we're looking for" font-bold mb-3
  
  Two sub-sections:
    "Required" — solid olive bullets
    "Nice to have" — outline olive bullets, text-muted
  
  Same bullet list layout

SECTION 5: About the company
  White card, rounded-2xl, border, p-5, mb-4
  
  Company logo (48px) + name + industry + size
  Company description (truncated to 3 lines, "Read more" toggle)
  
  Overall rating display: stars + number + "{N} reviews"
  "View company profile →" link text-olive

SECTION 6: Apply CTA (bottom of detail)
  Large olive card, rounded-2xl, p-6
  bg-olive text-white
  
  "Ready to apply?" font-bold text-xl
  "Join {N} other applicants" text-white/70 text-sm
  
  If not applied:
    "Apply now →" button 
    bg-white text-olive font-bold rounded-xl px-8 py-3
    onClick: open ApplyModal
  
  If applied:
    "✓ Application submitted" 
    bg-white/20 text-white rounded-xl px-8 py-3
    "Submitted {timeAgo}" text-white/60 text-sm mt-1

── app/(dashboard)/jobs/[id]/page.tsx ──

Server component (for direct URL access and mobile).
Fetch job by id.
If not found: notFound()

Full page layout (no split view):
  Max-w-3xl mx-auto px-6 py-8
  
  Back button: "← All jobs" link to /jobs
  
  Then full <JobDetail /> content
  
  Apply button: sticky bottom bar on mobile
    Fixed bottom-0 full width
    White bg border-t
    Apply button + Save button side by side

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — APPLY MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This flow must feel effortless and trustworthy.
Pre-fill everything possible from user profile.
Minimize friction at every step.

── ApplyModal.tsx ──

shadcn Dialog, max-w-xl
Full screen sheet on mobile (bottom drawer)

Modal header (fixed):
  Company logo (28px) + "Applying to" text-xs text-muted
  + Job title font-bold text-charcoal
  Step indicator: "Step {N} of 3" text-xs text-muted ml-auto
  X close button

Progress bar:
  Thin 3px bar full width below header
  Fills proportionally: step1=33%, step2=66%, step3=100%
  Animate width with Framer Motion

Modal body (scrollable, p-6):
  <AnimatePresence mode="wait">
    Current step component
    Same slide animation as review modal:
      initial: opacity 0, x: 40
      animate: opacity 1, x: 0
      exit: opacity 0, x: -40

Modal footer (fixed):
  Left: Back ghost button (hidden on step 1)
  Right: 
    Step 1-2: "Continue →" olive button
    Step 3: "Submit application" olive button
  
  Loading state on submit:
    Button shows spinner + "Submitting..."
    Disabled during submission

── ApplyStep1.tsx — "Your application" ──

"Apply to {jobTitle} at {company}"
text-xl font-bold text-charcoal mb-1
"Review your details before applying" text-muted text-sm mb-6

Pre-filled from Clerk + Supabase profile.
User can edit before submitting.

Fields:

1. Full name (required)
   Pre-filled: profile.full_name
   Input

2. Email address (required)  
   Pre-filled: Clerk user email
   Input, type email
   Cannot edit primary email (from Clerk)
   Small lock icon + "Verified email" label

3. Phone number (optional)
   Input with country code prefix select
   Placeholder: "+971 50 XXX XXXX"

4. Resume (required if job.resume_required)
   
   If profile.resume_url exists:
     Show current resume:
       File icon + "resume.pdf" + "Update" link
       Green checkmark ✓
   
   Upload zone:
     Dashed border, rounded-xl, p-6
     "Upload your resume" text center
     "PDF, DOC, DOCX · Max 5MB" text-muted text-xs
     "Browse files" olive button
     Drag & drop supported
     
     Upload to Supabase storage bucket "resumes"
     Show progress bar during upload
     Show file name + remove X on success

5. LinkedIn profile URL (optional)
   Pre-filled: profile.linkedin_url
   Input with LinkedIn icon

6. Portfolio / personal website (optional)
   Input with globe icon

── ApplyStep2.tsx — "Tell them more" ──

"Stand out from the crowd" text-xl font-bold mb-1
"A great cover letter can make the difference" text-muted text-sm mb-6

1. Cover letter
   Label row:
     "Cover letter" font-semibold
     Badge: "Required" (olive) or "Optional" (muted)
     based on job.cover_letter_required

   Textarea, 8 rows
   Placeholder:
     "Dear Hiring Manager,
     
     I'm excited to apply for the {jobTitle} role at {company}.
     [Tell them why you're a great fit...]"
   
   Character counter: {count}/2000
   AI assist button (future feature placeholder):
     Small ghost button "✨ Get suggestions"
     Shows tooltip: "Coming soon — AI-powered cover letter help"

2. Custom application questions
   If job.application_questions exists and has items:
   
   "Additional questions" section header
   
   For each question in job.application_questions:
     Label: question.question text
     Required indicator if question.required
     
     If question.type === "text": Input
     If question.type === "textarea": Textarea 4 rows
     If question.type === "select": shadcn Select with options
     If question.type === "boolean": Yes/No toggle cards
   
   If no custom questions:
     Don't show this section

── ApplyStep3.tsx — "Review & submit" ──

"Review your application" text-xl font-bold mb-1
"Make sure everything looks right" text-muted text-sm mb-6

Application summary card:
  White bg, rounded-2xl, border, p-5

  Job section:
    Company logo + company name
    Job title (bold)
    Work arrangement + location
    Salary range

  Divider

  Your info section:
    Full name
    Email
    Resume: filename with PDF icon
    LinkedIn: if provided

  Divider

  Cover letter preview:
    First 200 chars + "..."
    "Edit" link → goes back to step 2

  Divider

  Custom answers preview (if any):
    Each question + truncated answer

Submission agreement:
  Checkbox (required to enable submit button):
  "I confirm this application is accurate and complete.
  I agree to Watan's terms and privacy policy."
  text-sm text-charcoal

Important notice card (bg-olive-subtle, rounded-xl, p-4):
  "📤 How your application works"
  text-sm font-semibold text-charcoal mb-2
  
  Bullet points text-sm text-muted:
    • Your application goes directly to the employer
    • Watan does not screen or filter applications
    • The employer will contact you directly
    • You can withdraw your application at any time
    • Your contact info is shared with the employer

── ApplySuccessState.tsx ──

Same structure as ReviewSuccessState but for applications.

Animation:
  Large olive circle with white paper plane icon
  Scale + fade in on mount

"Application submitted! ✈️"
font-bold text-2xl text-charcoal text-center mt-6

"Your application has been sent to {company}.
Good luck — we're rooting for you! 🤝"
text-muted text-sm text-center max-w-xs mx-auto mt-2

What happens next card:
  White bg, rounded-xl, border, p-4, mt-6

  Timeline steps:
    Each: circle number + title + description
    
    1. "Application received"
       "The employer has received your application"
       Status: ✓ Done (olive)
    
    2. "Under review"
       "They'll review your application soon"
       Status: ⏳ Pending (muted)
    
    3. "Hear back"
       "Expect to hear back within 1-2 weeks"
       Status: ⏳ Pending (muted)

Two buttons:
  "View my applications" → close modal + navigate to /applications
  "Browse more jobs" → close modal, stay on jobs page

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — JOB FILTERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── JobFilters.tsx ──

Desktop: sticky left sidebar (280px)
Mobile: bottom sheet drawer (Sheet component from shadcn)
  Triggered by "Filters" button with active count badge

Mobile filter button (visible only on mobile):
  Fixed bottom-right
  Circular olive button with filter icon
  Badge: number of active filters

Filter sections (same pattern as CompanyFilters):

  Work arrangement (radio):
    All | Remote | Hybrid | On-site

  Department (checkboxes):
    Engineering, Design, Product, Marketing, Sales,
    Finance, Operations, HR, Legal, Data, Other
    Show 6 + expand

  Seniority (checkboxes):
    Internship, Junior, Mid-level, Senior, 
    Lead, Manager, Director, VP, C-Level

  Salary range (dual slider):
    Min and Max inputs
    Currency select: USD/EUR/GBP/AED/JOD
    Range: $0 – $300k+
    "Show jobs without salary info" toggle below

  Location:
    Country select (searchable)
    "Remote only" toggle overrides country

  Employment type:
    Full-time, Part-time, Contract, Internship (checkboxes)

  Special filters (toggles):
    ✈️ Visa sponsorship available
    📦 Relocation assistance
    🌙 Arabic required
    🌙 Arabic preferred
    ⭐ Featured jobs only

  Posted date:
    Any time | Last 24 hours | Last week | Last month
    Radio buttons

  "Apply filters" button (primary, full width)
    Only shows on mobile (desktop: auto-apply on change)
  
  "Clear all filters" link
    Shows only when filters are active
    text-olive text-sm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — SAVED JOBS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/saved-jobs/page.tsx ──

Server component.
Fetch all saved jobs for current user (with full job data joined).
Sort by saved_at desc.

Layout: max-w-4xl mx-auto px-6 py-8

Header:
  H1: "Saved Jobs" + bookmark icon
  Subtitle: "{N} saved jobs" text-muted

If no saved jobs:
  Centered EmptyState:
    Bookmark icon in olive circle
    "No saved jobs yet"
    "Save jobs you're interested in to review later"
    "Browse jobs →" olive button → /jobs

Jobs list:
  <JobCardCompact /> for each saved job
  
  Grid: 1 column (full width cards, more detail than list panel)

── JobCardCompact.tsx ──

Wider card with more info than the list panel JobCard.
White bg, rounded-2xl, border, p-5, mb-3

Left: Company logo (48px rounded-xl)

Right: full info
  Row 1: Company name text-sm text-muted + 
         SaveJobButton (remove from saved)
  Row 2: Job title font-bold text-lg text-charcoal
  Row 3: Tags (arrangement, location, seniority)
  Row 4: Salary + Match badge
  Row 5: 
    Left: "Saved {timeAgo}" text-xs text-muted
    Right: "Apply now →" olive button (small)

Status overlay (if job is closed):
  Orange banner across top of card:
  "⚠️ This position has been filled" text-sm
  Entire card: opacity-60

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — APPLICATIONS PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/applications/page.tsx ──

Server component.
Fetch all applications for current user
with job + company data joined.
Sort by applied_at desc.

Layout: max-w-4xl mx-auto px-6 py-8

Header:
  H1: "My Applications"
  Subtitle: "{N} total applications" text-muted

Stats row:
  4 stat pills:
    Applied: total count
    Reviewing: count where status = reviewing
    Interview: count where status = interview
    Offers: count where status = offer
  
  Each pill: number + label
  Color coded:
    Applied: olive
    Reviewing: blue
    Interview: gold
    Offer: green

Filter tabs:
  All | Submitted | Under Review | Interview | Offer | Rejected

Applications list:
  <ApplicationCard /> for each

── ApplicationCard.tsx ──

White bg, rounded-2xl, border, p-5, mb-3

Left border (4px) color based on status:
  submitted: border-muted
  reviewing: border-blue-400
  interview: border-gold
  offer: border-green-400
  rejected: border-red-400
  withdrawn: border-gray-300

Layout:

ROW 1: Company + Status badge
  Company logo (40px) + company name + job title
  Right: Status badge
    submitted: "Submitted" bg-muted/20 text-muted
    reviewing: "Under review" bg-blue-50 text-blue-700
    interview: "Interview" bg-gold/20 text-yellow-700
    offer: "Offer received! 🎉" bg-green-50 text-green-700
    rejected: "Not selected" bg-red-50 text-red-600
    withdrawn: "Withdrawn" bg-gray-50 text-gray-500

ROW 2: Job details
  Work arrangement + location + seniority
  Salary range
  text-sm text-muted

ROW 3: Timeline
  "Applied {timeAgo}" · "Status updated {timeAgo}"
  text-xs text-muted

ROW 4: Actions
  "View job" → /jobs/[id] (ghost button)
  
  If status = submitted or reviewing:
    "Withdraw application" → red ghost text button
    onClick: confirm dialog → withdraw action
  
  If status = interview or offer:
    "🎉 Congratulations!" — celebratory text
    No withdraw option

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — JOB ALERTS BANNER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── JobAlertsBanner.tsx ──

Shown at top of jobs board if user has no alerts set up.
Dismissible (localStorage flag).

Design:
  Warm gradient card: 
    bg-gradient-to-r from-olive-subtle to-cream
  Border border-olive/20, rounded-2xl, p-4, mb-4

Content row:
  Left: bell icon (olive, 20px) with animated ring
    CSS animation: rotate ±15deg, 0.5s, ease, 2x on mount

  Text:
    "Never miss a relevant job"
    font-semibold text-charcoal text-sm
    "Get notified when new jobs match your profile"
    text-muted text-xs

  Right:
    "Set up alerts" olive filled button (small)
    onClick: open CreateAlertModal
    
    X dismiss button (ghost icon, text-muted)

CreateAlertModal (shadcn Dialog, max-w-md):
  "Create a job alert" title
  
  Fields:
    Alert name: Input ("e.g. Senior Engineer, Remote")
    Keywords: tag input
    Location: country select
    Department: multi-select pills
    Frequency: 
      3 cards: Daily / Weekly / Instant
      Instant: "As soon as a job is posted"
      Weekly: "Every Monday morning"
  
  "Create alert" olive button
  
  On save: insert to job_alerts table
  Success toast: "Alert created! We'll notify you by email."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — MATCH SCORE ALGORITHM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lib/jobs/utils.ts

calculateMatchScore(job: Job, profile: Profile): number

Returns 0–100 score. Pure function, no DB calls.

Scoring breakdown (weights must add to 100):

  Role match (25 points):
    Check if job.title contains words from profile.preferred_roles
    Exact match: 25 pts
    Partial match (1+ words): 15 pts
    No match: 0 pts

  Seniority match (20 points):
    Map profile.years_experience to seniority level:
      0-1 → junior
      1-3 → junior/mid
      3-5 → mid/senior
      5-10 → senior/lead
      10+ → lead/manager+
    If job.seniority matches user level: 20 pts
    Adjacent level (one step): 10 pts
    No match: 0 pts

  Location match (20 points):
    If job.work_arrangement === "remote": 20 pts (always matches)
    If job.country === profile.country: 20 pts
    If job.country in profile.preferred_locations: 15 pts
    No match: 0 pts

  Work arrangement match (15 points):
    If job.work_arrangement in profile.work_arrangement: 15 pts
    No match: 0 pts

  Industry match (10 points):
    If job company industry in profile.industries: 10 pts
    No match: 0 pts

  Skills match (10 points):
    Count overlap between job requirements text 
    and profile.skills array
    Normalize: overlapping_skills / total_job_skills * 10

  Special bonuses:
    visa_sponsorship + profile not in job country: +5 bonus
    arabic_preferred + profile speaks Arabic: +3 bonus
    Cap total at 100

Export alongside:
  formatSalary(min, max, currency, period): string
    → "$95k – $115k / yr" or "AED 25k – 35k / mo"
  
  getTimeAgo(date): string
    → "2 hours ago" | "3 days ago" | "2 weeks ago"
  
  generateJobSlug(title, company, id): string
    → "senior-engineer-google-abc123"
  
  isJobNew(createdAt): boolean
    → true if posted within last 24 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — SERVER ACTIONS & QUERIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lib/jobs/queries.ts

getJobs(filters: JobFilters, userId?: string): Promise<{
  jobs: JobWithCompany[],
  total: number,
  userSavedIds: string[],
  userAppliedIds: string[]
}>

JobWithCompany type:
  Job + company { name, logo_url, slug, avg_overall_rating }

getJobById(id: string): Promise<JobWithCompany | null>

getSavedJobs(userId: string): Promise<JobWithCompany[]>

getUserApplications(userId: string): Promise<ApplicationWithJob[]>

ApplicationWithJob:
  Application + job { title, work_arrangement, country, city,
  salary_min, salary_max, salary_currency }
  + company { name, logo_url, slug }

searchJobSuggestions(query: string): Promise<{
  titles: string[],
  companies: { name: string, slug: string, logo_url: string }[]
}>

lib/jobs/actions.ts

submitApplication(data: ApplicationData): Promise<ActionResult>
  - Auth check
  - Check: already applied? Return error if so
  - Upload resume if new file provided (to Supabase storage)
  - Insert to applications table
  - Increment jobs.application_count
  - Return { success: true, applicationId }

toggleSaveJob(jobId: string): Promise<{
  success: boolean,
  saved: boolean,
  savedCount: number
}>
  - Auth check
  - Check if saved: if yes delete, if no insert
  - Update jobs.saved_count
  - Return new state

withdrawApplication(applicationId: string): Promise<ActionResult>
  - Auth check
  - Verify applicant owns this application
  - Update status to "withdrawn"
  - Return { success: true }

createJobAlert(data: AlertData): Promise<ActionResult>
  - Auth check
  - Validate with Zod
  - Insert to job_alerts
  - Return { success: true }

postJob(data: PostJobData): Promise<ActionResult>
  - Auth check
  - Validate
  - Generate slug
  - Insert to jobs table
  - status: "active" (simplified for MVP, no approval flow)
  - Return { success: true, jobId, slug }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 12 — EMPTY & EDGE CASE STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JobsEmptyState.tsx:

  If search + filters active:
    Briefcase icon in olive circle
    "No jobs match your search"
    "Try adjusting your filters or search terms"
    "Clear filters" olive button
    "Browse all jobs" ghost button

  If no jobs at all (new platform):
    "Jobs are coming soon"
    "We're onboarding employers. Check back soon."
    "Set up a job alert →" olive link
      (get notified when first jobs appear)

JobDetailPlaceholder (right panel when nothing selected):
  Centered, full height right panel
  Subtle olive geometric illustration (CSS only)
  "Select a job to view details"
  text-muted text-sm

Edge cases:

Job expired while user viewing:
  Show orange notice bar at top of JobDetail:
  "⚠️ This job is no longer accepting applications"
  Apply button: disabled, "Position closed"

Job apply button clicked but not logged in:
  Redirect to /sign-in with ?redirect=/jobs?id={jobId}
  After sign-in: return to job and auto-open apply modal
  (Use URL state to trigger modal on load)

Duplicate application attempt:
  Action returns error
  Show toast: "You've already applied to this position"
  Apply button changes to "Applied ✓" immediately

File upload too large (>5MB):
  Inline error below upload zone:
  "File too large. Maximum size is 5MB."
  Clear file selection

File wrong type:
  "Please upload a PDF, DOC, or DOCX file"

Network error during application:
  Save form data to localStorage:
  key: 'watan_application_draft_{jobId}'
  On modal reopen: "You have an unfinished application. 
  Continue where you left off?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 13 — ANIMATIONS & INTERACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Jobs board page load:
  Left panel: slide in from left, opacity 0→1, 0.4s
  Right panel: fade in, 0.5s, 0.1s delay

JobCard selection:
  Selected state: animated left border (scaleY 0→1, 0.15s)
  Background: smooth bg-color transition 0.15s
  Right panel update: cross-fade content 0.2s

Filter changes:
  JobsList: opacity 0.5 during loading, 1 when loaded
  Results count: animate number change

Save job button:
  Bookmark icon: fill animation (SVG fill transition)
  Spring scale effect on click

Apply modal steps:
  Same as review modal (slide left/right with AnimatePresence)
  Progress bar: smooth width transition

Success states:
  Scale-in animation on checkmark/plane icon
  Staggered fade-in on supporting text elements

Application status changes:
  Card left border color: animated transition 0.3s
  Status badge: fade in on change

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- TypeScript strict, zero any types
- JobCard: memoized with React.memo (list can be 100+ items)
- JobsList: virtualize if list > 50 items 
  (use @tanstack/virtual or simple windowing)
- Split view: both panels independently scrollable
- URL always reflects selected job (shareable deep links)
- Match scores: calculated client-side from profile
  (no server round-trip per job)
- All salary displays: formatted consistently, 
  never show raw numbers
- Optimistic updates: save job, helpful votes
- Resume upload: show progress percentage
- All modals: trap focus, ESC closes, 
  scroll lock on body when open
- SEO: /jobs/[id] has proper meta tags
  title: "{jobTitle} at {company} — Watan Jobs"
  description: first 160 chars of job description

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELIVER IN THIS ORDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SQL schema (as comment block)
lib/jobs/utils.ts
lib/jobs/schema.ts
lib/jobs/queries.ts
lib/jobs/actions.ts
components/jobs/JobMatchBadge.tsx
components/jobs/JobStatusBadge.tsx
components/jobs/SaveJobButton.tsx
components/jobs/JobCard.tsx
components/jobs/JobCardCompact.tsx
components/jobs/JobSearch.tsx
components/jobs/JobSortBar.tsx
components/jobs/JobFilters.tsx
components/jobs/JobsList.tsx
components/jobs/JobDetail.tsx
components/jobs/JobsEmptyState.tsx
components/jobs/JobAlertsBanner.tsx
components/jobs/ApplicationCard.tsx
components/jobs/ApplyStep1.tsx
components/jobs/ApplyStep2.tsx
components/jobs/ApplyStep3.tsx
components/jobs/ApplySuccessState.tsx
components/jobs/ApplyModal.tsx
components/jobs/JobsBoard.tsx
app/(dashboard)/jobs/page.tsx
app/(dashboard)/jobs/loading.tsx
app/(dashboard)/jobs/[id]/page.tsx
app/(dashboard)/jobs/[id]/loading.tsx
app/(dashboard)/saved-jobs/page.tsx
app/(dashboard)/applications/page.tsx

No summaries. No placeholders. Every file complete.
Every interaction state handled.