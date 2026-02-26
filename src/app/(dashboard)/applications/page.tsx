import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserApplications } from "@/lib/jobs/queries";
import { ApplicationsClient } from "@/components/jobs/ApplicationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Applications — Watan",
    description: "Track your job application history on Watan.",
};

export default async function ApplicationsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const applications = await getUserApplications(userId);

    return (
        <div className="min-h-screen bg-cream px-6 pt-24 lg:px-12">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-charcoal">
                        My Applications
                    </h1>
                    <p className="text-sm text-muted">
                        {applications.length} total application
                        {applications.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <ApplicationsClient applications={applications} />
            </div>
        </div>
    );
}
