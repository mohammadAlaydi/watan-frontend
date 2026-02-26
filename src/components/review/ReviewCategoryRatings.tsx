"use client";

import { ReviewStarInput } from "./ReviewStarInput";

interface CategoryRating {
    key: string;
    label: string;
    icon: string;
}

const CATEGORIES: CategoryRating[] = [
    { key: "culture_rating", label: "Culture & Values", icon: "🏛️" },
    { key: "management_rating", label: "Senior Management", icon: "👔" },
    { key: "worklife_rating", label: "Work-Life Balance", icon: "⚖️" },
    { key: "compensation_rating", label: "Compensation & Benefits", icon: "💰" },
    { key: "growth_rating", label: "Career Growth", icon: "📈" },
];

interface ReviewCategoryRatingsProps {
    values: Record<string, number | undefined>;
    onChange: (key: string, value: number) => void;
}

/**
 * Sub-category rating inputs for culture, management,
 * work-life, compensation, and growth.
 */
export function ReviewCategoryRatings({
    values,
    onChange,
}: ReviewCategoryRatingsProps) {
    return (
        <div className="space-y-4">
            {CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-start gap-3">
                    <span className="mt-0.5 text-base">{cat.icon}</span>
                    <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-charcoal">
                                {cat.label}
                            </span>
                            <span className="text-xs text-muted">(optional)</span>
                        </div>
                        <ReviewStarInput
                            value={values[cat.key] ?? 0}
                            onChange={(v) => onChange(cat.key, v)}
                            size="sm"
                            showLabel={false}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
