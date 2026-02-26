"use client";

import { motion } from "framer-motion";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplySuccessStateProps {
    companyName: string;
    onViewApplications: () => void;
    onBrowseJobs: () => void;
}

/**
 * Post-apply success screen shown after submission.
 * Paper-plane animation + timeline of what happens next.
 */
export function ApplySuccessState({
    companyName,
    onViewApplications,
    onBrowseJobs,
}: ApplySuccessStateProps) {
    return (
        <div className="flex flex-col items-center px-4 py-2 text-center">
            {/* Animated icon */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-olive"
            >
                <Send className="h-9 w-9 text-white" />
            </motion.div>

            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-2 text-2xl font-bold text-charcoal"
            >
                Application submitted! ✈️
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mx-auto mb-6 max-w-xs text-sm text-muted"
            >
                Your application has been sent to {companyName}.
                <br />
                Good luck — we&apos;re rooting for you! 🤝
            </motion.p>

            {/* What happens next */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 w-full rounded-xl border bg-white p-4"
            >
                <div className="space-y-4">
                    <TimelineStep
                        step={1}
                        title="Application received"
                        description="The employer has received your application"
                        status="done"
                    />
                    <TimelineStep
                        step={2}
                        title="Under review"
                        description="They'll review your application soon"
                        status="pending"
                    />
                    <TimelineStep
                        step={3}
                        title="Hear back"
                        description="Expect to hear back within 1-2 weeks"
                        status="pending"
                    />
                </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex w-full flex-col gap-2 sm:flex-row"
            >
                <Button
                    onClick={onViewApplications}
                    className="flex-1 bg-olive hover:bg-olive-light"
                >
                    View my applications
                </Button>
                <Button
                    onClick={onBrowseJobs}
                    variant="outline"
                    className="flex-1 border-olive text-olive hover:bg-olive-subtle"
                >
                    Browse more jobs
                </Button>
            </motion.div>
        </div>
    );
}

function TimelineStep({
    step,
    title,
    description,
    status,
}: {
    step: number;
    title: string;
    description: string;
    status: "done" | "pending";
}) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                {status === "done" ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-olive">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-border text-xs font-bold text-muted">
                        {step}
                    </div>
                )}
                {step < 3 && (
                    <div className="mt-1 h-6 w-0.5 bg-border" />
                )}
            </div>
            <div className="pb-1">
                <p className="text-sm font-semibold text-charcoal">{title}</p>
                <p className="text-xs text-muted">{description}</p>
            </div>
        </div>
    );
}
