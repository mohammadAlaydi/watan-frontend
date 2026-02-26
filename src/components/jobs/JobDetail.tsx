"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveJobButton } from "./SaveJobButton";
import { JobStatusBadge } from "./JobStatusBadge";
import { formatSalary, getTimeAgo } from "@/lib/jobs/utils";
import { getJobById } from "@/lib/jobs/queries";
import type { JobWithCompany } from "@/lib/jobs/queries";
import Link from "next/link";
import { toast } from "sonner";

interface JobDetailProps {
    jobId: string;
    initialJob?: JobWithCompany | null;
    isSaved?: boolean;
    isApplied?: boolean;
    onApply?: () => void;
    showBackButton?: boolean;
}

/**
 * Full job detail view — used in the right panel and the /jobs/[id] page.
 */
export function JobDetail({
    jobId,
    initialJob,
    isSaved = false,
    isApplied = false,
    onApply,
    showBackButton = false,
}: JobDetailProps) {
    const [job, setJob] = useState<JobWithCompany | null>(initialJob ?? null);
    const [loading, setLoading] = useState(!initialJob);

    useEffect(() => {
        if (initialJob) {
            setJob(initialJob);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        getJobById(jobId).then((data) => {
            if (!cancelled) {
                setJob(data);
                setLoading(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [jobId, initialJob]);

    const handleShare = useCallback(async () => {
        const url = `${window.location.origin}/jobs/${jobId}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
        } catch {
            toast.error("Failed to copy link");
        }
    }, [jobId]);

    if (loading) {
        return <JobDetailSkeleton />;
    }

    if (!job) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <p className="text-muted">Job not found</p>
            </div>
        );
    }

    const company = job.company;
    const location = [job.city, job.country].filter(Boolean).join(", ");
    const salaryText =
        job.salary_public && (job.salary_min || job.salary_max)
            ? formatSalary(
                job.salary_min,
                job.salary_max,
                job.salary_currency,
                job.salary_period
            )
            : "Not disclosed";
    const isExpired = job.status !== "active";

    return (
        <motion.div
            key={jobId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            {/* Expired notice */}
            {isExpired && (
                <div className="border-b bg-orange-50 px-4 py-2 text-center text-sm font-medium text-orange-700">
                    ⚠️ This job is no longer accepting applications
                </div>
            )}

            {/* Sticky action bar */}
            <div className="sticky top-0 z-10 border-b bg-white p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {showBackButton && (
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/jobs">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className="h-10 w-10 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive-pale text-sm font-bold text-olive">
                                {company.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted">{company.name}</p>
                            <h2 className="text-xl font-bold text-charcoal">{job.title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <SaveJobButton jobId={job.id} isSaved={isSaved} />
                        {isApplied ? (
                            <Button
                                disabled
                                className="bg-olive-pale text-olive"
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Applied
                            </Button>
                        ) : (
                            <Button
                                onClick={onApply}
                                disabled={isExpired}
                                className="bg-olive px-5 py-2.5 font-semibold hover:bg-charcoal"
                            >
                                Apply now
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="space-y-4 p-4">
                {/* Section 1: Key details grid */}
                <div className="rounded-2xl border bg-white p-5">
                    <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <DetailItem
                            icon="💼"
                            label="Employment"
                            value={job.employment_type ?? "—"}
                        />
                        <DetailItem
                            icon="🌐"
                            label="Arrangement"
                            value={job.work_arrangement ?? "—"}
                        />
                        <DetailItem
                            icon="📍"
                            label="Location"
                            value={location || "—"}
                        />
                        <DetailItem
                            icon="💰"
                            label="Salary"
                            value={salaryText}
                        />
                        <DetailItem
                            icon="📅"
                            label="Posted"
                            value={getTimeAgo(job.created_at)}
                        />
                        <DetailItem
                            icon="👥"
                            label="Company size"
                            value={company.size ?? "—"}
                        />
                    </div>

                    {/* Special tags */}
                    {(job.visa_sponsorship ||
                        job.relocation_assistance ||
                        job.arabic_required ||
                        job.arabic_preferred) && (
                            <div className="flex flex-wrap gap-2 border-t pt-3">
                                {job.visa_sponsorship && (
                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700">
                                        ✈️ Visa sponsorship available
                                    </span>
                                )}
                                {job.relocation_assistance && (
                                    <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700">
                                        📦 Relocation assistance
                                    </span>
                                )}
                                {job.arabic_required && (
                                    <span className="rounded-full bg-olive-pale px-3 py-1 text-xs text-olive">
                                        Arabic required
                                    </span>
                                )}
                                {job.arabic_preferred && !job.arabic_required && (
                                    <span className="rounded-full bg-olive-pale px-3 py-1 text-xs text-olive">
                                        Arabic preferred
                                    </span>
                                )}
                            </div>
                        )}
                </div>

                {/* Section 2: About the role */}
                {job.description && (
                    <div className="rounded-2xl border bg-white p-5">
                        <h3 className="mb-3 text-lg font-bold text-charcoal">
                            About this role
                        </h3>
                        <div className="prose prose-sm max-w-none text-charcoal">
                            {job.description.split("\n").map((line, i) => (
                                <p key={i} className="mb-2 leading-relaxed">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 3: Responsibilities */}
                {job.responsibilities && job.responsibilities.length > 0 && (
                    <div className="rounded-2xl border bg-white p-5">
                        <h3 className="mb-3 text-lg font-bold text-charcoal">
                            What you&apos;ll do
                        </h3>
                        <ul className="space-y-2">
                            {job.responsibilities.map((item, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-olive" />
                                    <span className="text-sm leading-relaxed text-charcoal">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Section 4: Requirements */}
                {((job.requirements && job.requirements.length > 0) ||
                    (job.nice_to_have && job.nice_to_have.length > 0)) && (
                        <div className="rounded-2xl border bg-white p-5">
                            <h3 className="mb-3 text-lg font-bold text-charcoal">
                                What we&apos;re looking for
                            </h3>

                            {job.requirements && job.requirements.length > 0 && (
                                <div className="mb-4">
                                    <p className="mb-2 text-sm font-semibold text-charcoal">
                                        Required
                                    </p>
                                    <ul className="space-y-2">
                                        {job.requirements.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-olive" />
                                                <span className="text-sm leading-relaxed text-charcoal">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {job.nice_to_have && job.nice_to_have.length > 0 && (
                                <div>
                                    <p className="mb-2 text-sm font-semibold text-charcoal">
                                        Nice to have
                                    </p>
                                    <ul className="space-y-2">
                                        {job.nice_to_have.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full border border-olive bg-transparent" />
                                                <span className="text-sm leading-relaxed text-muted">
                                                    {item}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                {/* Section 5: About the company */}
                <div className="rounded-2xl border bg-white p-5">
                    <div className="mb-3 flex items-center gap-3">
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className="h-12 w-12 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-olive-pale text-lg font-bold text-olive">
                                {company.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-charcoal">{company.name}</h3>
                            <p className="text-sm text-muted">
                                {[company.industry, company.size].filter(Boolean).join(" · ")}
                            </p>
                        </div>
                    </div>

                    {company.description && (
                        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-muted">
                            {company.description}
                        </p>
                    )}

                    {company.avg_overall_rating && (
                        <p className="mb-3 text-sm text-muted">
                            ⭐ {company.avg_overall_rating.toFixed(1)} ·{" "}
                            {company.review_count} review{company.review_count !== 1 ? "s" : ""}
                        </p>
                    )}

                    <Link
                        href={`/companies/${company.slug}`}
                        className="text-sm font-medium text-olive hover:underline"
                    >
                        View company profile →
                    </Link>
                </div>

                {/* Section 6: Apply CTA */}
                <div className="rounded-2xl bg-olive p-6 text-white">
                    <h3 className="mb-1 text-xl font-bold">Ready to apply?</h3>
                    <p className="mb-4 text-sm text-white/70">
                        Join {job.application_count} other applicant
                        {job.application_count !== 1 ? "s" : ""}
                    </p>

                    {isApplied ? (
                        <div>
                            <div className="inline-flex items-center rounded-xl bg-white/20 px-8 py-3 font-semibold text-white">
                                ✓ Application submitted
                            </div>
                            <p className="mt-1 text-sm text-white/60">
                                Submitted {getTimeAgo(job.created_at)}
                            </p>
                        </div>
                    ) : (
                        <Button
                            onClick={onApply}
                            disabled={isExpired}
                            className="rounded-xl bg-white px-8 py-3 font-bold text-olive hover:bg-cream"
                        >
                            Apply now →
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="mb-0.5 text-xs text-muted">
                {icon} {label}
            </p>
            <p className="text-sm font-medium capitalize text-charcoal">{value}</p>
        </div>
    );
}

/** Placeholder when no job is selected */
export function JobDetailPlaceholder() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            {/* CSS-only geometric illustration */}
            <div className="relative mb-6 h-24 w-24">
                <div className="absolute inset-0 rounded-2xl bg-olive-subtle" />
                <div className="absolute left-2 top-2 h-8 w-8 rounded-lg bg-olive/10" />
                <div className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-olive/10" />
                <div className="absolute right-4 top-6 h-6 w-12 rounded bg-olive/5" />
            </div>
            <p className="text-sm text-muted">Select a job to view details</p>
        </div>
    );
}

function JobDetailSkeleton() {
    return (
        <div className="animate-pulse p-4">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-olive-pale/50" />
                <div>
                    <div className="mb-1 h-3 w-20 rounded bg-olive-pale/50" />
                    <div className="h-5 w-48 rounded bg-olive-pale/50" />
                </div>
            </div>
            <div className="mb-4 rounded-2xl border p-5">
                <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            <div className="mb-1 h-3 w-12 rounded bg-olive-pale/50" />
                            <div className="h-4 w-24 rounded bg-olive-pale/50" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="mb-4 rounded-2xl border p-5">
                <div className="mb-3 h-5 w-32 rounded bg-olive-pale/50" />
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-4 w-full rounded bg-olive-pale/50" />
                    ))}
                </div>
            </div>
        </div>
    );
}
