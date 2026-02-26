import { Briefcase } from "lucide-react";

interface CompanyJobsProps {
    companyName: string;
}

/** Placeholder for company jobs tab */
export function CompanyJobs({ companyName }: CompanyJobsProps) {
    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            <h2 className="mb-2 text-xl font-bold text-charcoal">
                Open positions at {companyName}
            </h2>
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16">
                <Briefcase className="mb-3 h-10 w-10 text-muted" />
                <h3 className="text-lg font-semibold text-charcoal">
                    No open positions
                </h3>
                <p className="mt-1 text-sm text-muted">
                    Check back later for job opportunities
                </p>
            </div>
        </div>
    );
}
