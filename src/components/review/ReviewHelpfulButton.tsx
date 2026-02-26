"use client";

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleHelpfulVote } from "@/lib/reviews/actions";

interface ReviewHelpfulButtonProps {
    reviewId: string;
    initialCount: number;
    initialVoted: boolean;
    disabled?: boolean;
}

/** Helpful vote button with optimistic UI updates */
export function ReviewHelpfulButton({
    reviewId,
    initialCount,
    initialVoted,
    disabled = false,
}: ReviewHelpfulButtonProps) {
    const [count, setCount] = useState(initialCount);
    const [voted, setVoted] = useState(initialVoted);
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        // Optimistic update
        const newVoted = !voted;
        const newCount = newVoted ? count + 1 : count - 1;
        setVoted(newVoted);
        setCount(newCount);

        startTransition(async () => {
            const result = await toggleHelpfulVote(reviewId);
            if (!result.success) {
                // Revert on error
                setVoted(!newVoted);
                setCount(count);
            } else if (result.newCount !== undefined) {
                setCount(result.newCount);
                setVoted(result.voted ?? newVoted);
            }
        });
    };

    return (
        <Button
            variant="outline"
            size="sm"
            disabled={disabled || isPending}
            onClick={handleClick}
            className={cn(
                "gap-1.5 text-xs transition-all",
                voted
                    ? "border-olive bg-olive-pale text-olive"
                    : "border-border text-muted hover:border-olive/30 hover:text-charcoal"
            )}
        >
            <ThumbsUp className={cn("h-3.5 w-3.5", voted && "fill-olive")} />
            Helpful{count > 0 ? ` (${count})` : ""}
        </Button>
    );
}
