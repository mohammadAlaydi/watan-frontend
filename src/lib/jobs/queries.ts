"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { JobFilters, ApplicationQuestion } from "./schema";

// ─── Types ───

export interface JobWithCompany {
    id: string;
    company_id: string;
    title: string;
    slug: string;
    description: string;
    requirements: string[] | null;
    responsibilities: string[] | null;
    nice_to_have: string[] | null;
    department: string | null;
    seniority: string | null;
    employment_type: string | null;
    work_arrangement: string | null;
    country: string | null;
    city: string | null;
    timezone_requirement: string | null;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    salary_period: string;
    salary_public: boolean;
    apply_type: string;
    external_apply_url: string | null;
    apply_email: string | null;
    application_questions: ApplicationQuestion[] | null;
    resume_required: boolean;
    cover_letter_required: boolean;
    welcomes_diaspora: boolean;
    visa_sponsorship: boolean;
    relocation_assistance: boolean;
    arabic_required: boolean;
    arabic_preferred: boolean;
    status: string;
    featured: boolean;
    expires_at: string | null;
    view_count: number;
    application_count: number;
    saved_count: number;
    posted_by: string;
    created_at: string;
    updated_at: string;
    company: {
        name: string;
        logo_url: string | null;
        slug: string;
        industry: string | null;
        size: string | null;
        description: string | null;
        avg_overall_rating: number | null;
        review_count: number;
    };
}

export interface ApplicationWithJob {
    id: string;
    job_id: string;
    applicant_id: string;
    resume_url: string | null;
    cover_letter: string | null;
    answers: { questionId: string; answer: string }[] | null;
    linkedin_url: string | null;
    portfolio_url: string | null;
    status: string;
    status_updated_at: string;
    applied_at: string;
    job: {
        title: string;
        work_arrangement: string | null;
        country: string | null;
        city: string | null;
        salary_min: number | null;
        salary_max: number | null;
        salary_currency: string;
        seniority: string | null;
    };
    company: {
        name: string;
        logo_url: string | null;
        slug: string;
    };
}

function supabase() {
    return createServerClient();
}

// ─── Build query with filters ───

function applyFilters(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any,
    filters: Partial<JobFilters>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
    if (filters.q) {
        query = query.or(
            `title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`
        );
    }
    if (filters.department) {
        query = query.eq("department", filters.department);
    }
    if (filters.seniority) {
        query = query.eq("seniority", filters.seniority);
    }
    if (filters.arrangement) {
        query = query.eq("work_arrangement", filters.arrangement);
    }
    if (filters.country) {
        query = query.eq("country", filters.country);
    }
    if (filters.employmentType) {
        query = query.eq("employment_type", filters.employmentType);
    }
    if (filters.salaryMin) {
        query = query.gte("salary_max", filters.salaryMin);
    }
    if (filters.salaryMax) {
        query = query.lte("salary_min", filters.salaryMax);
    }
    if (filters.visaSponsorship) {
        query = query.eq("visa_sponsorship", true);
    }
    if (filters.relocationAssistance) {
        query = query.eq("relocation_assistance", true);
    }
    if (filters.arabicRequired) {
        query = query.eq("arabic_required", true);
    }
    if (filters.arabicPreferred) {
        query = query.eq("arabic_preferred", true);
    }
    if (filters.featured) {
        query = query.eq("featured", true);
    }
    if (filters.postedWithin && filters.postedWithin !== "any") {
        const now = new Date();
        let since: Date;
        switch (filters.postedWithin) {
            case "24h":
                since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case "week":
                since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                since = new Date(0);
        }
        query = query.gte("created_at", since.toISOString());
    }
    return query;
}

// ─── Queries ───

const ITEMS_PER_PAGE = 20;

/**
 * Fetch paginated jobs with filters applied.
 * Also fetches user's saved/applied IDs in parallel.
 */
export async function getJobs(
    filters: Partial<JobFilters>,
    userId?: string
): Promise<{
    jobs: JobWithCompany[];
    total: number;
    userSavedIds: string[];
    userAppliedIds: string[];
}> {
    const page = filters.page ?? 1;
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase()
        .from("jobs")
        .select(
            `
      *,
      company:companies!company_id (
        name, logo_url, slug, industry, size,
        description, avg_overall_rating, review_count
      )
    `,
            { count: "exact" }
        )
        .eq("status", "active");

    query = applyFilters(query, filters);

    // Sorting
    switch (filters.sort) {
        case "salary_desc":
            query = query.order("salary_max", {
                ascending: false,
                nullsFirst: false,
            });
            break;
        case "applications":
            query = query.order("application_count", { ascending: false });
            break;
        case "match":
        case "recent":
        default:
            query = query
                .order("featured", { ascending: false })
                .order("created_at", { ascending: false });
            break;
    }

    query = query.range(from, to);

    // Parallel: user's saved + applied job IDs
    const savedPromise = userId
        ? supabase()
            .from("saved_jobs")
            .select("job_id")
            .eq("user_id", userId)
        : Promise.resolve({ data: [] as { job_id: string }[] });

    const appliedPromise = userId
        ? supabase()
            .from("applications")
            .select("job_id")
            .eq("applicant_id", userId)
        : Promise.resolve({ data: [] as { job_id: string }[] });

    const [jobsResult, savedResult, appliedResult] = await Promise.all([
        query,
        savedPromise,
        appliedPromise,
    ]);

    if (jobsResult.error) throw new Error(jobsResult.error.message);

    const userSavedIds = (savedResult.data ?? []).map(
        (r: { job_id: string }) => r.job_id
    );
    const userAppliedIds = (appliedResult.data ?? []).map(
        (r: { job_id: string }) => r.job_id
    );

    return {
        jobs: (jobsResult.data ?? []) as unknown as JobWithCompany[],
        total: jobsResult.count ?? 0,
        userSavedIds,
        userAppliedIds,
    };
}

