"use client";

import { useState } from "react";
import { Globe, MapPin, Users, Factory, Share2, MoreHorizontal, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarDisplay } from "@/components/review/ReviewStarInput";
import { WriteReviewModal } from "@/components/review/WriteReviewModal";
import { cn } from "@/lib/utils";
import { getRecommendStyles } from "@/lib/reviews/utils";
import type { CompanyRow } from "@/lib/companies/queries";

interface CompanyHeaderProps {
    company: CompanyRow;
    hasReviewed: boolean;
}

/** Company profile header with cover, logo, info, and actions */
export function CompanyHeader({ company, hasReviewed }: CompanyHeaderProps) {
    const [reviewModalOpen, setReviewModalOpen] = useState(false);

    return (
        <>
            {/* Cover area */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                {company.cover_url ? (
                    <img
                        src={company.cover_url}
                        alt={`${company.name} cover`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-gradient-to-r from-charcoal to-charcoal-mid">
                        {/* Geometric pattern overlay */}
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage:
                                    "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(74,92,58,0.3) 35px, rgba(74,92,58,0.3) 36px)",
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Info below cover */}
            <div className="border-b bg-white pb-6">
                <div className="mx-auto max-w-6xl px-6">
                    {/* Row 1: Logo + basic info */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative -mt-10 z-10">
                                {company.logo_url ? (
                                    <img
                                        src={company.logo_url}
                                        alt={company.name}
                                        className="h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow-sm"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-olive-pale text-2xl font-bold text-olive shadow-sm">
                                        {company.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="mt-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-black tracking-tight text-charcoal">
                                        {company.name}
                                    </h1>
                                    {company.is_claimed && (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-olive-subtle px-2 py-0.5 text-xs font-medium text-olive">
                                            <CheckCircle className="h-3 w-3" /> Claimed
                                        </span>
                                    )}
                                    {company.is_verified && (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-olive-subtle px-2 py-0.5 text-xs font-medium text-olive">
                                            <Shield className="h-3 w-3" /> Verified
                                        </span>
                                    )}
                                </div>
                                <p className="mt-0.5 text-sm text-muted">
                                    {[company.industry, company.company_size, company.founded_year ? `Est. ${company.founded_year}` : null]
                                        .filter(Boolean)
                                        .join(" · ")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Rating + Actions */}
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            {company.total_reviews > 0 ? (
                                <>
                                    <span className="text-5xl font-black text-charcoal">
                                        {Number(company.avg_overall_rating).toFixed(1)}
                                    </span>
                                    <div>
                                        <StarDisplay
                                            rating={Number(company.avg_overall_rating)}
                                            size="md"
                                        />
                                        <p className="mt-0.5 text-sm text-muted">
                                            {company.total_reviews} review{company.total_reviews !== 1 ? "s" : ""}
                                        </p>
                                        {company.recommend_percentage > 0 && (
                                            <span
                                                className={cn(
                                                    "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                                                    getRecommendStyles(company.recommend_percentage)
                                                )}
                                            >
                                                {company.recommend_percentage}% recommend
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-muted">No reviews yet</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {hasReviewed ? (
                                <Button disabled variant="outline" className="gap-1.5">
                                    <CheckCircle className="h-4 w-4" />
                                    You reviewed this company
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setReviewModalOpen(true)}
                                    className="bg-olive hover:bg-olive-light gap-1.5"
                                >
                                    ✍️ Write a review
                                </Button>
                            )}
                            <Button variant="ghost" size="icon">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick stat pills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {company.website_url && (
                            <a
                                href={company.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full bg-olive-subtle px-3 py-1 text-xs text-charcoal transition-colors hover:bg-olive-pale"
                            >
                                <Globe className="h-3 w-3" />
                                {company.website_url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                            </a>
                        )}
                        {company.headquarters && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-subtle px-3 py-1 text-xs text-charcoal">
                                <MapPin className="h-3 w-3" /> {company.headquarters}
                            </span>
                        )}
                        {company.company_size && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-subtle px-3 py-1 text-xs text-charcoal">
                                <Users className="h-3 w-3" /> {company.company_size} employees
                            </span>
                        )}
                        {company.industry && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-olive-subtle px-3 py-1 text-xs text-charcoal">
                                <Factory className="h-3 w-3" /> {company.industry}
                            </span>
                        )}
                    </div>
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
        </>
    );
}
