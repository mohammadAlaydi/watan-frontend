import { format } from "date-fns";

/** Human-readable label for an overall rating value */
export function getRatingLabel(rating: number): string {
    const labels: Record<number, string> = {
        1: "Very dissatisfied",
        2: "Dissatisfied",
        3: "Neutral",
        4: "Satisfied",
        5: "Very satisfied",
    };
    return labels[rating] ?? "";
}

/** Color class for the left border of a review card based on rating */
export function getRatingBorderColor(rating: number): string {
    const map: Record<number, string> = {
        5: "border-l-green-400",
        4: "border-l-olive",
        3: "border-l-yellow-400",
        2: "border-l-orange-400",
        1: "border-l-red-400",
    };
    return map[rating] ?? "border-l-muted";
}

/** Background + text classes for the recommend percentage pill */
export function getRecommendStyles(percentage: number): string {
    if (percentage >= 70) return "bg-green-50 text-green-700";
    if (percentage >= 40) return "bg-yellow-50 text-yellow-700";
    return "bg-red-50 text-red-700";
}

/** Format a date to "Month Year" (e.g. "March 2024") */
export function formatReviewDate(dateStr: string): string {
    try {
        return format(new Date(dateStr), "MMMM yyyy");
    } catch {
        return "";
    }
}

/** Calculate approximate tenure from start/end years */
export function calculateTenure(
    startYear?: number | null,
    endYear?: number | null,
    status?: string
): string {
    if (!startYear) return "";
    const end = endYear ?? new Date().getFullYear();
    const years = end - startYear;
    if (years < 1) return "< 1 year";
    if (years === 1) return "1 year";
    return `${years} years`;
}

/**
 * Build a star histogram from a list of overall ratings.
 * Returns an array of 5 items (index 0 = 5★, index 4 = 1★).
 */
export function buildRatingDistribution(
    ratings: number[]
): { stars: number; count: number; percentage: number }[] {
    const total = ratings.length;
    return [5, 4, 3, 2, 1].map((stars) => {
        const count = ratings.filter((r) => r === stars).length;
        return {
            stars,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        };
    });
}

/**
 * Format a salary amount to a human-readable string.
 * e.g. 95000 → "$95k", 120000 → "$120k"
 */
export function formatSalaryShort(
    amount: number,
    currency = "USD"
): string {
    const symbols: Record<string, string> = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        AED: "AED ",
        JOD: "JOD ",
        SAR: "SAR ",
    };
    const symbol = symbols[currency] ?? `${currency} `;
    if (amount >= 1000) {
        return `${symbol}${Math.round(amount / 1000)}k`;
    }
    return `${symbol}${amount}`;
}

/** Generate a slug from a company name */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}
