"use client";

import { useState } from "react";
import { CompanyReviewCard } from "./CompanyReviewCard";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { PublicReview } from "@/lib/reviews/queries";

interface CompanyReviewsListProps {
    reviews: PublicReview[];
    total: number;
    votedReviewIds: string[];
    companySlug: string;
}

/** Full reviews list with sorting, filtering, and load more */
export function CompanyReviewsList({
    reviews: initialReviews,
    total,
    votedReviewIds,
    companySlug,
}: CompanyReviewsListProps) {
    const [sort, setSort] = useState("recent");
    const [statusFilter, setStatusFilter] = useState("all");

    // Filter reviews client-side for demo (in production, refetch from server)
    const filteredReviews = initialReviews.filter((r) => {
        if (statusFilter === "current") return r.employment_status === "current";
        if (statusFilter === "former") return r.employment_status === "former";
        return true;
    });

    // Sort client-side
    const sortedReviews = [...filteredReviews].sort((a, b) => {
        switch (sort) {
            case "helpful":
                return b.helpful_count - a.helpful_count;
            case "highest":
                return b.overall_rating - a.overall_rating;
            case "lowest":
                return a.overall_rating - b.overall_rating;
            default:
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });

    if (initialReviews.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16">
                    <div className="text-4xl mb-3">📝</div>
                    <h3 className="text-lg font-semibold text-charcoal">
                        No reviews yet
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                        Be the first to share your experience
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-6">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-charcoal">Reviews</h3>
                    <span className="rounded-full bg-olive-subtle px-2 py-0.5 text-xs font-medium text-olive">
                        {total}
                    </span>
                </div>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-44 h-9 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">Most recent</SelectItem>
                        <SelectItem value="helpful">Most helpful</SelectItem>
                        <SelectItem value="highest">Highest rated</SelectItem>
                        <SelectItem value="lowest">Lowest rated</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Filter pills */}
            <div className="mb-4 flex flex-wrap gap-2">
                {["all", "current", "former"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                            statusFilter === status
                                ? "border-olive bg-olive text-white"
                                : "border-border bg-white text-charcoal hover:border-olive/30"
                        )}
                    >
                        {status === "all"
                            ? "All"
                            : status === "current"
                                ? "Current employees"
                                : "Former employees"}
                    </button>
                ))}
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
                {sortedReviews.map((review) => (
                    <CompanyReviewCard
                        key={review.id}
                        review={review}
                        isVoted={votedReviewIds.includes(review.id)}
                    />
                ))}
            </div>

            {sortedReviews.length < total && (
                <div className="mt-6 flex justify-center">
                    <Button variant="outline" className="text-olive border-olive hover:bg-olive-subtle">
                        Load more reviews
                    </Button>
                </div>
            )}
        </div>
    );
}
