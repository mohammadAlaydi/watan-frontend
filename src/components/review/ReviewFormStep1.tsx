"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AnonymityBadge } from "./AnonymityBadge";
import { cn } from "@/lib/utils";
import type { ReviewStep1Data } from "@/lib/reviews/schema";
import { Building2, Package, Handshake } from "lucide-react";

interface ReviewFormStep1Props {
    data: Partial<ReviewStep1Data>;
    companyName: string;
    onChange: (data: Partial<ReviewStep1Data>) => void;
    errors?: Record<string, string>;
}

const STATUS_OPTIONS = [
    {
        value: "current",
        label: "Current Employee",
        description: "I currently work here",
        icon: Building2,
    },
    {
        value: "former",
        label: "Former Employee",
        description: "I no longer work here",
        icon: Package,
    },
    {
        value: "contractor",
        label: "Contractor / Freelancer",
        description: "I worked here on contract",
        icon: Handshake,
    },
] as const;

const YEARS_OPTIONS = [
    "Less than 1 year",
    "1-2 years",
    "3-5 years",
    "5+ years",
];

/** Step 1 — Role & employment context */
export function ReviewFormStep1({
    data,
    companyName,
    onChange,
    errors,
}: ReviewFormStep1Props) {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-charcoal">
                    Tell us about your experience at {companyName}
                </h2>
                <p className="mt-1 text-sm text-muted">
                    This helps others find relevant reviews
                </p>
            </div>

            {/* Job Title */}
            <div className="space-y-2">
                <Label htmlFor="job_title" className="text-sm font-medium text-charcoal">
                    Job title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="job_title"
                    placeholder="e.g. Software Engineer"
                    value={data.job_title ?? ""}
                    onChange={(e) => onChange({ ...data, job_title: e.target.value })}
                    className="h-11"
                />
                {errors?.job_title && (
                    <p className="text-xs text-destructive">{errors.job_title}</p>
                )}
            </div>

            {/* Employment Status */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-charcoal">
                    Employment status <span className="text-destructive">*</span>
                </Label>
                <div className="grid gap-3 sm:grid-cols-3">
                    {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = data.employment_status === opt.value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() =>
                                    onChange({ ...data, employment_status: opt.value })
                                }
                                className={cn(
                                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all",
                                    isSelected
                                        ? "border-olive bg-olive-subtle shadow-sm"
                                        : "border-border bg-white hover:border-olive/30 hover:bg-olive-subtle/30"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5",
                                        isSelected ? "text-olive" : "text-muted"
                                    )}
                                />
                                <span className="text-sm font-medium text-charcoal">
                                    {opt.label}
                                </span>
                                <span className="text-xs text-muted">{opt.description}</span>
                            </button>
                        );
                    })}
                </div>
                {errors?.employment_status && (
                    <p className="text-xs text-destructive">{errors.employment_status}</p>
                )}
            </div>

            {/* Tenure */}
            {data.employment_status && (
                <div className="space-y-2">
                    {data.employment_status === "current" ? (
                        <>
                            <Label className="text-sm font-medium text-charcoal">
                                How long have you worked here?
                            </Label>
                            <Select
                                value={data.years_at_company ?? ""}
                                onValueChange={(v) =>
                                    onChange({ ...data, years_at_company: v })
                                }
                            >
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {YEARS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                            {opt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-sm text-charcoal">Start year</Label>
                                <Select
                                    value={data.employment_start_year?.toString() ?? ""}
                                    onValueChange={(v) =>
                                        onChange({ ...data, employment_start_year: parseInt(v) })
                                    }
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Start year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((y) => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm text-charcoal">End year</Label>
                                <Select
                                    value={data.employment_end_year?.toString() ?? ""}
                                    onValueChange={(v) =>
                                        onChange({ ...data, employment_end_year: parseInt(v) })
                                    }
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="End year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map((y) => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Work Location */}
            <div className="space-y-2">
                <Label
                    htmlFor="work_location"
                    className="text-sm font-medium text-charcoal"
                >
                    Work location <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="work_location"
                    placeholder='Dubai, UAE or "Remote"'
                    value={data.work_location ?? ""}
                    onChange={(e) => onChange({ ...data, work_location: e.target.value })}
                    className="h-11"
                />
                {errors?.work_location && (
                    <p className="text-xs text-destructive">{errors.work_location}</p>
                )}
            </div>

            {/* Anonymity Reminder */}
            <AnonymityBadge variant="extended" />
        </div>
    );
}
