"use server";

import { createServerClient } from "@/lib/supabase/server";

/** Database row shape for a company */
export interface CompanyRow {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    industry: string | null;
    company_size: string | null;
    founded_year: number | null;
    headquarters: string | null;
    website_url: string | null;
    logo_url: string | null;
    cover_url: string | null;
    total_reviews: number;
    avg_overall_rating: number;
    avg_culture_rating: number;
    avg_management_rating: number;
    avg_worklife_rating: number;
    avg_compensation_rating: number;
    avg_growth_rating: number;
    recommend_percentage: number;
    is_claimed: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface CompanyFilters {
    q?: string;
    industry?: string;
    size?: string;
    country?: string;
    sort?: string;
    page?: number;
    limit?: number;
}

export interface SalarySummary {
    job_title: string;
    avg_salary: number;
    min_salary: number;
    max_salary: number;
    currency: string;
    period: string;
    submissions: number;
}

export interface InterviewRow {
    id: string;
    job_title: string;
    work_location: string | null;
    interview_difficulty: string | null;
    interview_experience: string | null;
    interview_questions: string[] | null;
    got_offer: boolean | null;
    created_at: string;
}

function supabase() {
    return createServerClient();
}

/** Fetch a single company by slug */
export async function getCompanyBySlug(
    slug: string
): Promise<CompanyRow | null> {
    const { data, error } = await supabase()
        .from("companies")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) return null;
    return data as CompanyRow;
}

/** Fetch paginated, filterable company list */
export async function getCompanies(
    filters: CompanyFilters
): Promise<{ companies: CompanyRow[]; total: number }> {
    const {
        q,
        industry,
        size,
        country,
        sort = "most_reviewed",
        page = 1,
        limit = 20,
    } = filters;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase()
        .from("companies")
        .select("*", { count: "exact" });

    if (q) {
        query = query.or(
            `name.ilike.%${q}%,industry.ilike.%${q}%,headquarters.ilike.%${q}%`
        );
    }
    if (industry) {
        query = query.eq("industry", industry);
    }
    if (size) {
        query = query.eq("company_size", size);
    }
    if (country) {
        query = query.ilike("headquarters", `%${country}%`);
    }

    switch (sort) {
        case "highest_rated":
            query = query.order("avg_overall_rating", { ascending: false });
            break;
        case "recently_added":
            query = query.order("created_at", { ascending: false });
            break;
        default:
            query = query.order("total_reviews", { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return {
        companies: (data ?? []) as CompanyRow[],
        total: count ?? 0,
    };
}

/** Search companies for autocomplete (max 6) */
export async function searchCompanies(
    queryStr: string,
    limit = 6
): Promise<CompanyRow[]> {
    const { data, error } = await supabase()
        .from("companies")
        .select("*")
        .ilike("name", `%${queryStr}%`)
        .order("total_reviews", { ascending: false })
        .limit(limit);

    if (error) return [];
    return (data ?? []) as CompanyRow[];
}

/**
 * Get salary summaries grouped by job title.
 * Only shows data if 3+ submissions exist for a role (privacy threshold).
 */
export async function getCompanySalaries(
    companyId: string
): Promise<SalarySummary[]> {
    const { data, error } = await supabase()
        .from("salaries")
        .select("job_title, salary_amount, currency, period")
        .eq("company_id", companyId);

    if (error || !data) return [];

    // Group by job_title
    const grouped = new Map<
        string,
        { amounts: number[]; currency: string; period: string }
    >();

    for (const row of data) {
        const key = row.job_title;
        if (!grouped.has(key)) {
            grouped.set(key, {
                amounts: [],
                currency: row.currency ?? "USD",
                period: row.period ?? "annual",
            });
        }
        grouped.get(key)!.amounts.push(row.salary_amount);
    }

    const results: SalarySummary[] = [];
    for (const [title, info] of grouped) {
        if (info.amounts.length < 3) continue; // Privacy threshold
        const sorted = [...info.amounts].sort((a, b) => a - b);
        results.push({
            job_title: title,
            avg_salary: Math.round(
                info.amounts.reduce((a, b) => a + b, 0) / info.amounts.length
            ),
            min_salary: sorted[0],
            max_salary: sorted[sorted.length - 1],
            currency: info.currency,
            period: info.period,
            submissions: info.amounts.length,
        });
    }

    return results.sort((a, b) => b.submissions - a.submissions);
}

/** Get interview experiences for a company */
export async function getCompanyInterviews(
    companyId: string
): Promise<InterviewRow[]> {
    const { data, error } = await supabase()
        .from("reviews")
        .select(
            `id, job_title, work_location, interview_difficulty,
       interview_experience, interview_questions, got_offer, created_at`
        )
        .eq("company_id", companyId)
        .eq("status", "published")
        .not("interview_experience", "is", null)
        .order("created_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as InterviewRow[];
}
