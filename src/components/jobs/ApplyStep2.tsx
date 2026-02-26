"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { ApplicationStep2Data } from "@/lib/jobs/schema";
import type { ApplicationQuestion } from "@/lib/jobs/schema";
import { cn } from "@/lib/utils";

interface ApplyStep2Props {
    data: Partial<ApplicationStep2Data>;
    onChange: (data: Partial<ApplicationStep2Data>) => void;
    errors: Record<string, string>;
    jobTitle: string;
    companyName: string;
    coverLetterRequired: boolean;
    applicationQuestions: ApplicationQuestion[];
}

/**
 * Step 2 of the apply flow: cover letter + custom questions.
 */
export function ApplyStep2({
    data,
    onChange,
    errors,
    jobTitle,
    companyName,
    coverLetterRequired,
    applicationQuestions,
}: ApplyStep2Props) {
    const coverLetterLength = (data.coverLetter ?? "").length;

    const updateAnswer = (questionId: string, answer: string) => {
        const existing = data.answers ?? [];
        const updated = existing.filter((a) => a.questionId !== questionId);
        updated.push({ questionId, answer });
        onChange({ ...data, answers: updated });
    };

    const getAnswer = (questionId: string): string => {
        return data.answers?.find((a) => a.questionId === questionId)?.answer ?? "";
    };

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-charcoal">
                Stand out from the crowd
            </h2>
            <p className="mb-6 text-sm text-muted">
                A great cover letter can make the difference
            </p>

            <div className="space-y-6">
                {/* Cover letter */}
                <div>
                    <div className="mb-1 flex items-center gap-2">
                        <Label htmlFor="coverLetter" className="font-semibold">
                            Cover letter
                        </Label>
                        <span
                            className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                coverLetterRequired
                                    ? "bg-olive-pale text-olive"
                                    : "bg-gray-100 text-muted"
                            )}
                        >
                            {coverLetterRequired ? "Required" : "Optional"}
                        </span>
                    </div>
                    <Textarea
                        id="coverLetter"
                        value={data.coverLetter ?? ""}
                        onChange={(e) => onChange({ ...data, coverLetter: e.target.value })}
                        rows={8}
                        maxLength={2000}
                        placeholder={`Dear Hiring Manager,\n\nI'm excited to apply for the ${jobTitle} role at ${companyName}.\n[Tell them why you're a great fit...]`}
                        className="mt-1 resize-none"
                    />
                    <div className="mt-1 flex items-center justify-between">
                        <p className="text-xs text-muted">{coverLetterLength}/2000</p>
                        <button
                            type="button"
                            disabled
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted"
                            title="Coming soon — AI-powered cover letter help"
                        >
                            ✨ Get suggestions
                        </button>
                    </div>
                    {errors.coverLetter && (
                        <p className="mt-1 text-xs text-red-500">{errors.coverLetter}</p>
                    )}
                </div>

                {/* Custom application questions */}
                {applicationQuestions.length > 0 && (
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-charcoal">
                            Additional questions
                        </h3>
                        <div className="space-y-4">
                            {applicationQuestions.map((question) => (
                                <div key={question.id}>
                                    <Label>
                                        {question.question}
                                        {question.required && (
                                            <span className="ml-1 text-red-500">*</span>
                                        )}
                                    </Label>

                                    {question.type === "text" && (
                                        <Input
                                            value={getAnswer(question.id)}
                                            onChange={(e) =>
                                                updateAnswer(question.id, e.target.value)
                                            }
                                            className="mt-1"
                                        />
                                    )}

                                    {question.type === "textarea" && (
                                        <Textarea
                                            value={getAnswer(question.id)}
                                            onChange={(e) =>
                                                updateAnswer(question.id, e.target.value)
                                            }
                                            rows={4}
                                            className="mt-1 resize-none"
                                        />
                                    )}

                                    {question.type === "select" && question.options && (
                                        <Select
                                            value={getAnswer(question.id)}
                                            onValueChange={(v) => updateAnswer(question.id, v)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {question.options.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}

                                    {question.type === "boolean" && (
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            {["Yes", "No"].map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => updateAnswer(question.id, option)}
                                                    className={cn(
                                                        "rounded-xl border p-3 text-center text-sm font-medium transition-colors",
                                                        getAnswer(question.id) === option
                                                            ? "border-olive bg-olive-subtle text-olive"
                                                            : "border-border text-charcoal hover:bg-cream"
                                                    )}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
