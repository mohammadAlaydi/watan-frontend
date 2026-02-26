"use client";

import { cn } from "@/lib/utils";

interface JobStatusBadgeProps {
    arrangement: string | null;
}

const CONFIG: Record<string, { label: string; icon: string; classes: string }> = {
    remote: {
        label: "Remote",
        icon: "🌐",
        classes: "border-blue-200 bg-blue-50 text-blue-700",
    },
    hybrid: {
        label: "Hybrid",
        icon: "⚡",
        classes: "border-purple-200 bg-purple-50 text-purple-700",
    },
    "on-site": {
        label: "On-site",
        icon: "🏢",
        classes: "border-gray-200 bg-gray-50 text-gray-600",
    },
};

/**
 * Badge showing the work arrangement type (Remote/Hybrid/On-site).
 */
export function JobStatusBadge({ arrangement }: JobStatusBadgeProps) {
    if (!arrangement) return null;

    const config = CONFIG[arrangement];
    if (!config) return null;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                config.classes
            )}
        >
            {config.icon} {config.label}
        </span>
    );
}
