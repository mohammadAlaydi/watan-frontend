import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { JobsBoard } from "@/components/jobs/JobsBoard";
import { getJobs } from "@/lib/jobs/queries";
import { createServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs — Watan",
  description:
    "Browse job opportunities curated for Palestinian professionals worldwide. Remote, hybrid, and on-site positions across 48+ countries.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function getUserProfile(userId: string) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();
  return data;
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { userId } = await auth();

  // Build filters from search params
  const filters: Record<string, unknown> = {};
  if (params.q) filters.q = params.q as string;
  if (params.department) filters.department = params.department as string;
  if (params.seniority) filters.seniority = params.seniority as string;
  if (params.arrangement) filters.arrangement = params.arrangement as string;
  if (params.country) filters.country = params.country as string;
  if (params.salary_min) filters.salaryMin = Number(params.salary_min);
  if (params.sort) filters.sort = params.sort as string;
  if (params.page) filters.page = Number(params.page);

  // Parallel fetches
  const [jobsResult, profile] = await Promise.all([
    getJobs(filters as Record<string, string>, userId ?? undefined),
    userId ? getUserProfile(userId) : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen bg-cream px-6 pt-24 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Suspense>
          <JobsBoard
            initialJobs={jobsResult.jobs}
            initialTotal={jobsResult.total}
            initialSavedIds={jobsResult.userSavedIds}
            initialAppliedIds={jobsResult.userAppliedIds}
            userProfile={profile ?? undefined}
            initialSelectedId={(params.id as string) ?? undefined}
            initialFilters={filters}
          />
        </Suspense>
      </div>
    </div>
  );
}
