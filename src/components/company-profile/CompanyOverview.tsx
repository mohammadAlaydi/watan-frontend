"use client";

import { useState } from "react";
import { CompanyRatings } from "./CompanyRatings";
import { CompanyReviewCard } from "./CompanyReviewCard";
import { AnonymityBadge } from "@/components/review/AnonymityBadge";
import { WriteReviewModal } from "@/components/review/WriteReviewModal";
import { Button } from "@/components/ui/button";
import { formatSalaryShort } from "@/lib/reviews/utils";
import type { CompanyRow, SalarySummary } from "@/lib/companies/queries";
import type { PublicReview } from "@/lib/reviews/queries";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

interface CompanyOverviewProps {
    company: CompanyRow;
    latestReviews: PublicReview[];
    salaries: SalarySummary[];
    hasReviewed: boolean;
    votedReviewIds: string[];
}

/** Overview tab content: about, ratings, review preview, and sidebar */
export function CompanyOverview({
    company,
    latestReviews,
    salaries,
    hasReviewed,
    votedReviewIds,
}: CompanyOverviewProps) {
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    return (
        <div className="mx-auto max-w-6xl px-6 py-6">
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Main column */}
                <div className="lg:col-span-7 space-y-6">
                    {/* About */}
                    <div className="rounded-2xl border border-border bg-white p-6">
                        <h3 className="mb-3 text-lg font-bold text-charcoal">
                            About {company.name}
                        </h3>
                        {company.description ? (
                            <p className="text-sm leading-relaxed text-charcoal">
                                {company.description}
                            </p>
                        ) : (
                            <p className="text-sm text-muted italic">
                                No description available yet.
                            </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                            {company.founded_year && (
                                <span>Founded {company.founded_year}</span>
                            )}
                            {company.headquarters && <span>HQ: {company.headquarters}</span>}
                            {company.website_url && (
                                <a
                                    href={company.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-olive hover:underline"
                                >
                                    Visit website →
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Ratings breakdown */}
                    <CompanyRatings company={company} />

                    {/* Latest reviews preview */}
                    {latestReviews.length > 0 && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-charcoal">
                                    Recent reviews
                                </h3>
                                <Link
                                    href={`/companies/${company.slug}?tab=reviews`}
                                    className="flex items-center gap-1 text-sm font-medium text-olive hover:underline"
                                >
                                    View all <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {latestReviews.slice(0, 3).map((review) => (
                                    <CompanyReviewCard
                                        key={review.id}
                                        review={review}
                                        isVoted={votedReviewIds.includes(review.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Write review CTA */}
                    {!hasReviewed && (
                        <div className="rounded-2xl border border-border bg-white p-5">
                            <div className="h-0.5 -mt-5 mb-4 -mx-5 rounded-t-2xl bg-gradient-to-r from-olive to-olive-light" />
                            <h4 className="text-sm font-semibold text-charcoal">
                                Share your experience
                            </h4>
                            <p className="mt-1 text-xs text-muted">
                                Help other Palestinians find great workplaces
                            </p>
                            <Button
                                onClick={() => setReviewModalOpen(true)}
                                className="mt-4 w-full bg-olive hover:bg-olive-light"
                            >
                                Write a review →
                            </Button>
                            <div className="mt-3">
                                <AnonymityBadge variant="inline" />
                            </div>
                        </div>
                    )}

                    {/* Salary insights preview */}
                    {salaries.length > 0 && (
                        <div className="rounded-2xl border border-border bg-white p-5">
                            <h4 className="text-sm font-semibold text-charcoal">
                                Salary insights
                            </h4>
                            <div className="mt-3 space-y-3">
                                {salaries.slice(0, 3).map((s) => (
                                    <div
                                        key={s.job_title}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm text-charcoal">{s.job_title}</span>
                                        <span className="text-sm font-semibold text-charcoal">
                                            {formatSalaryShort(s.min_salary, s.currency)} –{" "}
                                            {formatSalaryShort(s.max_salary, s.currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href={`/companies/${company.slug}/salaries`}
                                className="mt-3 inline-block text-sm font-medium text-olive hover:underline"
                            >
                                View all salaries →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <WriteReviewModal
                open={reviewModalOpen}
                onOpenChange={setReviewModalOpen}
                companyId={company.id}
                companyName={company.name}
                companyLogo={company.logo_url}
                companySlug={company.slug}
            />
        </div>
    );
}
