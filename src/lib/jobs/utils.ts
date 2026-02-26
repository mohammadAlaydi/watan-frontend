import { formatDistanceToNow, differenceInHours } from "date-fns";

// ─── Types ───

interface JobForMatch {
    title: string;
    seniority: string | null;
    work_arrangement: string | null;
    country: string | null;
    requirements: string[] | null;
    visa_sponsorship: boolean;
    arabic_preferred: boolean;
    arabic_required: boolean;
    company_industry?: string | null;
}

interface ProfileForMatch {
    preferred_roles?: string[];
    years_experience?: number;
    country?: string;
    preferred_locations?: string[];
    work_arrangement?: string[];
    industries?: string[];
    skills?: string[];
    speaks_arabic?: boolean;
}

// ─── Match Score Algorithm ───

const SENIORITY_LEVELS = [
    "junior",
    "mid",
    "senior",
    "lead",
    "manager",
    "director",
    "vp",
    "c-level",
] as const;

/**
 * Map years of experience to the expected seniority level.
 * Returns the index in SENIORITY_LEVELS.
 */
function experienceToSeniorityIndex(years: number): number {
    if (years <= 1) return 0; // junior
    if (years <= 3) return 1; // mid
    if (years <= 5) return 2; // senior
    if (years <= 10) return 3; // lead
    return 4; // manager+
}

/**
 * Calculate a 0–100 match score between a job and a user profile.
 * Pure function — no DB calls.
 */
export function calculateMatchScore(
    job: JobForMatch,
    profile: ProfileForMatch
): number {
    let score = 0;

    // Role match (25 points)
    if (profile.preferred_roles && profile.preferred_roles.length > 0) {
        const titleLower = job.title.toLowerCase();
        const exactMatch = profile.preferred_roles.some(
            (role) => titleLower === role.toLowerCase()
        );
        if (exactMatch) {
            score += 25;
        } else {
            const partialMatch = profile.preferred_roles.some((role) =>
                role
                    .toLowerCase()
                    .split(/\s+/)
                    .some((word) => word.length > 2 && titleLower.includes(word))
            );
            if (partialMatch) score += 15;
        }
    }

    // Seniority match (20 points)
    if (
        job.seniority &&
        profile.years_experience !== undefined &&
        profile.years_experience !== null
    ) {
        const jobIndex = SENIORITY_LEVELS.indexOf(
            job.seniority as (typeof SENIORITY_LEVELS)[number]
        );
        const profileIndex = experienceToSeniorityIndex(profile.years_experience);
        if (jobIndex >= 0) {
            const diff = Math.abs(jobIndex - profileIndex);
            if (diff === 0) score += 20;
            else if (diff === 1) score += 10;
        }
    }

    // Location match (20 points)
    if (job.work_arrangement === "remote") {
        score += 20;
    } else if (job.country) {
        if (profile.country && job.country === profile.country) {
            score += 20;
        } else if (
            profile.preferred_locations &&
            profile.preferred_locations.includes(job.country)
        ) {
            score += 15;
        }
    }

    // Work arrangement match (15 points)
    if (
        job.work_arrangement &&
        profile.work_arrangement &&
        profile.work_arrangement.includes(job.work_arrangement)
    ) {
        score += 15;
    }

    // Industry match (10 points)
    if (
        job.company_industry &&
        profile.industries &&
        profile.industries.includes(job.company_industry)
    ) {
        score += 10;
    }

    // Skills match (10 points)
    if (
        profile.skills &&
        profile.skills.length > 0 &&
        job.requirements &&
        job.requirements.length > 0
    ) {
        const requirementsText = job.requirements.join(" ").toLowerCase();
        const matchingSkills = profile.skills.filter((skill) =>
            requirementsText.includes(skill.toLowerCase())
        );
        const ratio = matchingSkills.length / job.requirements.length;
        score += Math.round(Math.min(ratio, 1) * 10);
    }

    // Special bonuses
    if (job.visa_sponsorship && profile.country && job.country !== profile.country) {
        score += 5;
    }
    if (
        (job.arabic_preferred || job.arabic_required) &&
        profile.speaks_arabic
    ) {
        score += 3;
    }

    return Math.min(score, 100);
}

// ─── Formatting Utilities ───

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    AED: "AED ",
    JOD: "JOD ",
    SAR: "SAR ",
};

/**
 * Format a salary range to a human-readable string.
 * e.g. formatSalary(95000, 115000, "USD", "annual") → "$95k – $115k / yr"
 */
export function formatSalary(
    min: number | null,
    max: number | null,
    currency = "USD",
    period = "annual"
): string {
    const symbol = CURRENCY_SYMBOLS[currency] ?? `${currency} `;

    const periodLabel =
        period === "annual" ? "yr" : period === "monthly" ? "mo" : "hr";

    const formatAmount = (amount: number): string => {
        if (amount >= 1000) return `${symbol}${Math.round(amount / 1000)}k`;
        return `${symbol}${amount}`;
    };

    if (min && max) {
        return `${formatAmount(min)} – ${formatAmount(max)} / ${periodLabel}`;
    }
    if (min) return `From ${formatAmount(min)} / ${periodLabel}`;
    if (max) return `Up to ${formatAmount(max)} / ${periodLabel}`;
    return "Salary not disclosed";
}

/**
 * Return a relative time string, e.g. "2 hours ago", "3 days ago".
 */
export function getTimeAgo(date: string | Date): string {
    try {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
        return "";
    }
}

/**
 * Generate a URL-safe slug from job title, company name, and short id.
 */
export function generateJobSlug(
    title: string,
    company: string,
    id: string
): string {
    const slug = `${title} ${company}`
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return `${slug}-${id.slice(0, 8)}`;
}

/**
 * Check if a job was posted within the last 24 hours.
 */
export function isJobNew(createdAt: string | Date): boolean {
    try {
        return differenceInHours(new Date(), new Date(createdAt)) < 24;
    } catch {
        return false;
    }
}
