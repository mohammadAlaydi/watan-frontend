"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewStep4Data } from "@/lib/reviews/schema";

interface ReviewFormStep4Props {
    data: Partial<ReviewStep4Data>;
    onChange: (data: Partial<ReviewStep4Data>) => void;
}

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "JOD", "SAR"];

const DIFFICULTY_OPTIONS = [
    { value: "easy", label: "Very Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
    { value: "very_hard", label: "Very Hard" },
];

const EXPERIENCE_OPTIONS = [
    { value: "positive", label: "😊 Positive", bg: "bg-green-50 border-green-200 text-green-700" },
    { value: "neutral", label: "😐 Neutral", bg: "bg-yellow-50 border-yellow-200 text-yellow-700" },
    { value: "negative", label: "😟 Negative", bg: "bg-red-50 border-red-200 text-red-700" },
];

/** Step 4 — Optional salary & interview data */
export function ReviewFormStep4({
    data,
    onChange,
}: ReviewFormStep4Props) {
    const [showSalary, setShowSalary] = useState(!!data.salary_amount);
    const [showInterview, setShowInterview] = useState(
        !!data.interview_experience
    );
    const [questionInput, setQuestionInput] = useState("");

    const addQuestion = () => {
        const trimmed = questionInput.trim();
        if (!trimmed) return;
        const current = data.interview_questions ?? [];
        if (current.length >= 5) return;
        onChange({
            ...data,
            interview_questions: [...current, trimmed],
        });
        setQuestionInput("");
    };

    const removeQuestion = (index: number) => {
        const current = data.interview_questions ?? [];
        onChange({
            ...data,
            interview_questions: current.filter((_, i) => i !== index),
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-charcoal">
                    Almost done!
                </h2>
                <p className="mt-1 text-sm text-muted">
                    Add more detail (optional). These details help with salary and
                    interview research.
                </p>
            </div>

            {/* Salary Section */}
            <div className="rounded-xl border border-border bg-white">
                {!showSalary ? (
                    <button
                        type="button"
                        onClick={() => setShowSalary(true)}
                        className="flex w-full items-center gap-2 px-5 py-4 text-sm font-medium text-olive hover:bg-olive-subtle/50 transition-colors rounded-xl"
                    >
                        <Plus className="h-4 w-4" /> Add salary info
                    </button>
                ) : (
                    <div className="space-y-4 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-charcoal">
                                💰 Salary information
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSalary(false);
                                    onChange({
                                        ...data,
                                        salary_amount: undefined,
                                        salary_currency: undefined,
                                        salary_period: undefined,
                                    });
                                }}
                                className="text-xs text-muted hover:text-charcoal"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-charcoal">Currency</Label>
                                <Select
                                    value={data.salary_currency ?? "USD"}
                                    onValueChange={(v) =>
                                        onChange({ ...data, salary_currency: v })
                                    }
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CURRENCIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-charcoal">Amount</Label>
                                <Input
                                    type="number"
                                    placeholder="95000"
                                    value={data.salary_amount ?? ""}
                                    onChange={(e) =>
                                        onChange({
                                            ...data,
                                            salary_amount: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        })
                                    }
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-charcoal">Period</Label>
                                <div className="flex rounded-lg border border-border">
                                    {(["annual", "monthly", "hourly"] as const).map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() =>
                                                onChange({ ...data, salary_period: p })
                                            }
                                            className={cn(
                                                "flex-1 py-2 text-xs font-medium capitalize transition-colors first:rounded-l-lg last:rounded-r-lg",
                                                (data.salary_period ?? "annual") === p
                                                    ? "bg-olive text-white"
                                                    : "bg-white text-charcoal hover:bg-olive-subtle"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-muted">
                            Salary is shown as a range, never your exact figure
                        </p>
                    </div>
                )}
            </div>

            {/* Interview Section */}
            <div className="rounded-xl border border-border bg-white">
                {!showInterview ? (
                    <button
                        type="button"
                        onClick={() => setShowInterview(true)}
                        className="flex w-full items-center gap-2 px-5 py-4 text-sm font-medium text-olive hover:bg-olive-subtle/50 transition-colors rounded-xl"
                    >
                        <Plus className="h-4 w-4" /> Add interview experience
                    </button>
                ) : (
                    <div className="space-y-4 p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-charcoal">
                                🎤 Interview experience
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowInterview(false);
                                    onChange({
                                        ...data,
                                        interview_difficulty: undefined,
                                        interview_experience: undefined,
                                        interview_questions: undefined,
                                        got_offer: undefined,
                                    });
                                }}
                                className="text-xs text-muted hover:text-charcoal"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Experience */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-charcoal">
                                Overall interview experience
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                {EXPERIENCE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            onChange({ ...data, interview_experience: opt.value as ReviewStep4Data["interview_experience"] })
                                        }
                                        className={cn(
                                            "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                                            data.interview_experience === opt.value
                                                ? opt.bg
                                                : "border-border bg-white text-charcoal hover:bg-olive-subtle/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-charcoal">
                                Difficulty level
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {DIFFICULTY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() =>
                                            onChange({ ...data, interview_difficulty: opt.value as ReviewStep4Data["interview_difficulty"] })
                                        }
                                        className={cn(
                                            "rounded-full border px-4 py-1.5 text-xs font-medium transition-all",
                                            data.interview_difficulty === opt.value
                                                ? "border-olive bg-olive text-white"
                                                : "border-border bg-white text-charcoal hover:border-olive/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Got offer */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-charcoal">
                                Did you get an offer?
                            </Label>
                            <div className="flex gap-2">
                                {[
                                    { value: true, label: "Yes" },
                                    { value: false, label: "No" },
                                ].map((opt) => (
                                    <button
                                        key={String(opt.value)}
                                        type="button"
                                        onClick={() =>
                                            onChange({ ...data, got_offer: opt.value })
                                        }
                                        className={cn(
                                            "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                                            data.got_offer === opt.value
                                                ? "border-olive bg-olive-subtle text-olive"
                                                : "border-border bg-white text-charcoal hover:border-olive/30"
                                        )}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interview Questions */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-charcoal">
                                Interview questions{" "}
                                <span className="font-normal text-muted">(max 5)</span>
                            </Label>

                            {(data.interview_questions ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(data.interview_questions ?? []).map((q, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1 rounded-lg bg-olive-subtle px-3 py-1.5 text-xs text-charcoal"
                                        >
                                            {q}
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(i)}
                                                className="ml-1 text-muted hover:text-charcoal"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {(data.interview_questions ?? []).length < 5 && (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Tell me about a time you handled conflict"
                                        value={questionInput}
                                        onChange={(e) => setQuestionInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addQuestion();
                                            }
                                        }}
                                        className="h-10 flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addQuestion}
                                        className="h-10"
                                    >
                                        Add
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
