"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { flagReview } from "@/lib/reviews/actions";
import { toast } from "sonner";

interface ReviewReportButtonProps {
    reviewId: string;
}

const REASONS = [
    { value: "fake", label: "This review appears to be fake" },
    { value: "offensive", label: "This review contains offensive content" },
    { value: "irrelevant", label: "This review is about a different company" },
    {
        value: "private_info",
        label: "This review reveals private information",
    },
    { value: "other", label: "Other" },
] as const;

/** Report button that opens a modal to flag a review */
export function ReviewReportButton({ reviewId }: ReviewReportButtonProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>("");
    const [description, setDescription] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        if (!reason) return;

        startTransition(async () => {
            const result = await flagReview(reviewId, {
                reason: reason as "fake" | "offensive" | "irrelevant" | "private_info" | "other",
                description: reason === "other" ? description : undefined,
            });

            if (result.success) {
                toast.success(
                    "Report submitted. We'll review within 48 hours."
                );
                setOpen(false);
                setReason("");
                setDescription("");
            } else {
                toast.error(result.error ?? "Something went wrong");
            }
        });
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-red-500"
            >
                <Flag className="h-3 w-3" />
                Report
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Report this review</DialogTitle>
                        <DialogDescription>
                            Help us keep Watan trustworthy and accurate
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        {REASONS.map((r) => (
                            <label
                                key={r.value}
                                className={cn(
                                    "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all",
                                    reason === r.value
                                        ? "border-olive bg-olive-subtle"
                                        : "border-border hover:border-olive/30"
                                )}
                            >
                                <input
                                    type="radio"
                                    name="report_reason"
                                    value={r.value}
                                    checked={reason === r.value}
                                    onChange={() => setReason(r.value)}
                                    className="accent-olive"
                                />
                                <span className="text-sm text-charcoal">{r.label}</span>
                            </label>
                        ))}

                        {reason === "other" && (
                            <Textarea
                                placeholder="Please describe the issue..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!reason || isPending}
                            className="bg-olive hover:bg-olive-light"
                        >
                            {isPending ? "Submitting..." : "Submit report"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
