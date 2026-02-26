"use client";

import { CompanyCard } from "./CompanyCard";
import type { CompanyRow } from "@/lib/companies/queries";

interface CompanyDirectoryProps {
    companies: CompanyRow[];
    total: number;
    currentPage: number;
}

/** Renders the grid of company cards */
export function CompanyDirectory({
    companies,
    total,
    currentPage,
}: CompanyDirectoryProps) {
    if (companies.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-lg font-semibold text-charcoal">
                    No companies found
                </h3>
                <p className="mt-1 text-sm text-muted">
                    Try adjusting your filters or search query
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
    );
}
