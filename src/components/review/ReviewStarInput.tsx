"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStarInputProps {
    value: number;
    onChange: (value: number) => void;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    showLabel?: boolean;
    labels?: Record<number, string>;
}

const DEFAULT_LABELS: Record<number, string> = {
    1: "Very dissatisfied",
    2: "Dissatisfied",
    3: "Neutral",
    4: "Satisfied",
    5: "Very satisfied",
};

const SIZE_MAP = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10",
} as const;

/**
 * Interactive star rating input with hover preview and labels.
 * Gold fill for selected, olive preview on hover.
 */
export function ReviewStarInput({
    value,
    onChange,
    size = "md",
    disabled = false,
    showLabel = true,
    labels = DEFAULT_LABELS,
}: ReviewStarInputProps) {
    const [hoverValue, setHoverValue] = useState(0);
    const displayValue = hoverValue || value;

    return (
        <div className="flex flex-col items-start gap-1.5">
            <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverValue(0)}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={disabled}
                        className={cn(
                            "transition-transform focus:outline-none",
                            !disabled && "hover:scale-110 active:scale-95",
                            disabled && "cursor-not-allowed opacity-50"
                        )}
                        onMouseEnter={() => !disabled && setHoverValue(star)}
                        onClick={() => !disabled && onChange(star)}
                        aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                        <Star
                            className={cn(
                                SIZE_MAP[size],
                                "transition-colors duration-150",
                                star <= displayValue
                                    ? "fill-gold text-gold"
                                    : "fill-transparent text-muted/30"
                            )}
                        />
                    </button>
                ))}
            </div>
            {showLabel && displayValue > 0 && (
                <span className="text-xs text-muted ml-0.5">
                    {labels[displayValue]}
                </span>
            )}
        </div>
    );
}

interface StarDisplayProps {
    rating: number;
    size?: "xs" | "sm" | "md";
    className?: string;
}

const DISPLAY_SIZE_MAP = {
    xs: "h-3.5 w-3.5",
    sm: "h-4 w-4",
    md: "h-5 w-5",
} as const;

/** Read-only star display for showing ratings */
export function StarDisplay({
    rating,
    size = "sm",
    className,
}: StarDisplayProps) {
    return (
        <div className={cn("flex items-center gap-0.5", className)}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        DISPLAY_SIZE_MAP[size],
                        star <= Math.round(rating)
                            ? "fill-gold text-gold"
                            : "fill-transparent text-muted/25"
                    )}
                />
            ))}
        </div>
    );
}
