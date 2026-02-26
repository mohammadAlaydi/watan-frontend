import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { JobDetail } from "@/components/jobs/JobDetail";
import { getJobById } from "@/lib/jobs/queries";
import { createServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { id } = await params;
    const job = await getJobById(id);
    if (!job) return { title: "Job Not Found — Watan" };

    const description = job.description?.slice(0, 160) ?? "";

    return {
        title: `${job.title} at ${job.company.name} — Watan Jobs`,
        description,
    };
}

export default async function JobDetailPage({ params }: PageProps) {
    const { id } = await params;
    const { userId } = await auth();

    const job = await getJobById(id);
    if (!job) notFound();

    // Check saved / applied state
    let isSaved = false;
    let isApplied = false;

    if (userId) {
        const supabase = createServerClient();

        const [savedResult, appliedResult] = await Promise.all([
            supabase
                .from("saved_jobs")
                .select("id")
                .eq("job_id", id)
                .eq("user_id", userId)
                .single(),
            supabase
                .from("applications")
                .select("id")
                .eq("job_id", id)
                .eq("applicant_id", userId)
                .single(),
        ]);

        isSaved = !!savedResult.data;
        isApplied = !!appliedResult.data;
    }

    return (
        <div className="min-h-screen bg-cream px-6 pt-24 lg:px-12">
            <div className="mx-auto max-w-3xl">
                <JobDetail
                    jobId={id}
                    initialJob={job}
                    isSaved={isSaved}
                    isApplied={isApplied}
                    showBackButton
                />

                {/* Mobile sticky bottom bar */}
                {!isApplied && job.status === "active" && (
                    <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 md:hidden">
                        <div className="mx-auto flex max-w-3xl gap-3">
                            <button className="flex-1 rounded-xl bg-olive py-3 font-semibold text-white hover:bg-charcoal">
                                Apply now
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
