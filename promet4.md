You are continuing to build "Watan" — a professional network for Palestinian
professionals worldwide. Landing page and auth/onboarding are already built.

Now build the User Dashboard (home screen after login) and the 
Public Profile Page.

TECH STACK REMINDER:
- Next.js 14+ App Router
- TypeScript strict
- Tailwind CSS with Watan design tokens (already configured)
- shadcn/ui components
- Framer Motion
- Clerk for auth (useUser, currentUser)
- Supabase for data
- Lucide React icons
- date-fns for date formatting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — FOLDER STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app/
  (dashboard)/
    layout.tsx                  ← dashboard shell (sidebar + topbar)
    dashboard/
      page.tsx                  ← main dashboard home
      loading.tsx               ← skeleton loading state
    profile/
      [username]/
        page.tsx                ← public profile view
        loading.tsx
      edit/
        page.tsx                ← edit own profile
    settings/
      page.tsx                  ← account settings (placeholder)

components/
  dashboard/
    Sidebar.tsx                 ← left navigation
    Topbar.tsx                  ← top bar with search + notifications
    DashboardHome.tsx           ← home feed content
    WelcomeBanner.tsx           ← first-time welcome card
    ProfileCompletionCard.tsx   ← completion percentage nudge
    QuickStats.tsx              ← profile views, connections, etc
    ActivityFeed.tsx            ← recent activity in network
    JobRecommendations.tsx      ← 3 recommended jobs
    PeopleYouMayKnow.tsx        ← suggested connections
    RecentReviews.tsx           ← latest community reviews
  profile/
    ProfileHeader.tsx           ← cover + avatar + name + actions
    ProfileBio.tsx              ← about section
    ProfileExperience.tsx       ← work history
    ProfileSkills.tsx           ← skills tags
    ProfileVerification.tsx     ← verification status card
    ProfileReviews.tsx          ← reviews written (anonymous display)
    ProfileSidebar.tsx          ← right sidebar on profile page
    EditProfileForm.tsx         ← inline edit form
  shared/
    VerifiedBadge.tsx           ← already built, reuse
    EmptyState.tsx              ← reusable empty state component
    SkeletonCard.tsx            ← reusable skeleton loader

