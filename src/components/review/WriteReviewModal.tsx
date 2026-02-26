"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnonymityBadge } from "./AnonymityBadge";
import { ReviewFormStep1 } from "./ReviewFormStep1";
import { ReviewFormStep2 } from "./ReviewFormStep2";
import { ReviewFormStep3 } from "./ReviewFormStep3";
import { ReviewFormStep4 } from "./ReviewFormStep4";
import { ReviewSuccessState } from "./ReviewSuccessState";
import { submitReview } from "@/lib/reviews/actions";
import {
    ReviewStep1Schema,
    ReviewStep2Schema,
    ReviewStep3Schema,
} from "@/lib/reviews/schema";
import type { FullReviewData } from "@/lib/reviews/schema";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface WriteReviewModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    companyId: string;
    companyName: string;
    companyLogo?: string | null;
    companySlug: string;
}

type Step = 1 | 2 | 3 | 4 | "success";

const STEP_LABELS = ["Your role", "Ratings", "Written review", "Details"];

function saveDraft(companyId: string, data: Partial<FullReviewData>) {
    try {
        localStorage.setItem(
            `watan_review_draft_${companyId}`,
            JSON.stringify(data)
        );
    } catch {
        // localStorage might be full or unavailable
    }
}

function loadDraft(companyId: string): Partial<FullReviewData> | null {
    try {
        const raw = localStorage.getItem(`watan_review_draft_${companyId}`);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function clearDraft(companyId: string) {
    try {
        localStorage.removeItem(`watan_review_draft_${companyId}`);
    } catch {
        // ignore
    }
}

/**
 * Full-screen review modal with 4-step wizard.
 * Handles validation, draft saving, and animated transitions.
 */
export function WriteReviewModal({
    open,
    onOpenChange,
    companyId,
    companyName,
    companyLogo,
    companySlug,
}: WriteReviewModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<Partial<FullReviewData>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load draft on open
    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                const draft = loadDraft(companyId);
                if (draft && Object.keys(draft).length > 0) {
                    setFormData(draft);
                }
            } else if (step !== "success") {
                // Save draft on close
                if (Object.keys(formData).length > 0) {
                    saveDraft(companyId, formData);
                }
            }
            onOpenChange(isOpen);
        },
        [companyId, formData, onOpenChange, step]
    );

    const validateStep = (): boolean => {
        setErrors({});
        try {
            switch (step) {
                case 1:
                    ReviewStep1Schema.parse(formData);
                    break;
                case 2:
                    ReviewStep2Schema.parse(formData);
                    break;
                case 3:
                    ReviewStep3Schema.parse(formData);
                    break;
                case 4:
                    return true; // Step 4 is all optional
            }
            return true;
        } catch (err: unknown) {
            if (err && typeof err === "object" && "issues" in err) {
                const zodErr = err as { issues: Array<{ path: (string | number)[]; message: string }> };
                const fieldErrors: Record<string, string> = {};
                for (const issue of zodErr.issues) {
                    const key = issue.path[0]?.toString();
                    if (key) fieldErrors[key] = issue.message;
                }
                setErrors(fieldErrors);
            }
            return false;
        }
    };

    const goNext = () => {
        if (!validateStep()) return;
        if (step === 4) {
            handleSubmit();
            return;
        }
        setStep((s) => ((s as number) + 1) as Step);
    };

    const goBack = () => {
        if (step === 1) return;
        setStep((s) => ((s as number) - 1) as Step);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await submitReview(companyId, formData as FullReviewData);

            if (result.success) {
                clearDraft(companyId);
                setStep("success");
            } else {
                toast.error(result.error ?? "Something went wrong");
                // Save draft so work isn't lost
                saveDraft(companyId, formData);
            }
        } catch {
            toast.error("Something went wrong. Your review was saved as a draft.");
            saveDraft(companyId, formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewReview = () => {
        onOpenChange(false);
        router.push(`/companies/${companySlug}?tab=reviews`);
    };

    const handleReviewAnother = () => {
        onOpenChange(false);
        setStep(1);
        setFormData({});
        setErrors({});
        router.push("/companies");
    };

    const isStepValid = (): boolean => {
        switch (step) {
            case 1:
                return !!(
                    formData.job_title &&
                    formData.employment_status &&
                    formData.work_location
                );
            case 2:
                return !!(formData.overall_rating && formData.overall_rating >= 1);
            case 3:
                return !!(
                    formData.title &&
                    formData.title.length >= 10 &&
                    formData.pros &&
                    formData.pros.length >= 100 &&
                    formData.cons &&
                    formData.cons.length >= 100
                );
            case 4:
                return true;
            default:
                return false;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90vh] flex-col p-0 sm:max-w-2xl"
            >
                {/* Header */}
                {step !== "success" && (
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center gap-3">
                            {companyLogo ? (
                                <img
                                    src={companyLogo}
                                    alt={companyName}
                                    className="h-8 w-8 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-olive-pale text-xs font-bold text-olive">
                                    {companyName.charAt(0)}
                                </div>
                            )}
                            <span className="text-sm font-semibold text-charcoal">
                                {companyName}
                            </span>
                        </div>

                        {/* Progress dots */}
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className={cn(
                                        "h-2 w-2 rounded-full transition-colors",
                                        s <= (step as number)
                                            ? "bg-olive"
                                            : "bg-olive/20"
                                    )}
                                    title={STEP_LABELS[s - 1]}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => handleOpenChange(false)}
                            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-olive-subtle hover:text-charcoal"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ReviewFormStep1
                                    data={formData}
                                    companyName={companyName}
                                    onChange={(d) => setFormData({ ...formData, ...d })}
                                    errors={errors}
                                />
                            </motion.div>
                        )}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ReviewFormStep2
                                    data={formData}
                                    companyName={companyName}
                                    onChange={(d) => setFormData({ ...formData, ...d })}
                                    errors={errors}
                                />
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ReviewFormStep3
                                    data={formData}
                                    companyName={companyName}
                                    onChange={(d) => setFormData({ ...formData, ...d })}
                                    errors={errors}
                                />
                            </motion.div>
                        )}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ReviewFormStep4
                                    data={formData}
                                    onChange={(d) => setFormData({ ...formData, ...d })}
                                />
                            </motion.div>
                        )}
                        {step === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ReviewSuccessState
                                    onViewReview={handleViewReview}
                                    onReviewAnother={handleReviewAnother}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {step !== "success" && (
                    <div className="flex items-center justify-between border-t px-6 py-4">
                        <div>
                            {step !== 1 && (
                                <Button variant="ghost" onClick={goBack}>
                                    Back
                                </Button>
                            )}
                        </div>

                        <AnonymityBadge variant="inline" className="hidden sm:flex" />

                        <Button
                            onClick={goNext}
                            disabled={!isStepValid() || isSubmitting}
                            className="bg-olive hover:bg-olive-light"
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : step === 4
                                    ? "Submit review"
                                    : "Continue →"}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
