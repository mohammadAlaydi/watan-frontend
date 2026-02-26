"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getTimeAgo } from "@/lib/jobs/utils";
import Link from "next/link";
import type { ApplicationWithJob } from "@/lib/jobs/queries";

interface ApplicationCardProps {
    application: ApplicationWithJob;
    onWithdraw?: (id: string) => void;
}

const STATUS_CONFIG: Record<
    string,
    { label: string; classes: string; borderClass: string }
> = {
    submitted: {
        label: "Submitted",
        classes: "bg-gray-100 text-muted",
        borderClass: "border-l-gray-400",
    },
    reviewing: {
        label: "Under review",
        classes: "bg-blue-50 text-blue-700",
        borderClass: "border-l-blue-400",
    },
    interview: {
        label: "Interview",
        classes: "bg-yellow-50 text-yellow-700",
        borderClass: "border-l-yellow-400",
    },
    offer: {
        label: "Offer received! 🎉",
        classes: "bg-green-50 text-green-700",
        borderClass: "border-l-green-400",
    },
    rejected: {
        label: "Not selected",
        classes: "bg-red-50 text-red-600",
        borderClass: "border-l-red-400",
    },
    withdrawn: {
        label: "Withdrawn",
        classes: "bg-gray-50 text-gray-500",
        borderClass: "border-l-gray-300",
    },
};

/**
 * Card for the applications history page.
 * Color-coded left border based on application status.
 */
export function ApplicationCard({
    application,
    onWithdraw,
}: ApplicationCardProps) {
    const { job, company, status } = application;
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
    const location = [job.country, job.city].filter(Boolean).join(", ");
    const canWithdraw = status === "submitted" || status === "reviewing";
    const isCelebration = status === "interview" || status === "offer";

    return (
        <div
            className={cn(
                "mb-3 rounded-2xl border border-l-4 bg-white p-5",
                config.borderClass
            )}
        >
            {/* Row 1: Company + Status */}
            <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
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
                        <p className="text-sm font-medium text-muted">{company.name}</p>
                        <h3 className="font-bold text-charcoal">{job.title}</h3>
                    </div>
                </div>
                <span
                    className={cn(
                        "flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                        config.classes
                    )}
                >
                    {config.label}
                </span>
            </div>

            {/* Row 2: Job details */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {job.work_arrangement && (
                    <span className="capitalize">{job.work_arrangement}</span>
                )}
                {location && (
                    <>
                        <span>·</span>
                        <span>{location}</span>
                    </>
                )}
                {job.seniority && (
                    <>
                        <span>·</span>
                        <span className="capitalize">{job.seniority}</span>
                    </>
                )}
            </div>

            {/* Row 3: Timeline */}
            <p className="mb-3 text-xs text-muted">
                Applied {getTimeAgo(application.applied_at)}
                {application.status_updated_at &&
                    application.status_updated_at !== application.applied_at && (
                        <> · Status updated {getTimeAgo(application.status_updated_at)}</>
                    )}
            </p>

            {/* Row 4: Actions */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/jobs/${application.job_id}`}>View job</Link>
                </Button>

                <div>
                    {canWithdraw && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() => onWithdraw?.(application.id)}
                        >
                            Withdraw application
                        </Button>
                    )}
                    {isCelebration && (
                        <span className="text-sm font-medium text-green-600">
                            🎉 Congratulations!
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
