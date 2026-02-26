"use client";

import { cn } from "@/lib/utils";
import { formatReviewDate } from "@/lib/reviews/utils";
import type { InterviewRow } from "@/lib/companies/queries";

interface CompanyInterviewsProps {
    interviews: InterviewRow[];
    companyName: string;
}

const EXPERIENCE_STYLES: Record<string, { label: string; style: string }> = {
    positive: { label: "😊 Positive", style: "bg-green-50 text-green-700" },
    neutral: { label: "😐 Neutral", style: "bg-yellow-50 text-yellow-700" },
    negative: { label: "😟 Negative", style: "bg-red-50 text-red-700" },
};

const DIFFICULTY_LABELS: Record<string, string> = {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    very_hard: "Very Hard",
};

/** Interview experiences list */
export function CompanyInterviews({
    interviews,
    companyName,
}: CompanyInterviewsProps) {
    if (interviews.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-8">
                <h2 className="mb-2 text-xl font-bold text-charcoal">
                    Interview experiences at {companyName}
                </h2>
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16">
                    <div className="text-4xl mb-3">🎤</div>
                    <h3 className="text-lg font-semibold text-charcoal">
                        No interview experiences yet
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                        Share your interview experience to help others prepare
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-6">
            <h2 className="mb-6 text-xl font-bold text-charcoal">
                Interview experiences at {companyName}
            </h2>

            <div className="space-y-4">
                {interviews.map((interview) => {
                    const exp = interview.interview_experience
                        ? EXPERIENCE_STYLES[interview.interview_experience]
                        : null;

                    return (
                        <div
                            key={interview.id}
                            className="rounded-2xl border border-border bg-white p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h4 className="text-base font-semibold text-charcoal">
                                        {interview.job_title}
                                    </h4>
                                    <p className="text-xs text-muted">
                                        {formatReviewDate(interview.created_at)}
                                        {interview.work_location && ` · ${interview.work_location}`}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {exp && (
                                        <span
                                            className={cn(
                                                "rounded-md px-2.5 py-1 text-xs font-medium",
                                                exp.style
                                            )}
                                        >
                                            {exp.label}
                                        </span>
                                    )}
                                    {interview.interview_difficulty && (
                                        <span className="rounded-md bg-olive-subtle px-2.5 py-1 text-xs font-medium text-olive">
                                            {DIFFICULTY_LABELS[interview.interview_difficulty] ??
                                                interview.interview_difficulty}
                                        </span>
                                    )}
                                    {interview.got_offer !== null && (
                                        <span
                                            className={cn(
                                                "rounded-md px-2.5 py-1 text-xs font-medium",
                                                interview.got_offer
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-700"
                                            )}
                                        >
                                            {interview.got_offer ? "Got offer ✓" : "No offer ✗"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Interview questions */}
                            {interview.interview_questions &&
                                interview.interview_questions.length > 0 && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-xs font-semibold text-charcoal">
                                            Questions asked:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {interview.interview_questions.map((q, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded-lg bg-olive-subtle px-3 py-1.5 text-xs text-charcoal"
                                                >
                                                    {q}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
