"use client";

import { ReviewStarInput } from "./ReviewStarInput";
import { ReviewCategoryRatings } from "./ReviewCategoryRatings";
import { cn } from "@/lib/utils";
import type { ReviewStep2Data } from "@/lib/reviews/schema";

interface ReviewFormStep2Props {
    data: Partial<ReviewStep2Data>;
    companyName: string;
    onChange: (data: Partial<ReviewStep2Data>) => void;
    errors?: Record<string, string>;
}

/** Step 2 — Ratings */
export function ReviewFormStep2({
    data,
    companyName,
    onChange,
    errors,
}: ReviewFormStep2Props) {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-charcoal">
                    How would you rate {companyName}?
                </h2>
            </div>

            {/* Overall Rating */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-charcoal">
                    Overall rating <span className="text-destructive">*</span>
                </label>
                <ReviewStarInput
                    value={data.overall_rating ?? 0}
                    onChange={(v) => onChange({ ...data, overall_rating: v })}
                    size="lg"
                />
                {errors?.overall_rating && (
                    <p className="text-xs text-destructive">{errors.overall_rating}</p>
                )}
            </div>

            {/* Category Ratings */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-charcoal">
                    Detailed ratings
                </label>
                <ReviewCategoryRatings
                    values={{
                        culture_rating: data.culture_rating,
                        management_rating: data.management_rating,
                        worklife_rating: data.worklife_rating,
                        compensation_rating: data.compensation_rating,
                        growth_rating: data.growth_rating,
                    }}
                    onChange={(key, value) => onChange({ ...data, [key]: value })}
                />
            </div>

            {/* Recommend Toggle */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-charcoal">
                    Would you recommend {companyName} to a friend?
                </label>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => onChange({ ...data, recommends_company: true })}
                        className={cn(
                            "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                            data.recommends_company === true
                                ? "border-olive bg-olive text-white shadow-sm"
                                : "border-border bg-white text-charcoal hover:border-olive/30"
                        )}
                    >
                        👍 Yes
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ ...data, recommends_company: false })}
                        className={cn(
                            "flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                            data.recommends_company === false
                                ? "border-red-200 bg-red-50 text-red-600 shadow-sm"
                                : "border-border bg-white text-charcoal hover:border-red-200"
                        )}
                    >
                        👎 No
                    </button>
                </div>
            </div>
        </div>
    );
}
