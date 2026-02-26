"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { searchCompanies } from "@/lib/companies/queries";
import type { CompanyRow } from "@/lib/companies/queries";

/** Search input with debounced autocomplete suggestions */
export function CompanySearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") ?? "");
    const [suggestions, setSuggestions] = useState<CompanyRow[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const fetchSuggestions = useCallback(async (q: string) => {
        if (q.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }
        const results = await searchCompanies(q, 6);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
    }, []);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => fetchSuggestions(query), 300);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [query, fetchSuggestions]);

    // Close on click outside
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSelect = (company: CompanyRow) => {
        setIsOpen(false);
        router.push(`/companies/${company.slug}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            handleSelect(suggestions[selectedIndex]);
            return;
        }
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
            params.set("q", query.trim());
        } else {
            params.delete("q");
        }
        params.delete("page");
        setIsOpen(false);
        router.push(`/companies?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, -1));
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search companies by name, industry, or location..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                        className={cn(
                            "h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4",
                            "text-sm text-charcoal placeholder:text-muted/50",
                            "outline-none transition-colors",
                            "focus:border-olive focus:ring-2 focus:ring-olive/20"
                        )}
                    />
                </div>
            </form>

            {/* Suggestions dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-white shadow-lg">
                    {suggestions.map((company, index) => (
                        <button
                            key={company.id}
                            type="button"
                            onClick={() => handleSelect(company)}
                            className={cn(
                                "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                                "first:rounded-t-xl last:rounded-b-xl",
                                index === selectedIndex
                                    ? "bg-olive-subtle"
                                    : "hover:bg-olive-subtle/50"
                            )}
                        >
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="h-8 w-8 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-olive-pale text-xs font-bold text-olive">
                                    {company.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-charcoal">
                                    {company.name}
                                </p>
                                {company.industry && (
                                    <p className="text-xs text-muted">{company.industry}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
