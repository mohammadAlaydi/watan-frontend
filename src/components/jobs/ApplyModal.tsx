"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApplyStep1 } from "./ApplyStep1";
import { ApplyStep2 } from "./ApplyStep2";
import { ApplyStep3 } from "./ApplyStep3";
import { ApplySuccessState } from "./ApplySuccessState";
import { submitApplication } from "@/lib/jobs/actions";
import { ApplicationStep1Schema, ApplicationStep2Schema } from "@/lib/jobs/schema";
import type { ApplicationSubmissionData } from "@/lib/jobs/schema";
import type { JobWithCompany } from "@/lib/jobs/queries";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ApplyModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job: JobWithCompany;
    userProfile?: {
        fullName?: string;
        email?: string;
        resumeUrl?: string;
        linkedinUrl?: string;
        portfolioUrl?: string;
        phone?: string;
    };
}

type Step = 1 | 2 | 3 | "success";

const DRAFT_KEY = (jobId: string) => `watan_application_draft_${jobId}`;

function saveDraft(jobId: string, data: Partial<ApplicationSubmissionData>) {
    try {
        localStorage.setItem(DRAFT_KEY(jobId), JSON.stringify(data));
    } catch {
        // localStorage unavailable
    }
}

function loadDraft(jobId: string): Partial<ApplicationSubmissionData> | null {
    try {
        const raw = localStorage.getItem(DRAFT_KEY(jobId));
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function clearDraft(jobId: string) {
    try {
        localStorage.removeItem(DRAFT_KEY(jobId));
    } catch {
        // ignore
    }
}

/**
 * Full application modal with 3-step wizard.
 * Pre-fills from user profile, supports draft saving, animated transitions.
 */
export function ApplyModal({
    open,
    onOpenChange,
    job,
    userProfile,
}: ApplyModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [formData, setFormData] = useState<Partial<ApplicationSubmissionData>>(
        () => ({
            fullName: userProfile?.fullName ?? "",
            email: userProfile?.email ?? "",
            phone: userProfile?.phone ?? "",
            resumeUrl: userProfile?.resumeUrl ?? "",
            linkedinUrl: userProfile?.linkedinUrl ?? "",
            portfolioUrl: userProfile?.portfolioUrl ?? "",
            coverLetter: "",
            answers: [],
            agreedToTerms: undefined,
        })
    );
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load draft on open
    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                const draft = loadDraft(job.id);
                if (draft && Object.keys(draft).length > 0) {
                    setFormData((prev) => ({ ...prev, ...draft }));
                }
            } else if (step !== "success") {
                if (Object.keys(formData).length > 0) {
                    saveDraft(job.id, formData);
                }
            }
            onOpenChange(isOpen);
        },
        [job.id, formData, onOpenChange, step]
    );

    const validateStep = (): boolean => {
        setErrors({});
        try {
            switch (step) {
                case 1:
                    ApplicationStep1Schema.parse(formData);
                    break;
                case 2:
                    ApplicationStep2Schema.parse(formData);
                    break;
                case 3:
                    if (!agreed) {
                        setErrors({ agreedToTerms: "You must agree to continue" });
                        return false;
                    }
                    return true;
            }
            return true;
        } catch (err: unknown) {
            if (err && typeof err === "object" && "issues" in err) {
                const zodErr = err as {
                    issues: Array<{ path: (string | number)[]; message: string }>;
                };
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
        if (step === 3) {
            handleSubmit();
            return;
        }
        setStep((s) => ((s as number) + 1) as Step);
    };

    const goBack = () => {
        if (step === 1) return;
        setStep((s) => ((s as number) - 1) as Step);
    };

    const goToStep = (target: number) => {
        setStep(target as Step);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const result = await submitApplication(job.id, {
                ...formData,
                agreedToTerms: true,
            } as ApplicationSubmissionData);

            if (result.success) {
                clearDraft(job.id);
                setStep("success");
            } else {
                toast.error(result.error ?? "Something went wrong");
                saveDraft(job.id, formData);
            }
        } catch {
            toast.error(
                "Something went wrong. Your application was saved as a draft."
            );
            saveDraft(job.id, formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewApplications = () => {
        onOpenChange(false);
        router.push("/applications");
    };

    const handleBrowseJobs = () => {
        onOpenChange(false);
    };

    const progress =
        step === "success" ? 100 : ((step as number) / 3) * 100;

    const applicationQuestions = Array.isArray(job.application_questions)
        ? job.application_questions
        : [];

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex max-h-[90vh] flex-col p-0 sm:max-w-xl"
            >
                {/* Header */}
                {step !== "success" && (
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <div className="flex items-center gap-3">
                            {job.company.logo_url ? (
                                <img
                                    src={job.company.logo_url}
                                    alt={job.company.name}
                                    className="h-7 w-7 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-olive-pale text-xs font-bold text-olive">
                                    {job.company.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-muted">Applying to</p>
                                <p className="text-sm font-bold text-charcoal">{job.title}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted">
                                Step {step as number} of 3
                            </span>
                            <button
                                onClick={() => handleOpenChange(false)}
                                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-olive-subtle hover:text-charcoal"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {step !== "success" && (
                    <div className="h-[3px] w-full bg-border">
                        <motion.div
                            className="h-full bg-olive"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
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
                                <ApplyStep1
                                    data={formData}
                                    onChange={(d) => setFormData({ ...formData, ...d })}
                                    errors={errors}
                                    jobTitle={job.title}
                                    companyName={job.company.name}
                                    resumeRequired={job.resume_required}
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
                                <ApplyStep2
                                    data={formData}
                                    onChange={(d) => setFormData({ ...formData, ...d })}
                                    errors={errors}
                                    jobTitle={job.title}
                                    companyName={job.company.name}
                                    coverLetterRequired={job.cover_letter_required}
                                    applicationQuestions={applicationQuestions}
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
                                <ApplyStep3
                                    data={formData}
                                    job={job}
                                    agreed={agreed}
                                    onAgreeChange={setAgreed}
                                    onEditStep={goToStep}
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
                                <ApplySuccessState
                                    companyName={job.company.name}
                                    onViewApplications={handleViewApplications}
                                    onBrowseJobs={handleBrowseJobs}
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
                        <Button
                            onClick={goNext}
                            disabled={isSubmitting || (step === 3 && !agreed)}
                            className="bg-olive hover:bg-olive-light"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : step === 3 ? (
                                "Submit application"
                            ) : (
                                "Continue →"
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
