"use client";

import { FileText } from "lucide-react";
import type { ApplicationSubmissionData } from "@/lib/jobs/schema";
import type { JobWithCompany } from "@/lib/jobs/queries";
import { JobStatusBadge } from "./JobStatusBadge";
import { formatSalary } from "@/lib/jobs/utils";

interface ApplyStep3Props {
    data: Partial<ApplicationSubmissionData>;
    job: JobWithCompany;
    agreed: boolean;
    onAgreeChange: (agreed: boolean) => void;
    onEditStep: (step: number) => void;
}

/**
 * Step 3 of the apply flow: review all info + submission agreement.
 */
export function ApplyStep3({
    data,
    job,
    agreed,
    onAgreeChange,
    onEditStep,
}: ApplyStep3Props) {
    const company = job.company;
    const location = [job.city, job.country].filter(Boolean).join(", ");
    const salaryText =
        job.salary_public && (job.salary_min || job.salary_max)
            ? formatSalary(
                job.salary_min,
                job.salary_max,
                job.salary_currency,
                job.salary_period
            )
            : null;

    return (
        <div>
            <h2 className="mb-1 text-xl font-bold text-charcoal">
                Review your application
            </h2>
            <p className="mb-6 text-sm text-muted">
                Make sure everything looks right
            </p>

            {/* Summary card */}
            <div className="mb-4 rounded-2xl border bg-white p-5">
                {/* Job section */}
                <div className="mb-4">
                    <div className="flex items-center gap-3">
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className="h-10 w-10 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-olive-pale text-sm font-bold text-olive">
                                {company.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted">{company.name}</p>
                            <p className="font-bold text-charcoal">{job.title}</p>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <JobStatusBadge arrangement={job.work_arrangement} />
                        {location && (
                            <span className="text-xs text-muted">📍 {location}</span>
                        )}
                        {salaryText && (
                            <span className="text-xs font-medium text-charcoal">
                                {salaryText}
                            </span>
                        )}
                    </div>
                </div>

                <hr className="my-4 border-border" />

                {/* Your info */}
                <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted">Full name</span>
                        <span className="font-medium text-charcoal">
                            {data.fullName}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted">Email</span>
                        <span className="font-medium text-charcoal">{data.email}</span>
                    </div>
                    {data.resumeUrl && (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted">Resume</span>
                            <span className="flex items-center gap-1 font-medium text-charcoal">
                                <FileText className="h-3.5 w-3.5" />
                                {data.resumeUrl}
                            </span>
                        </div>
                    )}
                    {data.linkedinUrl && (
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">LinkedIn</span>
                            <span className="truncate font-medium text-charcoal">
                                {data.linkedinUrl}
                            </span>
                        </div>
                    )}
                </div>

                {/* Cover letter preview */}
                {data.coverLetter && (
                    <>
                        <hr className="my-4 border-border" />
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm font-medium text-charcoal">
                                    Cover letter
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onEditStep(2)}
                                    className="text-xs font-medium text-olive hover:underline"
                                >
                                    Edit
                                </button>
                            </div>
                            <p className="text-sm text-muted line-clamp-3">
                                {data.coverLetter}
                            </p>
                        </div>
                    </>
                )}

                {/* Custom answers */}
                {data.answers && data.answers.length > 0 && (
                    <>
                        <hr className="my-4 border-border" />
                        <div className="space-y-2">
                            {data.answers.map((ans) => (
                                <div key={ans.questionId}>
                                    <p className="text-xs text-muted">{ans.questionId}</p>
                                    <p className="truncate text-sm text-charcoal">
                                        {ans.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Agreement checkbox */}
            <label className="mb-4 flex cursor-pointer items-start gap-3">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => onAgreeChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-olive focus:ring-olive"
                />
                <span className="text-sm text-charcoal">
                    I confirm this application is accurate and complete. I agree to
                    Watan&apos;s{" "}
                    <a href="/terms" className="text-olive underline">
                        terms
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-olive underline">
                        privacy policy
                    </a>
                    .
                </span>
            </label>

            {/* Important notice */}
            <div className="rounded-xl bg-olive-subtle p-4">
                <p className="mb-2 text-sm font-semibold text-charcoal">
                    📤 How your application works
                </p>
                <ul className="space-y-1 text-sm text-muted">
                    <li>• Your application goes directly to the employer</li>
                    <li>• Watan does not screen or filter applications</li>
                    <li>• The employer will contact you directly</li>
                    <li>• You can withdraw your application at any time</li>
                    <li>• Your contact info is shared with the employer</li>
                </ul>
            </div>
        </div>
    );
}
