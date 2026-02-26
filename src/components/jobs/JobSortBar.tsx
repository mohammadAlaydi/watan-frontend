"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface JobSortBarProps {
    total: number;
    hasFilters: boolean;
    sort: string;
    onSortChange: (sort: string) => void;
}

/**
 * Results count and sort selector below the search bar.
 */
export function JobSortBar({
    total,
    hasFilters,
    sort,
    onSortChange,
}: JobSortBarProps) {
    return (
        <div className="flex items-center justify-between p-4 pt-0">
            <p className="text-sm text-muted">
                <span className="font-medium text-charcoal">{total}</span> jobs found
                {hasFilters && (
                    <span className="ml-1 text-olive"> · Filtered</span>
                )}
            </p>
            <Select value={sort} onValueChange={onSortChange}>
                <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="recent">Most recent</SelectItem>
                    <SelectItem value="match">Best match</SelectItem>
                    <SelectItem value="salary_desc">Salary: High to Low</SelectItem>
                    <SelectItem value="applications">Most applications</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
