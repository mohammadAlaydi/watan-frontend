"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface CompanyNavProps {
    slug: string;
    reviewCount: number;
    jobCount?: number;
}

const TABS = [
    { key: "overview", label: "Overview" },
    { key: "reviews", label: "Reviews", countKey: "reviewCount" as const },
    { key: "salaries", label: "Salaries" },
    { key: "interviews", label: "Interviews" },
] as const;

/** Sticky tab navigation for company profile */
export function CompanyNav({
    slug,
    reviewCount,
    jobCount = 0,
}: CompanyNavProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") ?? "overview";

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab === "overview") {
            params.delete("tab");
        } else {
            params.set("tab", tab);
        }
        router.push(`/companies/${slug}?${params.toString()}`, { scroll: false });
    };

    return (
        <nav className="sticky top-16 z-30 border-b bg-white">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex gap-0 overflow-x-auto">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key;
                        let count: number | undefined;
                        if (tab.key === "reviews") count = reviewCount;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={cn(
                                    "whitespace-nowrap border-b-2 px-5 py-4 text-sm font-medium transition-colors",
                                    isActive
                                        ? "border-olive text-olive"
                                        : "border-transparent text-muted hover:text-charcoal"
                                )}
                            >
                                {tab.label}
                                {count !== undefined && count > 0 && (
                                    <span
                                        className={cn(
                                            "ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs",
                                            isActive
                                                ? "bg-olive/10 text-olive"
                                                : "bg-muted/10 text-muted"
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
