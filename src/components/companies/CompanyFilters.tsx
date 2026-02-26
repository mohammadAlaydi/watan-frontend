"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

const INDUSTRIES = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "Engineering",
    "Design",
    "Marketing",
    "Media",
    "NGO",
    "Government",
    "Consulting",
    "Other",
];

const COMPANY_SIZES = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
];

const RATING_OPTIONS = [
    { value: "4", label: "4+ stars" },
    { value: "3", label: "3+ stars" },
    { value: "", label: "Any rating" },
];

const COUNTRIES = [
    "United Arab Emirates",
    "Jordan",
    "Saudi Arabia",
    "Germany",
    "United Kingdom",
    "Canada",
    "United States",
    "Turkey",
];

/** Filter sidebar for the company directory */
export function CompanyFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentIndustry = searchParams.get("industry") ?? "";
    const currentSize = searchParams.get("size") ?? "";
    const currentCountry = searchParams.get("country") ?? "";

    const updateParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            params.delete("page"); // Reset page on filter change
            router.push(`/companies?${params.toString()}`);
        },
        [router, searchParams]
    );

    const clearAll = () => {
        router.push("/companies");
    };

    const activeCount =
        (currentIndustry ? 1 : 0) +
        (currentSize ? 1 : 0) +
        (currentCountry ? 1 : 0);

    return (
        <div className="rounded-2xl border border-border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-charcoal">
                    Filters{activeCount > 0 && ` (${activeCount})`}
                </h3>
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs font-medium text-olive hover:underline"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Industry */}
            <div className="mb-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    Industry
                </h4>
                <div className="space-y-1.5">
                    {INDUSTRIES.map((ind) => (
                        <label
                            key={ind}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-olive-subtle/50"
                        >
                            <input
                                type="checkbox"
                                checked={currentIndustry === ind}
                                onChange={() =>
                                    updateParam("industry", currentIndustry === ind ? "" : ind)
                                }
                                className="accent-olive"
                            />
                            <span className="text-sm text-charcoal">{ind}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Company Size */}
            <div className="mb-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    Company size
                </h4>
                <div className="space-y-1.5">
                    {COMPANY_SIZES.map((size) => (
                        <label
                            key={size}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-olive-subtle/50"
                        >
                            <input
                                type="checkbox"
                                checked={currentSize === size}
                                onChange={() =>
                                    updateParam("size", currentSize === size ? "" : size)
                                }
                                className="accent-olive"
                            />
                            <span className="text-sm text-charcoal">{size}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div className="mb-5">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    Location
                </h4>
                <div className="space-y-1.5">
                    {COUNTRIES.map((c) => (
                        <label
                            key={c}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-olive-subtle/50"
                        >
                            <input
                                type="checkbox"
                                checked={currentCountry === c}
                                onChange={() =>
                                    updateParam("country", currentCountry === c ? "" : c)
                                }
                                className="accent-olive"
                            />
                            <span className="text-sm text-charcoal">{c}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
