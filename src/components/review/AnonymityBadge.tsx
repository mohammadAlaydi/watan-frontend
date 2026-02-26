"use client";

import { Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnonymityBadgeProps {
    variant?: "inline" | "extended";
    className?: string;
}

/** Shows anonymity protection messaging throughout the review system */
export function AnonymityBadge({
    variant = "inline",
    className,
}: AnonymityBadgeProps) {
    if (variant === "extended") {
        return (
            <div
                className={cn(
                    "rounded-xl bg-olive-pale p-4",
                    className
                )}
            >
                <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-olive/10">
                        <Shield className="h-4 w-4 text-olive" />
                    </div>
                    <span className="text-sm font-semibold text-charcoal">
                        Your identity is protected
                    </span>
                </div>
                <ul className="space-y-1.5 text-xs text-muted">
                    <li className="flex items-center gap-1.5">
                        <span className="text-olive">✓</span> Your name is never shown
                    </li>
                    <li className="flex items-center gap-1.5">
                        <span className="text-olive">✓</span> We never share reviewer data
                        with employers
                    </li>
                    <li className="flex items-center gap-1.5">
                        <span className="text-olive">✓</span> Your review cannot be traced
                        back to you
                    </li>
                </ul>
            </div>
        );
    }

    return (
        <div className={cn("flex items-center gap-1.5", className)}>
            <Lock className="h-3.5 w-3.5 text-muted" />
            <span className="text-xs text-muted/70">
                Anonymous review — your identity is always protected
            </span>
        </div>
    );
}
