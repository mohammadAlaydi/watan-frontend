"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toggleSaveJob } from "@/lib/jobs/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
    jobId: string;
    isSaved: boolean;
    onToggle?: (saved: boolean) => void;
    className?: string;
}

/**
 * Bookmark toggle with optimistic updates and spring animation.
 */
export function SaveJobButton({
    jobId,
    isSaved: initialSaved,
    onToggle,
    className,
}: SaveJobButtonProps) {
    const [saved, setSaved] = useState(initialSaved);
    const [animationKey, setAnimationKey] = useState(0);

    const handleToggle = useCallback(
        async (e: React.MouseEvent) => {
            e.stopPropagation();
            const previousState = saved;
            const newState = !saved;

            // Optimistic update
            setSaved(newState);
            setAnimationKey((k) => k + 1);
            onToggle?.(newState);

            try {
                const result = await toggleSaveJob(jobId);
                if (!result.success) {
                    // Revert on error
                    setSaved(previousState);
                    onToggle?.(previousState);
                    toast.error(result.error ?? "Failed to save job");
                }
            } catch {
                setSaved(previousState);
                onToggle?.(previousState);
                toast.error("Failed to save job");
            }
        },
        [jobId, saved, onToggle]
    );

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "rounded-lg p-1.5 transition-colors",
                saved
                    ? "text-olive"
                    : "text-muted hover:bg-olive-subtle hover:text-olive",
                className
            )}
            aria-label={saved ? "Unsave job" : "Save job"}
        >
            <motion.div
                key={animationKey}
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
                {saved ? (
                    <BookmarkCheck className="h-5 w-5 fill-olive" />
                ) : (
                    <Bookmark className="h-5 w-5" />
                )}
            </motion.div>
        </button>
    );
}
