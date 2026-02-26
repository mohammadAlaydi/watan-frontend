"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Lock, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    getRatingBorderColor,
    formatReviewDate,
    calculateTenure,
} from "@/lib/reviews/utils";
import { ReviewHelpfulButton } from "@/components/review/ReviewHelpfulButton";
import { ReviewReportButton } from "@/components/review/ReviewReportButton";
import { StarDisplay } from "@/components/review/ReviewStarInput";
import type { PublicReview } from "@/lib/reviews/queries";

interface CompanyReviewCardProps {
    review: PublicReview;
    isVoted: boolean;
}

const CATEGORY_LABELS: { key: keyof PublicReview; label: string }[] = [
    { key: "culture_rating", label: "Culture" },
    { key: "management_rating", label: "Mgmt" },
    { key: "worklife_rating", label: "Work-Life" },
    { key: "compensation_rating", label: "Pay" },
    { key: "growth_rating", label: "Growth" },
];

/**
 * Individual review display card.
 * NEVER displays reviewer_id or identifying information.
 */
export function CompanyReviewCard({
    review,
    isVoted,
}: CompanyReviewCardProps) {
    const [expanded, setExpanded] = useState(false);
    const tenure = calculateTenure(
        review.employment_start_year,
        review.employment_end_year,
        review.employment_status
    );

    const shouldTruncatePros = (review.pros ?? "").length > 250;
    const shouldTruncateCons = (review.cons ?? "").length > 250;

    return (
        <div
            className={cn(
                "rounded-2xl border border-border bg-white p-6",
                "border-l-4",
                getRatingBorderColor(review.overall_rating)
            )}
        >
            {/* Section 1: Header */}
            <div className="flex items-start justify-between">
                <div>
                    <StarDisplay rating={review.overall_rating} size="sm" />
                    <h4 className="mt-1 text-lg font-bold text-charcoal">
                        {review.title}
                    </h4>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted">
                        {formatReviewDate(review.created_at)}
                    </span>
                    <span
                        className={cn(
                            "rounded-md px-2 py-0.5 text-xs",
                            "bg-olive-subtle text-olive"
                        )}
                    >
                        {review.employment_status === "current"
                            ? "Current Employee"
                            : review.employment_status === "former"
                                ? "Former Employee"
                                : "Contractor"}
                        {tenure && ` · ${tenure}`}
                    </span>
                </div>
            </div>

            {/* Section 2: Role info */}
            <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted">
                    {review.job_title}
                    {review.work_location && ` · ${review.work_location}`}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted/70">
                    <Lock className="h-3 w-3" /> Anonymous
                </span>
            </div>

            {/* Section 3: Category ratings (compact) */}
            <div className="mt-3 flex flex-wrap gap-3">
                {CATEGORY_LABELS.map((cat) => {
                    const value = review[cat.key] as number | null;
                    if (!value) return null;
                    return (
                        <span key={cat.key} className="text-xs text-muted">
                            {cat.label}:{" "}
                            <span className="font-semibold text-charcoal">{value}</span>
                            <span className="text-gold">/5</span>
                        </span>
                    );
                })}
            </div>

            {/* Section 4: Written review */}
            <div className="mt-4 space-y-4">
                {/* Pros */}
                <div>
                    <div className="mb-1 flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5 text-olive" />
                        <span className="text-sm font-semibold text-charcoal">Pros</span>
                    </div>
                    <p className="text-sm leading-relaxed text-charcoal">
                        {shouldTruncatePros && !expanded
                            ? `${review.pros.slice(0, 250)}...`
                            : review.pros}
                    </p>
                </div>

                {/* Cons */}
                <div>
                    <div className="mb-1 flex items-center gap-1.5">
                        <ThumbsDown className="h-3.5 w-3.5 text-orange-400" />
                        <span className="text-sm font-semibold text-charcoal">Cons</span>
                    </div>
                    <p className="text-sm leading-relaxed text-charcoal">
                        {shouldTruncateCons && !expanded
                            ? `${review.cons.slice(0, 250)}...`
                            : review.cons}
                    </p>
                </div>

                {/* Advice */}
                {review.advice_to_management && (expanded || !shouldTruncatePros) && (
                    <div>
                        <div className="mb-1 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-gold" />
                            <span className="text-sm font-semibold text-charcoal">
                                Advice to management
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-charcoal">
                            {review.advice_to_management}
                        </p>
                    </div>
                )}

                {/* Read more toggle */}
                {(shouldTruncatePros || shouldTruncateCons) && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-sm font-medium text-olive hover:underline"
                    >
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}
            </div>

            {/* Section 5: Recommend */}
            {review.recommends_company !== null && (
                <div className="mt-4">
                    <span
                        className={cn(
                            "text-sm font-medium",
                            review.recommends_company ? "text-olive" : "text-destructive"
                        )}
                    >
                        {review.recommends_company
                            ? "✓ Recommends this company"
                            : "✗ Does not recommend"}
                    </span>
                </div>
            )}

            {/* Section 6: Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                <ReviewHelpfulButton
                    reviewId={review.id}
                    initialCount={review.helpful_count}
                    initialVoted={isVoted}
                />
                <ReviewReportButton reviewId={review.id} />
            </div>
        </div>
    );
}
