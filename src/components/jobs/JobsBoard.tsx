"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobSearch } from "./JobSearch";
import { JobSortBar } from "./JobSortBar";
import { JobFilters } from "./JobFilters";
import { JobsList } from "./JobsList";
import { JobDetail, JobDetailPlaceholder } from "./JobDetail";
import { JobAlertsBanner } from "./JobAlertsBanner";
import { ApplyModal } from "./ApplyModal";
import { getJobs } from "@/lib/jobs/queries";
import { calculateMatchScore } from "@/lib/jobs/utils";
import type { JobWithCompany } from "@/lib/jobs/queries";

interface JobsBoardProps {
    initialJobs: JobWithCompany[];
    initialTotal: number;
    initialSavedIds: string[];
    initialAppliedIds: string[];
    userProfile?: Record<string, unknown>;
    initialSelectedId?: string;
    initialFilters: Record<string, unknown>;
}

/**
 * Main jobs board with split-view layout:
 * Left: search + filters + scrollable list
 * Right: job detail panel (sticky)
 * Mobile: single column, clicking navigates to /jobs/[id]
 */
export function JobsBoard({
    initialJobs,
    initialTotal,
    initialSavedIds,
    initialAppliedIds,
    userProfile,
    initialSelectedId,
    initialFilters,
}: JobsBoardProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [jobs, setJobs] = useState(initialJobs);
    const [total, setTotal] = useState(initialTotal);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(
        initialSelectedId ?? initialJobs[0]?.id ?? null
    );
    const [savedIds, setSavedIds] = useState(new Set(initialSavedIds));
    const [appliedIds, setAppliedIds] = useState(new Set(initialAppliedIds));
    const [filters, setFilters] = useState(initialFilters);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [applyModalOpen, setApplyModalOpen] = useState(false);

    // Compute match scores
    const matchScores = useMemo(() => {
        const scores = new Map<string, number>();
        if (!userProfile) return scores;

        for (const job of jobs) {
            scores.set(
                job.id,
                calculateMatchScore(
                    {
                        title: job.title,
                        seniority: job.seniority,
                        work_arrangement: job.work_arrangement,
                        country: job.country,
                        requirements: job.requirements,
                        visa_sponsorship: job.visa_sponsorship,
                        arabic_preferred: job.arabic_preferred,
                        arabic_required: job.arabic_required,
                        company_industry: job.company?.industry,
                    },
                    userProfile as Record<string, unknown>
                )
            );
        }
        return scores;
    }, [jobs, userProfile]);

    // Count active filters
    const activeFilterCount = Object.values(filters).filter(
        (v) => v !== undefined && v !== "" && v !== "any"
    ).length;

    // Handle filter changes
    const handleFilterChange = useCallback(
        (key: string, value: unknown) => {
            const newFilters = { ...filters, [key]: value };
            if (value === undefined) delete newFilters[key];
            setFilters(newFilters);
            fetchJobs(newFilters, 1);
        },
        [filters]
    );

    const handleQuickFilter = useCallback(
        (key: string, value: string | boolean | undefined) => {
            handleFilterChange(key, value);
        },
        [handleFilterChange]
    );

    const handleSearch = useCallback(
        (query: string) => {
            const newFilters = { ...filters, q: query || undefined };
            if (!query) delete newFilters.q;
            setFilters(newFilters);
            fetchJobs(newFilters, 1);
        },
        [filters]
    );

    const handleSortChange = useCallback(
        (sort: string) => {
            const newFilters = { ...filters, sort };
            setFilters(newFilters);
            fetchJobs(newFilters, 1);
        },
        [filters]
    );

    const handleClearFilters = useCallback(() => {
        setFilters({});
        fetchJobs({}, 1);
    }, []);

    // Fetch jobs with filters
    const fetchJobs = async (
        filterSet: Record<string, unknown>,
        targetPage: number
    ) => {
        setIsLoading(true);
        setPage(targetPage);
        try {
            const result = await getJobs(
                { ...(filterSet as Record<string, string>), page: targetPage },
                undefined // userId handled server-side
            );
            setJobs(result.jobs);
            setTotal(result.total);
            setSavedIds(new Set(result.userSavedIds));
            setAppliedIds(new Set(result.userAppliedIds));
            if (result.jobs.length > 0 && !result.jobs.find((j) => j.id === selectedJobId)) {
                setSelectedJobId(result.jobs[0].id);
            }
        } catch {
            // Keep existing data on error
        } finally {
            setIsLoading(false);
        }
    };

    // Load more
    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setIsLoadingMore(true);
        try {
            const result = await getJobs(
                { ...(filters as Record<string, string>), page: nextPage },
                undefined
            );
            setJobs((prev) => [...prev, ...result.jobs]);
            setTotal(result.total);
            setPage(nextPage);
        } catch {
            // ignore
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Select job
    const handleSelectJob = useCallback(
        (id: string) => {
            setSelectedJobId(id);
            // Update URL without page reload
            const params = new URLSearchParams(searchParams.toString());
            params.set("id", id);
            router.push(`/jobs?${params.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    // Save toggle
    const handleSaveToggle = useCallback((jobId: string, saved: boolean) => {
        setSavedIds((prev) => {
            const next = new Set(prev);
            if (saved) next.add(jobId);
            else next.delete(jobId);
            return next;
        });
    }, []);

    // Selected job data
    const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null;

    return (
        <div>
            {/* Page header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal">Jobs</h1>
                    <p className="text-sm text-muted">
                        Opportunities curated for Palestinian professionals
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="border-olive text-olive hover:bg-olive-subtle"
                >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Post a job
                </Button>
            </div>

            {/* Alerts banner */}
            <JobAlertsBanner />

            {/* Split view */}
            <div className="flex rounded-2xl border bg-white overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
                {/* Left panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex w-full flex-col border-r border-border md:w-[420px] md:flex-shrink-0"
                >
                    <JobSearch
                        initialQuery={(filters.q as string) ?? ""}
                        onSearch={handleSearch}
                        activeFilters={filters as Record<string, string | boolean | undefined>}
                        onQuickFilter={handleQuickFilter}
                    />
                    <JobSortBar
                        total={total}
                        hasFilters={activeFilterCount > 0}
                        sort={(filters.sort as string) ?? "recent"}
                        onSortChange={handleSortChange}
                    />
                    <div className="flex-1 overflow-y-auto">
                        <JobsList
                            jobs={jobs}
                            selectedJobId={selectedJobId}
                            savedIds={savedIds}
                            appliedIds={appliedIds}
                            matchScores={matchScores}
                            isLoading={isLoading}
                            hasMore={jobs.length < total}
                            hasFilters={activeFilterCount > 0}
                            isLoadingMore={isLoadingMore}
                            onSelectJob={handleSelectJob}
                            onLoadMore={handleLoadMore}
                            onClearFilters={handleClearFilters}
                            onSaveToggle={handleSaveToggle}
                        />
                    </div>
                </motion.div>

                {/* Right panel (hidden on mobile) */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="hidden flex-1 overflow-y-auto md:block"
                >
                    {selectedJob ? (
                        <JobDetail
                            jobId={selectedJob.id}
                            initialJob={selectedJob}
                            isSaved={savedIds.has(selectedJob.id)}
                            isApplied={appliedIds.has(selectedJob.id)}
                            onApply={() => setApplyModalOpen(true)}
                        />
                    ) : (
                        <JobDetailPlaceholder />
                    )}
                </motion.div>
            </div>

            {/* Apply modal */}
            {selectedJob && (
                <ApplyModal
                    open={applyModalOpen}
                    onOpenChange={setApplyModalOpen}
                    job={selectedJob}
                    userProfile={
                        userProfile
                            ? {
                                fullName: userProfile.full_name as string | undefined,
                                email: userProfile.email as string | undefined,
                                resumeUrl: userProfile.resume_url as string | undefined,
                                linkedinUrl: userProfile.linkedin_url as string | undefined,
                                portfolioUrl: userProfile.portfolio_url as
                                    | string
                                    | undefined,
                            }
                            : undefined
                    }
                />
            )}

            {/* Mobile: filter FAB is rendered by JobFilters internally */}
            <JobFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearFilters}
                activeCount={activeFilterCount}
            />
        </div>
    );
}
