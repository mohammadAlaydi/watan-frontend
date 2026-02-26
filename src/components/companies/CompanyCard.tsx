"use client";

import Link from "next/link";
import { MapPin, Users, Star, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecommendStyles } from "@/lib/reviews/utils";
import type { CompanyRow } from "@/lib/companies/queries";

interface CompanyCardProps {
    company: CompanyRow;
}

/** Card used in company directory grid */
export function CompanyCard({ company }: CompanyCardProps) {
    return (
        <Link
            href={`/companies/${company.slug}`}
            className={cn(
                "group block rounded-2xl border border-border bg-white p-5",
                "transition-all duration-200",
                "hover:-translate-y-1 hover:shadow-md hover:border-olive/20"
            )}
        >
            {/* Top row: logo + name + rating */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {company.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="h-12 w-12 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive-pale text-sm font-bold text-olive">
                            {company.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-bold text-charcoal group-hover:text-olive transition-colors">
                            {company.name}
                        </h3>
                        {company.industry && (
                            <span className="inline-block mt-0.5 rounded-md bg-olive-subtle px-2 py-0.5 text-xs text-olive">
                                {company.industry}
                            </span>
                        )}
                    </div>
                </div>

                {company.total_reviews > 0 && (
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-gold text-gold" />
                        <span className="text-lg font-bold text-charcoal">
                            {Number(company.avg_overall_rating).toFixed(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Description */}
            {company.description && (
                <p className="mt-3 text-sm text-muted line-clamp-1">
                    {company.description}
                </p>
            )}

            {/* Stats row */}
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted">
                {company.headquarters && (
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {company.headquarters}
                    </span>
                )}
                {company.company_size && (
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {company.company_size}
                    </span>
                )}
                <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" /> {company.total_reviews} reviews
                </span>
            </div>

            {/* Recommend pill */}
            {company.total_reviews > 0 && company.recommend_percentage > 0 && (
                <div className="mt-3 flex items-center gap-2">
                    <span
                        className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            getRecommendStyles(company.recommend_percentage)
                        )}
                    >
                        {company.recommend_percentage}% would recommend
                    </span>
                </div>
            )}
        </Link>
    );
}
