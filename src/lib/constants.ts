import type {
    NavLink,
    Stat,
    HowItWorksStep,
    Feature,
    SampleReview,
} from "@/types";

// ─── Navigation ───

export const NAV_LINKS: NavLink[] = [
    { label: "For Professionals", href: "#professionals" },
    { label: "For Employers", href: "#employers" },
    { label: "Reviews", href: "#reviews" },
    { label: "Jobs", href: "#jobs" },
    { label: "About", href: "#about" },
];

// ─── Stats ───

export const STATS: Stat[] = [
    { value: 12000, suffix: "+", label: "Professionals" },
    { value: 48, suffix: "", label: "Countries" },
    { value: 2000, suffix: "+", label: "Reviews" },
    { value: 340, suffix: "+", label: "Active Jobs" },
];

// ─── How It Works ───

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
    {
        step: "01 — CONNECT",
        icon: "🤝",
        title: "Build your professional identity",
        description:
            "Create a profile that reflects your skills, experience, and ambitions. Get verified by the community and stand out to employers who value Palestinian talent.",
    },
    {
        step: "02 — DISCOVER",
        icon: "🔍",
        title: "Explore companies honestly",
        description:
            "Read real reviews from your peers. Understand workplace culture, salary ranges, and growth opportunities before you apply — no more guessing.",
    },
    {
        step: "03 — GROW",
        icon: "📈",
        title: "Advance your career globally",
        description:
            "Find jobs designed for the diaspora reality — remote-friendly, relocation-aware, and posted by employers who understand your unique value.",
    },
];

// ─── Features ───

export const FEATURES: Feature[] = [
    {
        icon: "🛡️",
        title: "Anonymous Reviews",
        description:
            "Share your honest workplace experience without fear. Every review is verified but your identity stays protected.",
        variant: "green",
    },
    {
        icon: "💰",
        title: "Salary Transparency",
        description:
            "Access real salary data from Palestinian professionals worldwide. Know your worth before you negotiate.",
        variant: "gold",
    },
    {
        icon: "🌐",
        title: "Global Network",
        description:
            "Connect with professionals across 48+ countries. From Berlin to Dubai, from Toronto to Amman — your community is everywhere.",
        variant: "dark",
    },
    {
        icon: "✅",
        title: "Community Verification",
        description:
            "Verified badges built on peer trust, not corporate validation. Real professionals vouching for real experience.",
        variant: "green",
    },
    {
        icon: "💼",
        title: "Jobs built for your diaspora reality",
        description:
            "Positions that understand visa complexities, remote work across time zones, and the value of multilingual professionals. No more one-size-fits-all job boards.",
        variant: "gold",
        fullWidth: true,
    },
];

// ─── Sample Reviews ───

export const SAMPLE_REVIEWS: SampleReview[] = [
    {
        initials: "MK",
        name: "Anonymous",
        role: "Software Engineer",
        location: "Berlin",
        rating: 5,
        text: "Finally a platform where I can share my experience honestly. The team culture was incredible and they genuinely valued diverse perspectives. Best decision I made.",
        company: "TechVentures GmbH",
    },
    {
        initials: "RA",
        name: "Anonymous",
        role: "Product Manager",
        location: "Toronto",
        rating: 4,
        text: "Used the salary data here to negotiate 18% higher than my initial offer. The transparency on this platform is unmatched. Every Palestinian professional needs this.",
        company: "NovaCorp Inc",
    },
    {
        initials: "NJ",
        name: "Anonymous",
        role: "UX Designer",
        location: "Dubai",
        rating: 5,
        text: "Connected with a group of Palestinian designers in the Gulf through Watan. We now have a monthly meetup and refer each other for projects constantly.",
        company: "DesignHub DMCC",
    },
    {
        initials: "SK",
        name: "Anonymous",
        role: "Data Analyst",
        location: "London",
        rating: 3,
        text: "The salary benchmarking data gave me the confidence to push for a raise. Not every company review is perfect but the honest ones helped me make better decisions.",
        company: "FinScope Ltd",
    },
    {
        initials: "AH",
        name: "Anonymous",
        role: "Civil Engineer",
        location: "Amman",
        rating: 5,
        text: "The interview experience section was spot on. I knew exactly what to expect before walking in. Landed the role and now I am contributing my own reviews back.",
        company: "BuildRight JO",
    },
];

// ─── Social Proof Avatars ───

export const AVATAR_INITIALS = ["SA", "LM", "KH", "TA", "YR"];

export const AVATAR_COLORS = [
    "bg-olive-pale",
    "bg-gold/20",
    "bg-olive/10",
    "bg-charcoal/10",
    "bg-olive-pale",
];
