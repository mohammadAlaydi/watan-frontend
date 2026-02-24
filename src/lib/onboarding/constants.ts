// ─── Onboarding Step Labels ───
export const STEP_LABELS = [
    "Identity",
    "Background",
    "Location",
    "Preferences",
    "Verification",
] as const;

// ─── Industries ───
export const INDUSTRIES = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Engineering",
    "Design",
    "Marketing",
    "Law",
    "Media",
    "NGO/Nonprofit",
    "Government",
    "Other",
] as const;

// ─── Popular Skills ───
export const POPULAR_SKILLS = [
    "React",
    "TypeScript",
    "Python",
    "JavaScript",
    "Node.js",
    "Java",
    "SQL",
    "AWS",
    "Docker",
    "Figma",
    "Product Management",
    "Data Analysis",
    "Machine Learning",
    "UI/UX Design",
    "Project Management",
    "Marketing",
    "Sales",
    "Finance",
    "Excel",
    "Communication",
] as const;

// ─── Languages ───
export const LANGUAGES = [
    "Arabic",
    "English",
    "Hebrew",
    "French",
    "German",
    "Spanish",
    "Turkish",
    "Swedish",
    "Dutch",
    "Portuguese",
    "Other",
] as const;

// ─── Countries ───
export const COUNTRIES = [
    { flag: "🇵🇸", name: "Palestine" },
    { flag: "🇯🇴", name: "Jordan" },
    { flag: "🇦🇪", name: "UAE" },
    { flag: "🇸🇦", name: "Saudi Arabia" },
    { flag: "🇺🇸", name: "United States" },
    { flag: "🇩🇪", name: "Germany" },
    { flag: "🇬🇧", name: "United Kingdom" },
    { flag: "🇨🇱", name: "Chile" },
    { flag: "🇨🇦", name: "Canada" },
    { flag: "🇶🇦", name: "Qatar" },
    { flag: "🇰🇼", name: "Kuwait" },
    { flag: "🇪🇬", name: "Egypt" },
    { flag: "🇸🇪", name: "Sweden" },
    { flag: "🇳🇱", name: "Netherlands" },
    { flag: "🇦🇺", name: "Australia" },
    { flag: "🇧🇷", name: "Brazil" },
    { flag: "🇫🇷", name: "France" },
    { flag: "🇹🇷", name: "Turkey" },
    { flag: "🇱🇧", name: "Lebanon" },
    { flag: "🇴🇲", name: "Oman" },
    { flag: "🇧🇭", name: "Bahrain" },
    { flag: "🇮🇶", name: "Iraq" },
    { flag: "🇳🇴", name: "Norway" },
    { flag: "🇩🇰", name: "Denmark" },
    { flag: "🇦🇹", name: "Austria" },
    { flag: "🇨🇭", name: "Switzerland" },
    { flag: "🇮🇹", name: "Italy" },
    { flag: "🇪🇸", name: "Spain" },
    { flag: "🇵🇹", name: "Portugal" },
    { flag: "🇮🇪", name: "Ireland" },
    { flag: "🇯🇵", name: "Japan" },
    { flag: "🇰🇷", name: "South Korea" },
    { flag: "🇸🇬", name: "Singapore" },
    { flag: "🇮🇳", name: "India" },
    { flag: "🇿🇦", name: "South Africa" },
    { flag: "🇲🇽", name: "Mexico" },
    { flag: "🇦🇷", name: "Argentina" },
    { flag: "🇨🇴", name: "Colombia" },
] as const;

// ─── Relocation Regions ───
export const RELOCATION_REGIONS = [
    "Middle East",
    "Europe",
    "North America",
    "South America",
    "Asia",
    "Remote Only",
] as const;

// ─── Job Types ───
export const JOB_TYPES = [
    "Full-time",
    "Part-time",
    "Contract",
    "Freelance",
    "Internship",
    "Co-founder",
] as const;

// ─── Work Arrangements ───
export const WORK_ARRANGEMENTS = [
    "Remote",
    "Hybrid",
    "On-site",
] as const;

// ─── Currencies ───
export const CURRENCIES = [
    "USD",
    "EUR",
    "GBP",
    "AED",
    "JOD",
    "SAR",
] as const;

// ─── Job Seeking Options ───
export const JOB_SEEKING_OPTIONS = [
    {
        value: "actively" as const,
        icon: "🔥",
        title: "Actively looking",
        subtitle: "I'm actively interviewing and ready to start soon",
    },
    {
        value: "open" as const,
        icon: "👀",
        title: "Open to opportunities",
        subtitle: "I'm not urgently looking but open to the right role",
    },
    {
        value: "not_looking" as const,
        icon: "🙅",
        title: "Just here to connect",
        subtitle: "Not looking right now, here to network and share",
    },
] as const;

// ─── Auth Quotes ───
export const AUTH_QUOTES = [
    "Every professional deserves visibility.",
    "Your background is your strength.",
    "Built by Palestinians, for Palestinians.",
    "Your career has no borders.",
] as const;

export const AUTH_FLAGS = [
    "🇵🇸", "🇯🇴", "🇦🇪", "🇺🇸", "🇬🇧", "🇩🇪", "🇸🇦", "🇨🇦", "🇸🇪", "🇨🇱",
] as const;

// ─── Years of Experience ───
export const YEARS_OPTIONS = [
    "0-1",
    "1-3",
    "3-5",
    "5-10",
    "10+",
] as const;
