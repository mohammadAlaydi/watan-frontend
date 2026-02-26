"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ApplicationCard } from "@/components/jobs/ApplicationCard";
import { withdrawApplication } from "@/lib/jobs/actions";
import { toast } from "sonner";
import type { ApplicationWithJob } from "@/lib/jobs/queries";

interface ApplicationsClientProps {
    applications: ApplicationWithJob[];
}

const STATUS_TABS = [
    { key: "all", label: "All" },
    { key: "submitted", label: "Submitted" },
    { key: "reviewing", label: "Under Review" },
    { key: "interview", label: "Interview" },
    { key: "offer", label: "Offer" },
    { key: "rejected", label: "Rejected" },
] as const;

/**
 * Client-side applications list with filter tabs and withdraw action.
 */
export function ApplicationsClient({
    applications: initialApps,
}: ApplicationsClientProps) {
    const [applications, setApplications] = useState(initialApps);
    const [activeTab, setActiveTab] = useState("all");

    const filtered =
        activeTab === "all"
            ? applications
            : applications.filter((a) => a.status === activeTab);

    // Stats
    const stats = {
        applied: applications.length,
        reviewing: applications.filter((a) => a.status === "reviewing").length,
        interview: applications.filter((a) => a.status === "interview").length,
        offers: applications.filter((a) => a.status === "offer").length,
    };

    const handleWithdraw = async (applicationId: string) => {
        if (!confirm("Are you sure you want to withdraw this application?")) return;

        const result = await withdrawApplication(applicationId);
        if (result.success) {
            setApplications((prev) =>
                prev.map((a) =>
                    a.id === applicationId
                        ? { ...a, status: "withdrawn", status_updated_at: new Date().toISOString() }
                        : a
                )
            );
            toast.success("Application withdrawn");
        } else {
            toast.error(result.error ?? "Failed to withdraw");
        }
    };

    return (
        <div>
            {/* Stats row */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatPill
                    label="Applied"
                    count={stats.applied}
                    className="bg-olive-pale text-olive"
                />
                <StatPill
                    label="Reviewing"
                    count={stats.reviewing}
                    className="bg-blue-50 text-blue-700"
                />
                <StatPill
                    label="Interview"
                    count={stats.interview}
                    className="bg-yellow-50 text-yellow-700"
                />
                <StatPill
                    label="Offers"
                    count={stats.offers}
                    className="bg-green-50 text-green-700"
                />
            </div>

            {/* Filter tabs */}
            <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-olive-subtle p-1">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                            activeTab === tab.key
                                ? "bg-white text-charcoal shadow-sm"
                                : "text-muted hover:text-charcoal"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border bg-white px-6 py-16 text-center">
                    <p className="text-muted">No applications in this category</p>
                </div>
            ) : (
                <div>
                    {filtered.map((app) => (
                        <ApplicationCard
                            key={app.id}
                            application={app}
                            onWithdraw={handleWithdraw}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function StatPill({
    label,
    count,
    className,
}: {
    label: string;
    count: number;
    className: string;
}) {
    return (
        <div className={cn("rounded-xl p-3 text-center", className)}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium">{label}</p>
        </div>
    );
}