/** Fetch a single job by ID with company data */
export async function getJobById(
    id: string
): Promise<JobWithCompany | null> {
    const { data, error } = await supabase()
        .from("jobs")
        .select(
            `
      *,
      company:companies!company_id (
        name, logo_url, slug, industry, size,
        description, avg_overall_rating, review_count
      )
    `
        )
        .eq("id", id)
        .single();

    if (error) return null;
    return data as unknown as JobWithCompany;
}

/** Fetch all saved jobs for a user with full job + company data */
export async function getSavedJobs(
    userId: string
): Promise<JobWithCompany[]> {
    const { data, error } = await supabase()
        .from("saved_jobs")
        .select(
            `
      job_id,
      saved_at,
      job:jobs!job_id (
        *,
        company:companies!company_id (
          name, logo_url, slug, industry, size,
          description, avg_overall_rating, review_count
        )
      )
    `
        )
        .eq("user_id", userId)
        .order("saved_at", { ascending: false });

    if (error) return [];
    // Flatten: extract job from each row
    return (data ?? []).map(
        (row: { job: unknown }) => row.job as unknown as JobWithCompany
    );
}

/** Fetch all applications for a user with job + company data */
export async function getUserApplications(
    userId: string
): Promise<ApplicationWithJob[]> {
    const { data, error } = await supabase()
        .from("applications")
        .select(
            `
      id, job_id, applicant_id, resume_url, cover_letter,
      answers, linkedin_url, portfolio_url, status,
      status_updated_at, applied_at,
      job:jobs!job_id (
        title, work_arrangement, country, city,
        salary_min, salary_max, salary_currency, seniority,
        company:companies!company_id (
          name, logo_url, slug
        )
      )
    `
        )
        .eq("applicant_id", userId)
        .order("applied_at", { ascending: false });

    if (error) return [];

    // Flatten nested structure
    return (data ?? []).map((row: Record<string, unknown>) => {
        const job = row.job as Record<string, unknown>;
        const company = job?.company as Record<string, unknown>;
        return {
            id: row.id as string,
            job_id: row.job_id as string,
            applicant_id: row.applicant_id as string,
            resume_url: row.resume_url as string | null,
            cover_letter: row.cover_letter as string | null,
            answers: row.answers as { questionId: string; answer: string }[] | null,
            linkedin_url: row.linkedin_url as string | null,
            portfolio_url: row.portfolio_url as string | null,
            status: row.status as string,
            status_updated_at: row.status_updated_at as string,
            applied_at: row.applied_at as string,
            job: {
                title: job?.title as string,
                work_arrangement: job?.work_arrangement as string | null,
                country: job?.country as string | null,
                city: job?.city as string | null,
                salary_min: job?.salary_min as number | null,
                salary_max: job?.salary_max as number | null,
                salary_currency: (job?.salary_currency as string) ?? "USD",
                seniority: job?.seniority as string | null,
            },
            company: {
                name: company?.name as string,
                logo_url: company?.logo_url as string | null,
                slug: company?.slug as string,
            },
        };
    });
}

/**
 * Search autocomplete suggestions for job titles and companies.
 */
export async function searchJobSuggestions(query: string): Promise<{
    titles: string[];
    companies: { name: string; slug: string; logo_url: string | null }[];
}> {
    if (!query || query.length < 2) return { titles: [], companies: [] };

    const [titlesResult, companiesResult] = await Promise.all([
        supabase()
            .from("jobs")
            .select("title")
            .eq("status", "active")
            .ilike("title", `%${query}%`)
            .limit(4),
        supabase()
            .from("companies")
            .select("name, slug, logo_url")
            .ilike("name", `%${query}%`)
            .limit(3),
    ]);

    // Deduplicate titles
    const uniqueTitles = [
        ...new Set((titlesResult.data ?? []).map((r: { title: string }) => r.title)),
    ];

    return {
        titles: uniqueTitles,
        companies: (companiesResult.data ?? []) as {
            name: string;
            slug: string;
            logo_url: string | null;
        }[],
    };
}
