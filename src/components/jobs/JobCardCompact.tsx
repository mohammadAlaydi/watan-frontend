"use client";

import { cn } from "@/lib/utils";
import { JobMatchBadge } from "./JobMatchBadge";
import { JobStatusBadge } from "./JobStatusBadge";
import { SaveJobButton } from "./SaveJobButton";
import { formatSalary, getTimeAgo } from "@/lib/jobs/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { JobWithCompany } from "@/lib/jobs/queries";

interface JobCardCompactProps {
    job: JobWithCompany;
    isSaved: boolean;
    matchScore: number;
    savedAt?: string;
}

/**
 * Wider card with more detail — used in Saved Jobs and similar pages.
 * Shows a "Position filled" overlay when job is closed.
 */
export function JobCardCompact({
    job,
    isSaved,
    matchScore,
    savedAt,
}: JobCardCompactProps) {
    const company = job.company;
    const isClosed = job.status === "closed" || job.status === "paused";
    const location = [job.city, job.country].filter(Boolean).join(", ");
    const salaryText =
        job.salary_public && (job.salary_min || job.salary_max)
            ? formatSalary(
                job.salary_min,
                job.salary_max,
                job.salary_currency,
                job.salary_period
            )
            : null;

    return (
        <div
            className={cn(
                "relative mb-3 rounded-2xl border bg-white p-5",
                isClosed && "opacity-60"
            )}
        >
            {/* Closed overlay */}
            {isClosed && (
                <div className="absolute left-0 right-0 top-0 rounded-t-2xl bg-orange-50 px-4 py-2 text-center text-sm font-medium text-orange-700">
                    ⚠️ This position has been filled
                </div>
            )}

            <div className={cn("flex gap-4", isClosed && "mt-8")}>
                {/* Company logo */}
                {company.logo_url ? (
                    <img
                        src={company.logo_url}
                        alt={company.name}
                        className="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
                    />
                ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-olive-pale text-sm font-bold text-olive">
                        {company.name.charAt(0)}
                    </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                    {/* Row 1: Company name + Save */}
                    <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-muted">
                            {company.name}
                        </span>
                        <SaveJobButton jobId={job.id} isSaved={isSaved} />
                    </div>

                    {/* Row 2: Title */}
                    <h3 className="mb-2 text-lg font-bold text-charcoal">
                        {job.title}
                    </h3>

                    {/* Row 3: Tags */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <JobStatusBadge arrangement={job.work_arrangement} />
                        {location && (
                            <span className="rounded-md border border-border px-2 py-0.5 text-xs text-muted">
                                📍 {location}
                            </span>
                        )}
                        {job.seniority && (
                            <span className="rounded-md border border-border bg-cream px-2 py-0.5 text-xs capitalize text-muted">
                                {job.seniority}
                            </span>
                        )}
                    </div>

                    {/* Row 4: Salary + Match */}
                    <div className="mb-3 flex items-center justify-between">
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

                    {/* Row 5: Footer */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">
                            {savedAt ? `Saved ${getTimeAgo(savedAt)}` : getTimeAgo(job.created_at)}
                        </span>
                        {!isClosed && (
                            <Button
                                size="sm"
                                className="bg-olive hover:bg-olive-light"
                                asChild
                            >
                                <Link href={`/jobs?id=${job.id}`}>Apply now →</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
