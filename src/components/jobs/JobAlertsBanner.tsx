"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createJobAlert } from "@/lib/jobs/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "watan_job_alerts_dismissed";

/**
 * Dismissible banner at the top of the jobs board prompting
 * users to set up job alerts.
 */
export function JobAlertsBanner() {
    const [dismissed, setDismissed] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(DISMISS_KEY) === "true";
    });
    const [showModal, setShowModal] = useState(false);

    if (dismissed) return null;

    const handleDismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem(DISMISS_KEY, "true");
        } catch {
            // localStorage might be unavailable
        }
    };

    return (
        <>
            <AnimatePresence>
                {!dismissed && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 rounded-2xl border border-olive/20 bg-gradient-to-r from-olive-subtle to-cream p-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 0.5, repeat: 1, delay: 0.3 }}
                                >
                                    <Bell className="h-5 w-5 text-olive" />
                                </motion.div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-charcoal">
                                    Never miss a relevant job
                                </p>
                                <p className="text-xs text-muted">
                                    Get notified when new jobs match your profile
                                </p>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setShowModal(true)}
                                className="flex-shrink-0 bg-olive hover:bg-olive-light"
                            >
                                Set up alerts
                            </Button>
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 p-1 text-muted hover:text-charcoal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CreateAlertModal open={showModal} onOpenChange={setShowModal} />
        </>
    );
}

// ─── Create Alert Modal ───

interface CreateAlertModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function CreateAlertModal({ open, onOpenChange }: CreateAlertModalProps) {
    const [name, setName] = useState("");
    const [keywords, setKeywords] = useState("");
    const [frequency, setFrequency] = useState<"daily" | "weekly" | "instant">(
        "weekly"
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Please enter an alert name");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createJobAlert({
                name: name.trim(),
                keywords: keywords
                    .split(",")
                    .map((k) => k.trim())
                    .filter(Boolean),
                frequency,
            });

            if (result.success) {
                toast.success("Alert created! We'll notify you by email.");
                onOpenChange(false);
                setName("");
                setKeywords("");
                setFrequency("weekly");
            } else {
                toast.error(result.error ?? "Failed to create alert");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const FREQ_OPTIONS = [
        {
            value: "instant" as const,
            label: "Instant",
            desc: "As soon as a job is posted",
        },
        {
            value: "daily" as const,
            label: "Daily",
            desc: "Once a day digest",
        },
        {
            value: "weekly" as const,
            label: "Weekly",
            desc: "Every Monday morning",
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a job alert</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div>
                        <Label htmlFor="alert-name">Alert name</Label>
                        <Input
                            id="alert-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Senior Engineer, Remote"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="keywords">Keywords (comma separated)</Label>
                        <Input
                            id="keywords"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g. React, TypeScript, product"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>Frequency</Label>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                            {FREQ_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setFrequency(opt.value)}
                                    className={cn(
                                        "rounded-xl border p-3 text-center transition-colors",
                                        frequency === opt.value
                                            ? "border-olive bg-olive-subtle"
                                            : "border-border hover:bg-cream"
                                    )}
                                >
                                    <p className="text-sm font-semibold text-charcoal">
                                        {opt.label}
                                    </p>
                                    <p className="text-[10px] text-muted">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !name.trim()}
                        className="w-full bg-olive hover:bg-olive-light"
                    >
                        {isSubmitting ? "Creating..." : "Create alert"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