lib/
  dashboard/
    queries.ts                  ← Supabase queries for dashboard data
  profile/
    queries.ts                  ← Supabase queries for profile data
    actions.ts                  ← server actions for profile updates

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — DASHBOARD LAYOUT (SHELL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/layout.tsx ──

This is the persistent shell for all authenticated pages.
Server component. Get currentUser from Clerk.
Get profile from Supabase using clerk_user_id.

If onboarding_completed is false: redirect to /onboarding

Layout structure:
  Full height, flex row
  Left: <Sidebar profile={profile} />  (fixed, 240px wide)
  Right: flex-1 flex-col overflow-hidden
    Top: <Topbar profile={profile} />  (fixed, 64px tall)
    Main: scrollable content area, bg-cream
      pt-16 pl-60 (offset for fixed topbar + sidebar)
      {children}

Mobile (below 1024px):
  Sidebar hidden by default
  Topbar has hamburger → opens sidebar as Sheet overlay
  Full width content

── Sidebar.tsx ──

Fixed left sidebar, full height, bg-white border-r border-border
Width: 240px desktop, full width when mobile sheet

Top section:
  Logo component (md size, olive theme) with padding pt-5 px-4 mb-6

Navigation links (use Next.js Link + usePathname for active state):

  Main section label: "MAIN" text-muted text-xs font-semibold 
  tracking-widest px-4 mb-2

  Links:
    🏠 Dashboard        → /dashboard
    👤 My Profile       → /profile/[username]
    🏢 Companies        → /companies
    💼 Jobs             → /jobs
    ⭐ Reviews          → /reviews

  Section label: "COMMUNITY"
    👥 Professionals    → /professionals
    💰 Salaries         → /salaries

  Section label: "ACCOUNT"
    ⚙️  Settings        → /settings
    ❓ Help             → /help

Each link styling:
  flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2
  text-sm font-medium text-muted
  hover: bg-olive-subtle text-charcoal
  active (current route): bg-olive-pale text-olive font-semibold
  Icon: 18px Lucide icon, same color as text

Bottom of sidebar:
  User mini profile card:
    Avatar (40px circle, profile photo or initials fallback)
    Name (text-sm font-semibold text-charcoal, truncate)
    Headline (text-xs text-muted, truncate)
    Three dots menu → Sign out option (Clerk SignOutButton)
  Padding: p-4, border-t border-border

── Topbar.tsx ──

Fixed top, left-60 right-0 (desktop), height 64px
bg-white/90 backdrop-blur-md border-b border-border
z-40

Left: Page title (dynamic, passed as prop or read from pathname)
  "Dashboard", "Companies", "Jobs" etc.
  text-lg font-bold text-charcoal

Center: Search bar
  Input: w-80, bg-cream, border border-border, rounded-xl
  px-4 py-2 text-sm placeholder "Search professionals, companies..."
  Lucide Search icon inside left
  On focus: border-olive, slight shadow
  (Functionality placeholder — wire up in Prompt 7)

Right: Icon buttons row
  🔔 Notifications bell
    Relative positioned, show orange dot badge if unread
    onClick: open notifications dropdown panel (build this panel)
  
  Notifications dropdown (absolute, right-0, top-12):
    White card, rounded-2xl, shadow-lg, w-80, border
    Header: "Notifications" font-bold + "Mark all read" link
    List of notification items:
      Each: avatar + text description + time ago
      Types: new connection, review helpful vote, job match, voucher request
      Show 5 placeholder notifications
      Unread: bg-olive-subtle left border olive 3px
      Read: white bg
    Footer: "View all notifications" centered link

  Avatar button → dropdown menu:
    View profile / Edit profile / Settings / Sign out

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — DASHBOARD HOME PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/dashboard/page.tsx ──

Server component.
Fetch in parallel using Promise.all:
  - User profile from Supabase
  - Job recommendations (3 jobs matching user's preferences)
  - Recent community reviews (5 latest)
  - People you may know (5 profiles, same country or industry)
  - Activity feed items (10 items)
  - Quick stats (profile views this week, review helpful votes)

Pass all data down to client components as props.

Layout: 12-column grid
  Left main column (8 cols): 
    WelcomeBanner (only if first login this week)
    ProfileCompletionCard (if completion < 80%)
    ActivityFeed
  Right sidebar (4 cols):
    QuickStats
    JobRecommendations
    PeopleYouMayKnow

Mobile: single column, sidebar components move below main

── WelcomeBanner.tsx ──

Only shown on first dashboard visit (check localStorage flag 
"watan_welcome_shown", hide after first render)

Warm olive gradient card: bg-gradient-to-r from-olive to-olive-light
Rounded-2xl p-6 text-white mb-6 relative overflow-hidden

Decorative: subtle geometric pattern absolutely positioned right side
  CSS only: repeating circles/lines at low opacity

Content:
  "Welcome to Watan, {firstName}! 🎉"
  text-xl font-bold mb-2
  
  "Your professional home is ready. Here's what to do next:"
  text-white/80 text-sm mb-4

  3 quick action chips in a row:
    "Complete profile" → /profile/edit
    "Write a review" → /companies
    "Browse jobs" → /jobs
    Each: white/10 bg, white border, rounded-lg px-3 py-1.5 
    text-xs font-medium hover:white/20 transition

Close button (X) top right, white/60, onClick sets localStorage flag

── ProfileCompletionCard.tsx ──

Show only if profile completion percentage < 80%

White card, rounded-2xl, border, p-6, mb-6

Calculate completion percentage from profile fields:
  photo: 15%
  headline: 10%
  bio: 10%
  skills (min 3): 10%
  experience: 15%
  location: 10%
  verification: 20%
  job preferences: 10%

Header row:
  Left: "Complete your profile" font-bold text-charcoal
  Right: large percentage number text-olive font-black text-2xl

Progress bar:
  Full width, h-2, bg-olive-pale rounded-full
  Inner: bg-olive rounded-full, width = percentage%
  Animate width with Framer Motion on mount

Below bar: list of incomplete items as clickable chips
  Each missing item shown as pill:
    "Add a photo +15%" / "Write a bio +10%" etc.
    bg-olive-subtle border border-olive/20 text-olive text-xs
    rounded-lg px-3 py-1.5 cursor-pointer
    onClick: navigate to relevant edit section

── QuickStats.tsx ──

White card, rounded-2xl, border, p-5, mb-4

Title: "Your activity" font-semibold text-charcoal mb-4

4 stat rows:
  Each row: icon + label + number (right aligned)
  Icon: 16px Lucide, olive color
  
  Stats:
    👁️ Profile views this week     → number
    🤝 Connections                 → number  
    ⭐ Reviews written             → number
    💡 Review helpful votes        → number

Numbers: font-bold text-charcoal
Trend: tiny green arrow + "vs last week" text-muted text-xs
  if data available, show +X% in green, -X% in red

Bottom: "View full analytics →" link text-olive text-sm

── ActivityFeed.tsx ──

White card, rounded-2xl, border, p-6

Header: "Community activity" font-bold text-charcoal

Filter tabs row (below header):
  "All" | "Reviews" | "Jobs" | "Connections"
  Active tab: bg-olive-pale text-olive rounded-lg
  Tab switching: useState, filter items client-side

Activity items list (10 items):
  Each item: flex row, py-3, border-b border-border last:border-0
  
  Left: avatar circle (40px) — either profile photo or company logo
    Initials fallback
  
  Middle: content text
    Bold name/company + action description
    e.g. "Rami Khalil wrote a review for Google Dubai"
    e.g. "A new job was posted at Microsoft matching your preferences"
    e.g. "Sara Ahmad joined Watan from London"
    text-sm text-charcoal, mt-0.5 text-xs text-muted for timestamp
  
  Right: time ago (date-fns formatDistanceToNow)
    text-xs text-muted

  Type-specific left border color:
    Review: border-l-2 border-gold pl-3
    Job: border-l-2 border-olive pl-3
    Connection: border-l-2 border-blue-400 pl-3

EmptyState when no activity:
  Centered illustration placeholder (olive circle with icon)
  "No activity yet"
  "As the community grows, you'll see updates here."

── JobRecommendations.tsx ──

White card, rounded-2xl, border, p-5, mb-4

Header row:
  "Matched jobs" font-semibold text-charcoal
  "View all →" link text-olive text-sm

3 job cards stacked:
  Each: py-3 border-b last:border-0
  
  Company logo placeholder (32px rounded-lg bg-olive-pale, initials)
  Job title: text-sm font-semibold text-charcoal
  Company + location: text-xs text-muted
  Tags row: Remote/Hybrid chip + salary range chip
    Both: bg-olive-subtle text-olive text-xs rounded-md px-2 py-0.5
  
  "Match" indicator: small pill "92% match" in gold-light bg, 
  dark gold text, text-xs font-semibold

  Hover: bg-olive-subtle/50 rounded-xl cursor-pointer
  onClick: navigate to job page

── PeopleYouMayKnow.tsx ──

White card, rounded-2xl, border, p-5

Header: "People you may know" font-semibold

5 person rows:
  Avatar (36px) + name + headline + "Connect" button
  Name: text-sm font-semibold text-charcoal
  Headline: text-xs text-muted truncate max-w-[120px]
  Connect button: 
    Default: "Connect" — border border-olive text-olive 
    text-xs rounded-lg px-3 py-1 hover:bg-olive-pale
    Clicked: "Requested ✓" — bg-olive-pale text-olive disabled

  "Show more" link below list: text-olive text-sm

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — PUBLIC PROFILE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/profile/[username]/page.tsx ──

Server component.
Params: { username: string }
Query Supabase: get profile where username = params.username
If not found: return notFound() → Next.js 404

Also get from Clerk currentUser to know if this is OWN profile
  isOwnProfile = currentUser.username === params.username

Fetch in parallel:
  - Full profile data
  - Reviews written by this user (anonymous, show company not reviewer)
  - Connection count
  - Mutual connections (placeholder)

Layout: 
  Max-w-5xl mx-auto px-6 py-8
  Two columns: main (7 cols) + sidebar (5 cols)
  Mobile: single column

── ProfileHeader.tsx ──

Props: profile, isOwnProfile

Cover image area:
  Height: 180px
  bg-gradient-to-r from-olive to-olive-light (default cover)
  If user has cover image: show it
  Rounded-t-2xl
  
  If isOwnProfile: "Edit cover" button appears on hover
    Absolutely positioned bottom-right
    Small white button with camera icon

Avatar section:
  Avatar circle: 96px, border-4 border-white, rounded-full
  Positioned: -mt-12 ml-6 relative z-10
  Profile photo or initials fallback (olive-pale bg, olive text)
  
  If isOwnProfile: camera overlay on hover

Name row (mt-4 ml-6):
  Full name: text-2xl font-bold text-charcoal tracking-tight
  Inline: <VerifiedBadge /> if verified
  
  Headline: text-muted text-sm mt-1
  Location row: 📍 City, Country · 🌐 X connections
  text-xs text-muted mt-1

Action buttons (top right of header card):
  If isOwnProfile:
    "Edit profile" → /profile/edit
    Outline button, olive text, border-olive
  
  If NOT own profile:
    "Connect" → filled olive button
    "Message" → outline button (placeholder, links to /messages)
    Three dots → Report / Block dropdown

Connection count + mutual:
  "214 connections · 3 mutual"
  text-xs text-muted font-medium

Seeking status badge:
  If job_seeking_status === "actively":
    Green pill: "🔥 Open to work" — bg-green-50 text-green-700 
    border border-green-200
  If "open":
    Olive pill: "👀 Open to opportunities"

── ProfileBio.tsx ──

White card, rounded-2xl, border, p-6, mb-4

Section header row:
  "About" font-bold text-charcoal text-lg
  If isOwnProfile: pencil icon button → inline edit mode

Bio text:
  text-sm text-charcoal leading-relaxed
  If longer than 3 lines: show truncated + "Read more" toggle
  Animate expand with Framer Motion layout

Languages row:
  "Speaks:" label + language pills
  Each: bg-olive-subtle text-olive text-xs rounded-md px-2 py-1

If isOwnProfile and bio empty:
  EmptyState inside card:
    "Add a bio to tell the community about your work"
    "Add bio →" link text-olive

── ProfileExperience.tsx ──

White card, rounded-2xl, border, p-6, mb-4

"Experience" header + edit icon (if own profile)

List of experience items:
  Each item: flex gap-4, py-4, border-b last:border-0
  
  Left: Company logo placeholder
    48px rounded-xl bg-olive-pale
    Company initials text-olive font-bold

  Right:
    Job title: font-semibold text-charcoal text-sm
    Company name: text-sm text-charcoal
    Date range: text-xs text-muted
      "Jan 2022 – Present · 2 yrs 8 mos"
      Calculate duration with date-fns
    Location: text-xs text-muted
    Description: text-xs text-muted leading-relaxed mt-1
      Truncate at 2 lines, expand on click

If isOwnProfile and no experience:
  EmptyState: "Add your work experience"

Note: For MVP, experience is stored as JSONB array in Supabase
experiences column: [{title, company, start_date, end_date, 
location, description, is_current}]

── ProfileSkills.tsx ──

White card, rounded-2xl, border, p-6, mb-4

"Skills" header + edit icon

Skills pills grid:
  flex flex-wrap gap-2
  Each pill: bg-olive-subtle border border-olive/15 text-olive
  text-sm font-medium rounded-xl px-3 py-1.5

If more than 10 skills: show 10 + "Show X more" button
Expand on click with Framer Motion

If own profile and no skills:
  EmptyState + "Add skills" link

── ProfileVerification.tsx ──

White card, rounded-2xl, border, p-6, mb-4

"Verification" header

Verification status display:

  If fully verified:
    Large green checkmark circle (48px, olive-pale bg)
    "Community Verified" text-lg font-bold text-olive
    "Member since {date}" text-muted text-sm
    List of verification methods achieved:
      ✓ LinkedIn connected
      ✓ Community vouched (3/3)
      Each: text-sm text-charcoal with olive checkmark icon

  If partially verified:
    Progress indicator showing which steps done
    Encourage remaining steps
    "Complete verification →" link text-olive

  If unverified:
    Shield outline icon, muted color
    "Not yet verified"
    "Verify your profile to build trust" text-muted text-sm
    If isOwnProfile: "Start verification →" olive link

── ProfileReviews.tsx ──

White card, rounded-2xl, border, p-6, mb-4

"Reviews written" header
Subtitle: "All reviews are posted anonymously" text-muted text-xs

Review count badge: "{N} reviews" bg-olive-pale text-olive 
text-xs rounded-full px-2 py-0.5

List of review previews:
  Each: py-4 border-b last:border-0
  
  Company name + logo placeholder
  Star rating (gold stars)
  Review snippet (first 100 chars + "...")
  Date: text-xs text-muted
  Tags row: "Culture" "Management" "Work-Life Balance" 
    Aspects being reviewed
  
  "Was this helpful? 👍 {count}" — vote button
  
  Click → navigate to full company review page

If no reviews yet:
  EmptyState
  If isOwnProfile:
    "Share your workplace experience to help others"
    "Write a review →" olive button

── ProfileSidebar.tsx ──

Right sidebar on profile page (5 cols)

Card 1: Contact & Links
  White card, rounded-2xl, border, p-5, mb-4
  
  "Links" section header font-semibold mb-3
  
  If LinkedIn: 
    LinkedIn icon + "linkedin.com/in/..." truncated
    External link icon, whole row is a link
  
  If work email verified:
    Email icon + "Work email verified ✓" text-olive text-sm
  
  Country + City with flag emoji

Card 2: Mutual Connections
  White card, rounded-2xl, border, p-5, mb-4
  
  Stacked avatars of 3 mutual connections
  "{N} mutual connections" text-sm font-semibold
  Names list: text-xs text-muted

Card 3: Similar Profiles
  White card, rounded-2xl, border, p-5
  
  "Similar professionals" font-semibold mb-3
  
  3 mini profile rows:
    Avatar + name + headline + "View" link
    Same country or industry

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — EDIT PROFILE PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/profile/edit/page.tsx ──

Client component (or server with client form child)
Pre-fill all fields from Supabase profile

Layout: max-w-2xl mx-auto px-6 py-8

Section cards stacked vertically:

Card 1: "Basic info"
  Photo upload (same as onboarding step 1)
  Full name input
  Headline input
  Bio textarea

Card 2: "Experience"
  List existing experiences with edit/delete
  "Add experience" button → opens modal or inline form
  
  Experience modal (shadcn Dialog):
    Job title, Company, Location
    Start date, End date (or "Current role" checkbox)
    Description textarea
    Save / Cancel buttons

Card 3: "Skills"
  Current skills as removable pills
  Tag input to add new skills

Card 4: "Location & Languages"
  Country select, City input
  Languages multi-select

Card 5: "Job Preferences"
  Status selector (3 cards, same as onboarding)
  Work arrangement pills
  Salary range inputs

Card 6: "Social Links"
  LinkedIn URL input
  (Twitter/X optional)

Each card:
  White bg, rounded-2xl, border, p-6, mb-4
  Section title font-bold text-charcoal mb-4
  "Save changes" button per section OR one global save at bottom
  Use individual section saves for better UX
  Show success toast on save: "Profile updated ✓"
  Show error toast on failure

All saves: server actions from lib/profile/actions.ts
Re-validate Next.js cache after save: revalidatePath('/profile/[username]')

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — LOADING STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

── app/(dashboard)/dashboard/loading.tsx ──

Full dashboard skeleton:
  Sidebar: gray blocks for nav items (animate-pulse)
  Main area:
    Tall skeleton card (WelcomeBanner shape)
    Medium skeleton card (ProfileCompletion shape)
    Two skeleton cards side by side (feed + sidebar)

── app/(dashboard)/profile/[username]/loading.tsx ──

Profile skeleton:
  Cover area: gray rectangle 180px
  Avatar circle skeleton overlapping bottom
  Name skeleton: two gray bars
  Two column layout below: main skeletons + sidebar skeletons

── SkeletonCard.tsx (shared component) ──

Accept: height, width, rounded props
bg-olive-pale/50 animate-pulse rounded-xl
Used everywhere we need loading placeholders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — SUPABASE QUERIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lib/dashboard/queries.ts

getDashboardData(clerkUserId: string):
  Returns: { profile, jobRecommendations, recentReviews, 
             suggestedPeople, activityFeed, quickStats }
  All in one function using Promise.all
  Each sub-query is its own exported function too

getJobRecommendations(profile: Profile, limit = 3):
  Match on: profile.preferred_roles, profile.country,
  profile.work_arrangement
  Order by: created_at desc
  Return: Job[]

getActivityFeed(clerkUserId: string, limit = 10):
  Get recent reviews (last 7 days)
  Get new members (same country, last 7 days)
  Get new jobs matching preferences
  Merge, sort by created_at, return unified ActivityItem[]

ActivityItem type:
  { id, type: 'review'|'job'|'member', 
    actorName, actorAvatar, description, 
    targetName, createdAt }

lib/profile/queries.ts

getProfileByUsername(username: string): Promise<Profile | null>
getProfileByClerkId(clerkId: string): Promise<Profile | null>
getProfileReviews(profileId: string): Promise<Review[]>
getSuggestedProfiles(profile: Profile, limit = 5): Promise<Profile[]>
  Match on country first, then industry

lib/profile/actions.ts

updateBasicInfo(data): Promise<ActionResult>
updateExperience(data): Promise<ActionResult>
addExperience(data): Promise<ActionResult>
deleteExperience(id): Promise<ActionResult>
updateSkills(skills: string[]): Promise<ActionResult>
updateLocation(data): Promise<ActionResult>
updateJobPreferences(data): Promise<ActionResult>
updateSocialLinks(data): Promise<ActionResult>

All actions:
  Validate with Zod
  Auth check with Clerk auth()
  Upsert to Supabase
  revalidatePath after success
  Return { success: boolean, error?: string }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — EMPTY STATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EmptyState.tsx — shared reusable component

Props:
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  actiononClick?: () => void

Design:
  Centered flex-col, py-8
  Icon: 48px circle bg-olive-pale, icon centered, olive color
  Title: text-sm font-semibold text-charcoal mt-3
  Description: text-xs text-muted text-center max-w-xs mt-1
  Action: olive text link or small olive button

Used in:
  ActivityFeed (no activity yet)
  ProfileBio (no bio)
  ProfileExperience (no experience)
  ProfileSkills (no skills)
  ProfileReviews (no reviews written)
  JobRecommendations (no matches found)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dashboard page load:
  Wrap each dashboard section in motion.div
  initial: opacity 0, y: 20
  animate: opacity 1, y: 0
  Stagger: each section 0.1s delay after previous
  Duration: 0.5s ease

Profile page load:
  ProfileHeader: opacity 0 → 1, duration 0.6s
  Each card below: staggered 0.08s, slide up 16px

Sidebar navigation:
  Active link transition: background color 0.15s ease
  No transform animations (too distracting for navigation)

Connect button:
  On click: scale 0.95 → 1 (spring) then text changes
  Use Framer Motion animate prop on button

Profile completion bar:
  Width animates from 0 to actual % on mount
  duration: 1s, ease: "easeOut"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — RESPONSIVE RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Desktop (1280px+):
  Full sidebar visible (240px)
  Dashboard: 8/4 column split
  Profile: 7/5 column split

Tablet (768px–1280px):
  Sidebar collapses to icons only (64px wide)
  Tooltips on icon hover showing link label
  Dashboard: 6/6 column split
  Profile: full width, sidebar becomes bottom cards

Mobile (below 768px):
  Sidebar hidden, accessible via Sheet from topbar hamburger
  All layouts: single column
  Profile header: avatar centered, buttons stacked
  Stats: 2x2 grid
  All cards: full width, reduced padding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- TypeScript strict, no any types
- All data fetching in server components, 
  interactivity in client components
- Use React Suspense boundaries around each 
  dashboard section for granular loading
- No layout shift on load (skeleton matches 
  exact dimensions of real content)
- All profile fields gracefully handle null/undefined
  (user may have skipped steps)
- Username generation: if no username set,
  use clerk user id as fallback slug
- All dates formatted with date-fns, 
  respect user timezone from profile
- Proper meta tags on profile pages for 
  social sharing (og:title, og:description, og:image)
- revalidatePath called after every mutation
- Error boundaries on dashboard sections
  (one section failing should not crash page)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DELIVER IN THIS ORDER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lib/dashboard/queries.ts
lib/profile/queries.ts
lib/profile/actions.ts
components/shared/EmptyState.tsx
components/shared/SkeletonCard.tsx
components/dashboard/Sidebar.tsx
components/dashboard/Topbar.tsx
components/dashboard/WelcomeBanner.tsx
components/dashboard/ProfileCompletionCard.tsx
components/dashboard/QuickStats.tsx
components/dashboard/ActivityFeed.tsx
components/dashboard/JobRecommendations.tsx
components/dashboard/PeopleYouMayKnow.tsx
components/profile/ProfileHeader.tsx
components/profile/ProfileBio.tsx
components/profile/ProfileExperience.tsx
components/profile/ProfileSkills.tsx
components/profile/ProfileVerification.tsx
components/profile/ProfileReviews.tsx
components/profile/ProfileSidebar.tsx
components/profile/EditProfileForm.tsx
app/(dashboard)/layout.tsx
app/(dashboard)/dashboard/page.tsx
app/(dashboard)/dashboard/loading.tsx
app/(dashboard)/profile/[username]/page.tsx
app/(dashboard)/profile/[username]/loading.tsx
app/(dashboard)/profile/edit/page.tsx

No summaries. No placeholders. Every file complete.
Every component production-ready.


While Opus builds that, here's where we stand on your 3-month MVP timeline:
Week 1–2: ✅ Landing page, Auth, Onboarding, Dashboard, Profile
Week 3–4: Prompt 5 → Company Profile + Review System ← next
Week 5–6: Prompt 6 → Jobs Board + Apply Flow
Week 7–8: Prompt 7 → Full backend, RLS policies, API routes
Week 9–10: QA, performance, mobile polish
Week 11–12: Investor demo prep, waitlist launch, soft launch
You're on track. Want Prompt 5 — Company Profile + Review System next? That's the heart of the product — it's where users will spend the most time and where your value proposition lives most concretely.