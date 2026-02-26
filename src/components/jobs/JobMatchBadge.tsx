"use client";

import { cn } from "@/lib/utils";

interface JobMatchBadgeProps {
    score: number;
}

/**
 * Shows a match percentage badge when score >= 60.
 * Color-coded: green for 80+, olive for 60-79.
 */
export function JobMatchBadge({ score }: JobMatchBadgeProps) {
    if (score < 60) return null;

    const isHigh = score >= 80;

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold",
                isHigh
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-olive/20 bg-olive-pale text-olive"
            )}
        >
            {isHigh && "⚡ "}
            {score}% match
        </span>
    );
}
