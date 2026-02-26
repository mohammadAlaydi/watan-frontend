"use client";

import { JobCard, JobCardSkeleton } from "./JobCard";
import { JobsEmptyState } from "./JobsEmptyState";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { JobWithCompany } from "@/lib/jobs/queries";

interface JobsListProps {
    jobs: JobWithCompany[];
    selectedJobId: string | null;
    savedIds: Set<string>;
    appliedIds: Set<string>;
    matchScores: Map<string, number>;
    isLoading: boolean;
    hasMore: boolean;
    hasFilters: boolean;
    isLoadingMore: boolean;
    onSelectJob: (id: string) => void;
    onLoadMore: () => void;
    onClearFilters: () => void;
    onSaveToggle: (jobId: string, saved: boolean) => void;
}

/**
 * Scrollable list of JobCards with load-more pagination.
 */
export function JobsList({
    jobs,
    selectedJobId,
    savedIds,
    appliedIds,
    matchScores,
    isLoading,
    hasMore,
    hasFilters,
    isLoadingMore,
    onSelectJob,
    onLoadMore,
    onClearFilters,
    onSaveToggle,
}: JobsListProps) {
    if (isLoading) {
        return (
            <div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <JobCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <JobsEmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />
        );
    }

    return (
        <div>
            {jobs.map((job) => (
                <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJobId === job.id}
                    isSaved={savedIds.has(job.id)}
                    isApplied={appliedIds.has(job.id)}
                    matchScore={matchScores.get(job.id) ?? 0}
                    onSelect={onSelectJob}
                    onSaveToggle={(saved) => onSaveToggle(job.id, saved)}
                />
            ))}

            {hasMore && (
                <div className="p-4 text-center">
                    <Button
                        variant="outline"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="w-full border-olive text-olive hover:bg-olive-subtle"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Show 20 more jobs"
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
