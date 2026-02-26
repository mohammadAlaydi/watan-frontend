"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecommendStyles } from "@/lib/reviews/utils";
import type { CompanyRow } from "@/lib/companies/queries";

interface CompanyRatingsProps {
    company: CompanyRow;
    ratingDistribution?: { stars: number; count: number; percentage: number }[];
}

const CATEGORY_LABELS: { key: string; label: string }[] = [
    { key: "avg_culture_rating", label: "Culture & Values" },
    { key: "avg_management_rating", label: "Senior Management" },
    { key: "avg_worklife_rating", label: "Work-Life Balance" },
    { key: "avg_compensation_rating", label: "Compensation & Benefits" },
    { key: "avg_growth_rating", label: "Career Growth" },
];

/** Rating breakdown card with animated bars */
export function CompanyRatings({
    company,
    ratingDistribution,
}: CompanyRatingsProps) {
    if (company.total_reviews === 0) {
        return (
            <div className="rounded-2xl border border-border bg-white p-6">
                <h3 className="text-lg font-bold text-charcoal">Ratings overview</h3>
                <div className="mt-8 flex flex-col items-center py-8">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="text-sm text-muted">No reviews yet</p>
                    <p className="mt-1 text-xs text-muted">
                        Be the first to share your experience
                    </p>
                </div>
            </div>
        );
    }

    const limitedData = company.total_reviews <= 2;

    return (
        <div className="rounded-2xl border border-border bg-white p-6">
            <h3 className="mb-6 text-lg font-bold text-charcoal">Ratings overview</h3>

            {/* Overall rating */}
            <div className="mb-6 flex items-center gap-4 text-center">
                <span className="text-6xl font-black text-charcoal">
                    {Number(company.avg_overall_rating).toFixed(1)}
                </span>
                <div className="text-left">
                    <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                                key={s}
                                className={cn(
                                    "h-5 w-5",
                                    s <= Math.round(Number(company.avg_overall_rating))
                                        ? "fill-gold text-gold"
                                        : "fill-transparent text-muted/25"
                                )}
                            />
                        ))}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                        {company.total_reviews} rating{company.total_reviews !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {limitedData && (
                <p className="mb-4 text-xs italic text-muted">
                    Based on limited data. Rating may not be representative.
                </p>
            )}

            {/* Category rating bars */}
            <div className="space-y-3">
                {CATEGORY_LABELS.map((cat) => {
                    const rating = Number(
                        (company as unknown as Record<string, unknown>)[cat.key] ?? 0
                    );
                    return (
                        <div key={cat.key} className="flex items-center gap-3">
                            <span className="w-40 text-sm font-medium text-charcoal">
                                {cat.label}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-olive-pale overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-olive"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(rating / 5) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                            </div>
                            <span className="w-8 text-right text-sm font-bold text-charcoal">
                                {rating > 0 ? rating.toFixed(1) : "--"}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Recommend meter */}
            {company.recommend_percentage > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                    <div className="mb-2 flex h-3 overflow-hidden rounded-full">
                        <div
                            className="bg-olive transition-all"
                            style={{ width: `${company.recommend_percentage}%` }}
                        />
                        <div className="flex-1 bg-muted/15" />
                    </div>
                    <p className="text-sm text-muted">
                        <span className="font-semibold text-charcoal">
                            {company.recommend_percentage}%
                        </span>{" "}
                        of reviewers recommend this company
                    </p>
                </div>
            )}

            {/* Rating distribution */}
            {ratingDistribution && ratingDistribution.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                    <h4 className="mb-3 text-sm font-semibold text-charcoal">
                        Rating distribution
                    </h4>
                    <div className="space-y-1.5">
                        {ratingDistribution.map((row) => (
                            <div key={row.stars} className="flex items-center gap-2">
                                <span className="w-8 text-xs text-muted">{row.stars}★</span>
                                <div className="flex-1 h-2 rounded-full bg-olive-pale overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-olive"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${row.percentage}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                    />
                                </div>
                                <span className="w-6 text-right text-xs text-muted">
                                    {row.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
