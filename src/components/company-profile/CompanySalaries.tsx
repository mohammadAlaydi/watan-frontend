"use client";

import { formatSalaryShort } from "@/lib/reviews/utils";
import type { SalarySummary } from "@/lib/companies/queries";

interface CompanySalariesProps {
    salaries: SalarySummary[];
    companyName: string;
}

/** Salary data table grouped by role */
export function CompanySalaries({
    salaries,
    companyName,
}: CompanySalariesProps) {
    if (salaries.length === 0) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-8">
                <h2 className="mb-2 text-xl font-bold text-charcoal">
                    Salary data at {companyName}
                </h2>
                <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16">
                    <div className="text-4xl mb-3">💰</div>
                    <h3 className="text-lg font-semibold text-charcoal">
                        Not enough salary data yet
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                        Be the first to add your salary info
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-6">
            <h2 className="mb-1 text-xl font-bold text-charcoal">
                Salary data at {companyName}
            </h2>
            <p className="mb-6 text-sm text-muted">
                Based on{" "}
                {salaries.reduce((sum, s) => sum + s.submissions, 0)} anonymous
                submissions
            </p>

            <div className="rounded-2xl border border-border bg-white overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-olive-subtle/30">
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                Job Title
                            </th>
                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                                Salary Range
                            </th>
                            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                                Submissions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {salaries.map((salary) => (
                            <tr
                                key={salary.job_title}
                                className="border-b border-border last:border-b-0 transition-colors hover:bg-olive-subtle/20"
                            >
                                <td className="px-5 py-4 text-sm font-medium text-charcoal">
                                    {salary.job_title}
                                </td>
                                <td className="px-5 py-4 text-sm text-charcoal">
                                    {formatSalaryShort(salary.min_salary, salary.currency)} –{" "}
                                    {formatSalaryShort(salary.max_salary, salary.currency)} /{" "}
                                    {salary.period}
                                </td>
                                <td className="px-5 py-4 text-center text-sm text-muted">
                                    {salary.submissions}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
