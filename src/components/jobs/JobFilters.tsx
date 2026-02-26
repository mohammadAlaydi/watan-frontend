"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobFiltersProps {
    filters: Record<string, unknown>;
    onFilterChange: (key: string, value: unknown) => void;
    onClearAll: () => void;
    activeCount: number;
}

const DEPARTMENTS = [
    "Engineering",
    "Design",
    "Product",
    "Marketing",
    "Sales",
    "Finance",
    "Operations",
    "HR",
    "Legal",
    "Data",
    "Other",
];

const SENIORITIES = [
    "junior",
    "mid",
    "senior",
    "lead",
    "manager",
    "director",
    "vp",
    "c-level",
];

const SENIORITY_LABELS: Record<string, string> = {
    junior: "Junior",
    mid: "Mid-level",
    senior: "Senior",
    lead: "Lead",
    manager: "Manager",
    director: "Director",
    vp: "VP",
    "c-level": "C-Level",
};

const EMPLOYMENT_TYPES = [
    { value: "full-time", label: "Full-time" },
    { value: "part-time", label: "Part-time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
];

const POSTED_OPTIONS = [
    { value: "any", label: "Any time" },
    { value: "24h", label: "Last 24 hours" },
    { value: "week", label: "Last week" },
    { value: "month", label: "Last month" },
];

function FilterSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-b border-border py-4">
            <h4 className="mb-3 text-sm font-semibold text-charcoal">{title}</h4>
            {children}
        </div>
    );
}

function FilterContent({
    filters,
    onFilterChange,
    onClearAll,
    activeCount,
}: JobFiltersProps) {
    const [showAllDepts, setShowAllDepts] = useState(false);
    const visibleDepts = showAllDepts ? DEPARTMENTS : DEPARTMENTS.slice(0, 6);

    return (
        <div className="space-y-0 overflow-y-auto">
            {activeCount > 0 && (
                <div className="flex items-center justify-between pb-2">
                    <span className="text-xs text-muted">
                        {activeCount} filter{activeCount !== 1 ? "s" : ""} active
                    </span>
                    <button
                        onClick={onClearAll}
                        className="text-xs font-medium text-olive hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            {/* Work arrangement */}
            <FilterSection title="Work arrangement">
                <div className="flex flex-wrap gap-2">
                    {["all", "remote", "hybrid", "on-site"].map((value) => (
                        <button
                            key={value}
                            onClick={() =>
                                onFilterChange(
                                    "arrangement",
                                    value === "all" ? undefined : value
                                )
                            }
                            className={cn(
                                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                                (filters.arrangement ?? "all") ===
                                    (value === "all" ? undefined : value) ||
                                    (!filters.arrangement && value === "all")
                                    ? "bg-olive text-white"
                                    : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                            )}
                        >
                            {value === "all"
                                ? "All"
                                : value.charAt(0).toUpperCase() + value.slice(1)}
                        </button>
                    ))}
                </div>
            </FilterSection>

            {/* Department */}
            <FilterSection title="Department">
                <div className="space-y-2">
                    {visibleDepts.map((dept) => (
                        <label
                            key={dept}
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                checked={filters.department === dept}
                                onChange={() =>
                                    onFilterChange(
                                        "department",
                                        filters.department === dept ? undefined : dept
                                    )
                                }
                                className="h-4 w-4 rounded border-border text-olive focus:ring-olive"
                            />
                            <span className="text-sm text-charcoal">{dept}</span>
                        </label>
                    ))}
                    {!showAllDepts && DEPARTMENTS.length > 6 && (
                        <button
                            onClick={() => setShowAllDepts(true)}
                            className="text-xs font-medium text-olive hover:underline"
                        >
                            Show all ({DEPARTMENTS.length})
                        </button>
                    )}
                </div>
            </FilterSection>

            {/* Seniority */}
            <FilterSection title="Seniority">
                <div className="space-y-2">
                    {SENIORITIES.map((level) => (
                        <label
                            key={level}
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                checked={filters.seniority === level}
                                onChange={() =>
                                    onFilterChange(
                                        "seniority",
                                        filters.seniority === level ? undefined : level
                                    )
                                }
                                className="h-4 w-4 rounded border-border text-olive focus:ring-olive"
                            />
                            <span className="text-sm text-charcoal capitalize">
                                {SENIORITY_LABELS[level]}
                            </span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Employment type */}
            <FilterSection title="Employment type">
                <div className="space-y-2">
                    {EMPLOYMENT_TYPES.map((type) => (
                        <label
                            key={type.value}
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <input
                                type="checkbox"
                                checked={filters.employmentType === type.value}
                                onChange={() =>
                                    onFilterChange(
                                        "employmentType",
                                        filters.employmentType === type.value
                                            ? undefined
                                            : type.value
                                    )
                                }
                                className="h-4 w-4 rounded border-border text-olive focus:ring-olive"
                            />
                            <span className="text-sm text-charcoal">{type.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Special filters */}
            <FilterSection title="Special filters">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="visa" className="text-sm">
                            ✈️ Visa sponsorship
                        </Label>
                        <Switch
                            id="visa"
                            checked={!!filters.visaSponsorship}
                            onCheckedChange={(v) => onFilterChange("visaSponsorship", v || undefined)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="relocation" className="text-sm">
                            📦 Relocation assistance
                        </Label>
                        <Switch
                            id="relocation"
                            checked={!!filters.relocationAssistance}
                            onCheckedChange={(v) =>
                                onFilterChange("relocationAssistance", v || undefined)
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="arabic-req" className="text-sm">
                            🌙 Arabic required
                        </Label>
                        <Switch
                            id="arabic-req"
                            checked={!!filters.arabicRequired}
                            onCheckedChange={(v) => onFilterChange("arabicRequired", v || undefined)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="arabic-pref" className="text-sm">
                            🌙 Arabic preferred
                        </Label>
                        <Switch
                            id="arabic-pref"
                            checked={!!filters.arabicPreferred}
                            onCheckedChange={(v) =>
                                onFilterChange("arabicPreferred", v || undefined)
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="featured" className="text-sm">
                            ⭐ Featured jobs only
                        </Label>
                        <Switch
                            id="featured"
                            checked={!!filters.featured}
                            onCheckedChange={(v) => onFilterChange("featured", v || undefined)}
                        />
                    </div>
                </div>
            </FilterSection>

            {/* Posted date */}
            <FilterSection title="Posted date">
                <div className="space-y-2">
                    {POSTED_OPTIONS.map((opt) => (
                        <label
                            key={opt.value}
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <input
                                type="radio"
                                name="postedWithin"
                                checked={
                                    (filters.postedWithin ?? "any") === opt.value
                                }
                                onChange={() =>
                                    onFilterChange(
                                        "postedWithin",
                                        opt.value === "any" ? undefined : opt.value
                                    )
                                }
                                className="h-4 w-4 border-border text-olive focus:ring-olive"
                            />
                            <span className="text-sm text-charcoal">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    );
}

/**
 * Desktop: sticky sidebar. Mobile: bottom sheet drawer.
 */
export function JobFilters(props: JobFiltersProps) {
    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden w-[280px] flex-shrink-0 overflow-y-auto border-r border-border px-4 lg:block">
                <FilterContent {...props} />
            </aside>

            {/* Mobile sheet trigger */}
            <div className="fixed bottom-6 right-6 z-40 lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="h-14 w-14 rounded-full bg-olive shadow-lg hover:bg-olive-light"
                        >
                            <Filter className="h-5 w-5" />
                            {props.activeCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                                    {props.activeCount}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 overflow-y-auto">
                            <FilterContent {...props} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
