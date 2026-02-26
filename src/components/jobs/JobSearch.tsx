"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Building2, Briefcase } from "lucide-react";
import { searchJobSuggestions } from "@/lib/jobs/queries";
import { cn } from "@/lib/utils";

interface JobSearchProps {
    initialQuery: string;
    onSearch: (query: string) => void;
    activeFilters: {
        arrangement?: string;
        featured?: boolean;
        visaSponsorship?: boolean;
        arabicPreferred?: boolean;
        seniority?: string;
        employmentType?: string;
    };
    onQuickFilter: (key: string, value: string | boolean | undefined) => void;
}

interface Suggestions {
    titles: string[];
    companies: { name: string; slug: string; logo_url: string | null }[];
}

const QUICK_FILTERS = [
    { key: "arrangement", value: "remote", label: "Remote" },
    { key: "employmentType", value: "full-time", label: "Full-time" },
    { key: "seniority", value: "senior", label: "Senior" },
    { key: "visaSponsorship", value: true, label: "Visa Sponsorship" },
    { key: "arabicPreferred", value: true, label: "Arabic Preferred" },
    { key: "featured", value: true, label: "Featured" },
] as const;

/**
 * Search bar with debounced autocomplete and quick filter pills.
 */
export function JobSearch({
    initialQuery,
    onSearch,
    activeFilters,
    onQuickFilter,
}: JobSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 2) {
            setSuggestions(null);
            setShowSuggestions(false);
            return;
        }
        try {
            const result = await searchJobSuggestions(q);
            setSuggestions(result);
            setShowSuggestions(true);
        } catch {
            setSuggestions(null);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        onSearch(query);
    };

    const handleClear = () => {
        setQuery("");
        setSuggestions(null);
        setShowSuggestions(false);
        onSearch("");
    };

    const selectSuggestion = (text: string) => {
        setQuery(text);
        setShowSuggestions(false);
        onSearch(text);
    };

    const isQuickFilterActive = (
        key: string,
        value: string | boolean
    ): boolean => {
        const current = activeFilters[key as keyof typeof activeFilters];
        return current === value;
    };

    const handleQuickFilter = (key: string, value: string | boolean) => {
        const current = activeFilters[key as keyof typeof activeFilters];
        onQuickFilter(key, current === value ? undefined : value);
    };

    return (
        <div
            ref={containerRef}
            className="sticky top-0 z-10 border-b bg-white p-4"
        >
            {/* Search input */}
            <form onSubmit={handleSubmit} className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => suggestions && setShowSuggestions(true)}
                    placeholder="Job title, keyword, or company..."
                    className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-10 text-sm text-charcoal placeholder:text-muted/60 focus:border-olive focus:outline-none focus:ring-1 focus:ring-olive"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-white shadow-lg">
                        {suggestions.titles.length > 0 && (
                            <div className="border-b border-border p-2">
                                <p className="mb-1 px-2 text-xs font-semibold uppercase text-muted">
                                    Job titles
                                </p>
                                {suggestions.titles.map((title) => (
                                    <button
                                        key={title}
                                        type="button"
                                        onClick={() => selectSuggestion(title)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-charcoal hover:bg-olive-subtle"
                                    >
                                        <Briefcase className="h-3.5 w-3.5 text-muted" />
                                        {title}
                                    </button>
                                ))}
                            </div>
                        )}
                        {suggestions.companies.length > 0 && (
                            <div className="p-2">
                                <p className="mb-1 px-2 text-xs font-semibold uppercase text-muted">
                                    Companies
                                </p>
                                {suggestions.companies.map((company) => (
                                    <button
                                        key={company.slug}
                                        type="button"
                                        onClick={() => selectSuggestion(company.name)}
                                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-charcoal hover:bg-olive-subtle"
                                    >
                                        {company.logo_url ? (
                                            <img
                                                src={company.logo_url}
                                                alt=""
                                                className="h-4 w-4 rounded object-cover"
                                            />
                                        ) : (
                                            <Building2 className="h-3.5 w-3.5 text-muted" />
                                        )}
                                        {company.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </form>

            {/* Quick filter pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {QUICK_FILTERS.map((filter) => (
                    <button
                        key={filter.label}
                        type="button"
                        onClick={() => handleQuickFilter(filter.key, filter.value)}
                        className={cn(
                            "flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                            isQuickFilterActive(filter.key, filter.value)
                                ? "border border-olive bg-olive text-white"
                                : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                        )}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
