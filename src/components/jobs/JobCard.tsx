"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { JobMatchBadge } from "./JobMatchBadge";
import { JobStatusBadge } from "./JobStatusBadge";
import { SaveJobButton } from "./SaveJobButton";
import { formatSalary, getTimeAgo, isJobNew } from "@/lib/jobs/utils";
import type { JobWithCompany } from "@/lib/jobs/queries";

interface JobCardProps {
    job: JobWithCompany;
    isSelected: boolean;
    isSaved: boolean;
    isApplied: boolean;
    matchScore: number;
    onSelect: (id: string) => void;
    onSaveToggle?: (saved: boolean) => void;
}

/**
 * Job card in the left panel list.
 * Memoized for performance with large lists.
 */
export const JobCard = React.memo(function JobCard({
    job,
    isSelected,
    isSaved,
    isApplied,
    matchScore,
    onSelect,
    onSaveToggle,
}: JobCardProps) {
    const company = job.company;
    const salaryText =
        job.salary_public && (job.salary_min || job.salary_max)
            ? formatSalary(
                job.salary_min,
                job.salary_max,
                job.salary_currency,
                job.salary_period
            )
            : null;

    const isNew = isJobNew(job.created_at);
    const timeAgo = getTimeAgo(job.created_at);
    const location = [job.city, job.country].filter(Boolean).join(", ");

    return (
        <div
            onClick={() => onSelect(job.id)}
            className={cn(
                "cursor-pointer border-b border-border p-4 transition-colors duration-150",
                isSelected
                    ? "border-l-4 border-l-olive bg-olive-subtle"
                    : "bg-white hover:bg-olive-subtle/40",
                isApplied && !isSelected && "opacity-75"
            )}
        >
            {/* Row 1: Company + Save */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {company.logo_url ? (
                        <img
                            src={company.logo_url}
                            alt={company.name}
                            className="h-9 w-9 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive-pale text-xs font-bold text-olive">
                            {company.name.charAt(0)}
                        </div>
                    )}
                    <span className="text-sm font-medium text-muted">
                        {company.name}
                    </span>
                </div>
                <SaveJobButton
                    jobId={job.id}
                    isSaved={isSaved}
                    onToggle={onSaveToggle}
                />
            </div>

            {/* Row 2: Job title */}
            <h3 className="mb-2 text-base font-bold leading-tight text-charcoal">
                {job.featured && (
                    <span className="mr-1 text-gold">✦</span>
                )}
                {job.title}
            </h3>

            {/* Row 3: Key details */}
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <JobStatusBadge arrangement={job.work_arrangement} />
                {location && (
                    <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted">
                        📍 {location}
                    </span>
                )}
                {job.seniority && (
                    <span className="rounded-md border border-border bg-cream px-2 py-0.5 text-xs text-muted capitalize">
                        {job.seniority}
                    </span>
                )}
            </div>

            {/* Row 4: Salary + Match */}
            <div className="mb-2 flex items-center justify-between">
                {salaryText ? (
                    <span className="text-sm font-semibold text-charcoal">
                        {salaryText}
                    </span>
                ) : (
                    <span className="text-sm italic text-muted">
                        Salary not disclosed
                    </span>
                )}
                <JobMatchBadge score={matchScore} />
            </div>

            {/* Row 5: Tags */}
            {(job.visa_sponsorship ||
                job.relocation_assistance ||
                job.arabic_preferred) && (
                    <div className="mb-2 flex flex-wrap gap-2">
                        {job.visa_sponsorship && (
                            <span className="text-[10px] font-medium text-olive">
                                Visa Sponsorship ✓
                            </span>
                        )}
                        {job.relocation_assistance && (
                            <span className="text-[10px] font-medium text-olive">
                                Relocation ✓
                            </span>
                        )}
                        {job.arabic_preferred && (
                            <span className="text-[10px] font-medium text-olive">
                                Arabic preferred
                            </span>
                        )}
                    </div>
                )}

            {/* Row 6: Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted">
                    {isNew ? (
                        <span className="font-medium text-gold">🆕 New today</span>
                    ) : (
                        <span>{timeAgo}</span>
                    )}
                    {job.featured && !isNew && (
                        <span className="font-medium text-gold">⭐ Featured</span>
                    )}
                </div>
                <span className="text-xs text-muted">
                    {job.application_count > 100
                        ? "100+ applicants"
                        : `${job.application_count} applicant${job.application_count !== 1 ? "s" : ""}`}
                </span>
            </div>
        </div>
    );
});

/** Skeleton placeholder for loading state */
export function JobCardSkeleton() {
    return (
        <div className="animate-pulse border-b border-border p-4">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-olive-pale/50" />
                    <div className="h-4 w-24 rounded bg-olive-pale/50" />
                </div>
                <div className="h-6 w-6 rounded bg-olive-pale/50" />
            </div>
            <div className="mb-2 h-5 w-3/4 rounded bg-olive-pale/50" />
            <div className="mb-2 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-olive-pale/50" />
                <div className="h-6 w-20 rounded-full bg-olive-pale/50" />
            </div>
            <div className="mb-2 h-4 w-1/2 rounded bg-olive-pale/50" />
            <div className="flex justify-between">
                <div className="h-3 w-20 rounded bg-olive-pale/50" />
                <div className="h-3 w-16 rounded bg-olive-pale/50" />
            </div>
        </div>
    );
}
