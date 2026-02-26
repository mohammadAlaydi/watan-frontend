import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { getSavedJobs } from "@/lib/jobs/queries";
import { JobCardCompact } from "@/components/jobs/JobCardCompact";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saved Jobs — Watan",
    description: "Your saved job listings on Watan.",
};

export default async function SavedJobsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const savedJobs = await getSavedJobs(userId);

    return (
        <div className="min-h-screen bg-cream px-6 pt-24 lg:px-12">
            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <Bookmark className="h-7 w-7 text-olive" />
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal">Saved Jobs</h1>
                        <p className="text-sm text-muted">
                            {savedJobs.length} saved job{savedJobs.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* Content */}
                {savedJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border bg-white px-6 py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-olive-pale">
                            <Bookmark className="h-7 w-7 text-olive" />
                        </div>
                        <h3 className="mb-1 text-lg font-bold text-charcoal">
                            No saved jobs yet
                        </h3>
                        <p className="mb-6 max-w-xs text-sm text-muted">
                            Save jobs you&apos;re interested in to review later
                        </p>
                        <Button className="bg-olive hover:bg-olive-light" asChild>
                            <Link href="/jobs">Browse jobs →</Link>
                        </Button>
                    </div>
                ) : (
                    <div>
                        {savedJobs.map((job) => (
                            <JobCardCompact
                                key={job.id}
                                job={job}
                                isSaved={true}
                                matchScore={0}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
