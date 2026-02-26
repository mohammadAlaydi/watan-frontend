"use server";

import { createServerClient } from "@/lib/supabase/server";

/** Database row shape for a public review (no reviewer_id) */
export interface PublicReview {
    id: string;
    company_id: string;
    job_title: string;
    employment_status: string;
    employment_start_year: number | null;
    employment_end_year: number | null;
    work_location: string | null;
    is_anonymous: boolean;
    overall_rating: number;
    culture_rating: number | null;
    management_rating: number | null;
    worklife_rating: number | null;
    compensation_rating: number | null;
    growth_rating: number | null;
    title: string;
    pros: string;
    cons: string;
    advice_to_management: string | null;
    recommends_company: boolean | null;
    ceo_approval: boolean | null;
    salary_amount: number | null;
    salary_currency: string | null;
    salary_period: string | null;
    interview_difficulty: string | null;
    interview_experience: string | null;
    interview_questions: string[] | null;
    got_offer: boolean | null;
    status: string;
    helpful_count: number;
    created_at: string;
    updated_at: string;
}

export interface ReviewQueryOptions {
    sort: "recent" | "helpful" | "highest" | "lowest";
    status: "current" | "former" | "all";
    page: number;
    limit: number;
}

function supabase() {
    return createServerClient();
}

const PUBLIC_REVIEW_COLUMNS = `
  id, company_id, job_title, employment_status,
  employment_start_year, employment_end_year, work_location,
  is_anonymous, overall_rating, culture_rating, management_rating,
  worklife_rating, compensation_rating, growth_rating,
  title, pros, cons, advice_to_management,
  recommends_company, ceo_approval,
  salary_amount, salary_currency, salary_period,
  interview_difficulty, interview_experience, interview_questions,
  got_offer, status, helpful_count, created_at, updated_at
`;

/**
 * Fetch paginated reviews for a company.
 * NEVER selects reviewer_id.
 */
export async function getCompanyReviews(
    companyId: string,
    options: ReviewQueryOptions
): Promise<{ reviews: PublicReview[]; total: number }> {
    const { sort, status, page, limit } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase()
        .from("reviews")
        .select(PUBLIC_REVIEW_COLUMNS, { count: "exact" })
        .eq("company_id", companyId)
        .eq("status", "published");

    if (status === "current") {
        query = query.eq("employment_status", "current");
    } else if (status === "former") {
        query = query.eq("employment_status", "former");
    }

    switch (sort) {
        case "helpful":
            query = query.order("helpful_count", { ascending: false });
            break;
        case "highest":
            query = query.order("overall_rating", { ascending: false });
            break;
        case "lowest":
            query = query.order("overall_rating", { ascending: true });
            break;
        default:
            query = query.order("created_at", { ascending: false });
    }

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);

    return {
        reviews: (data ?? []) as PublicReview[],
        total: count ?? 0,
    };
}

/** Fetch a single review by ID (public columns only) */
export async function getReviewById(
    id: string
): Promise<PublicReview | null> {
    const { data, error } = await supabase()
        .from("reviews")
        .select(PUBLIC_REVIEW_COLUMNS)
        .eq("id", id)
        .single();

    if (error) return null;
    return data as PublicReview;
}

/** Get the list of review IDs the user has upvoted */
export async function getUserVotedReviews(
    clerkUserId: string
): Promise<string[]> {
    const { data, error } = await supabase()
        .from("review_helpful_votes")
        .select("review_id")
        .eq("voter_id", clerkUserId);

    if (error) return [];
    return (data ?? []).map((row) => row.review_id as string);
}

/** Check if a user has already reviewed a specific company */
export async function hasUserReviewedCompany(
    clerkUserId: string,
    companyId: string
): Promise<boolean> {
    const { count, error } = await supabase()
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("reviewer_id", clerkUserId)
        .eq("company_id", companyId);

    if (error) return false;
    return (count ?? 0) > 0;
}

/** Get a user's own review for a company (includes reviewer_id check) */
export async function getUserReviewForCompany(
    clerkUserId: string,
    companyId: string
): Promise<PublicReview | null> {
    const { data, error } = await supabase()
        .from("reviews")
        .select(PUBLIC_REVIEW_COLUMNS)
        .eq("reviewer_id", clerkUserId)
        .eq("company_id", companyId)
        .single();

    if (error) return null;
    return data as PublicReview;
}
