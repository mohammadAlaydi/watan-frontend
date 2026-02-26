"use client";

import { Briefcase, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface JobsEmptyStateProps {
    hasFilters: boolean;
    onClearFilters?: () => void;
}

/**
 * Empty state for the jobs list — different messages based on
 * whether filters are active or the platform has no jobs at all.
 */
export function JobsEmptyState({
    hasFilters,
    onClearFilters,
}: JobsEmptyStateProps) {
    if (hasFilters) {
        return (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-olive-pale">
                    <SearchX className="h-7 w-7 text-olive" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-charcoal">
                    No jobs match your search
                </h3>
                <p className="mb-6 max-w-xs text-sm text-muted">
                    Try adjusting your filters or search terms
                </p>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={onClearFilters}
                        className="bg-olive hover:bg-olive-light"
                    >
                        Clear filters
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/jobs">Browse all jobs</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-olive-pale">
                <Briefcase className="h-7 w-7 text-olive" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-charcoal">
                Jobs are coming soon
            </h3>
            <p className="mb-6 max-w-xs text-sm text-muted">
                We&apos;re onboarding employers. Check back soon.
            </p>
            <Link href="/jobs" className="text-sm font-medium text-olive hover:underline">
                Set up a job alert →
            </Link>
        </div>
    );
}
