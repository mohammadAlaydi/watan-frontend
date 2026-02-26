"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { FullReviewSchema, ReviewFlagSchema } from "./schema";
import type { FullReviewData, ReviewFlagData } from "./schema";
import { revalidatePath } from "next/cache";

interface ActionResult {
    success: boolean;
    error?: string;
    reviewId?: string;
}

interface ToggleVoteResult {
    success: boolean;
    error?: string;
    newCount?: number;
    voted?: boolean;
}

async function getClerkUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

function supabase() {
    return createServerClient();
}

/** Submit a new review for a company */
export async function submitReview(
    companyId: string,
    data: FullReviewData
): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = FullReviewSchema.parse(data);

        // Check duplicate
        const { count } = await supabase()
            .from("reviews")
            .select("id", { count: "exact", head: true })
            .eq("reviewer_id", userId)
            .eq("company_id", companyId);

        if ((count ?? 0) > 0) {
            return { success: false, error: "You have already reviewed this company" };
        }

        // Insert review
        const { data: review, error } = await supabase()
            .from("reviews")
            .insert({
                company_id: companyId,
                reviewer_id: userId,
                job_title: parsed.job_title,
                employment_status: parsed.employment_status,
                employment_start_year: parsed.employment_start_year ?? null,
                employment_end_year: parsed.employment_end_year ?? null,
                work_location: parsed.work_location,
                is_anonymous: true,
                overall_rating: parsed.overall_rating,
                culture_rating: parsed.culture_rating ?? null,
                management_rating: parsed.management_rating ?? null,
                worklife_rating: parsed.worklife_rating ?? null,
                compensation_rating: parsed.compensation_rating ?? null,
                growth_rating: parsed.growth_rating ?? null,
                title: parsed.title,
                pros: parsed.pros,
                cons: parsed.cons,
                advice_to_management: parsed.advice_to_management || null,
                recommends_company: parsed.recommends_company ?? null,
                salary_amount: parsed.salary_amount ?? null,
                salary_currency: parsed.salary_currency ?? "USD",
                salary_period: parsed.salary_period ?? "annual",
                interview_difficulty: parsed.interview_difficulty ?? null,
                interview_experience: parsed.interview_experience ?? null,
                interview_questions: parsed.interview_questions ?? null,
                got_offer: parsed.got_offer ?? null,
            })
            .select("id")
            .single();

        if (error) return { success: false, error: error.message };

        // If salary data was provided, also add to salaries table
        if (parsed.salary_amount) {
            await supabase().from("salaries").insert({
                company_id: companyId,
                submitter_id: userId,
                job_title: parsed.job_title,
                salary_amount: parsed.salary_amount,
                currency: parsed.salary_currency ?? "USD",
                period: parsed.salary_period ?? "annual",
                location: parsed.work_location,
            });
        }

        revalidatePath(`/companies`);

        return { success: true, reviewId: review?.id };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

/** Toggle a helpful vote on a review */
export async function toggleHelpfulVote(
    reviewId: string
): Promise<ToggleVoteResult> {
    try {
        const userId = await getClerkUserId();

        // Check existing vote
        const { data: existing } = await supabase()
            .from("review_helpful_votes")
            .select("id")
            .eq("review_id", reviewId)
            .eq("voter_id", userId)
            .single();

        if (existing) {
            // Remove vote
            await supabase()
                .from("review_helpful_votes")
                .delete()
                .eq("id", existing.id);

            // Decrement count
            const { error: rpcError } = await supabase().rpc("decrement_helpful_count", {
                p_review_id: reviewId,
            });

            if (rpcError) {
                // Fallback: direct update
                const { data: currentReview } = await supabase()
                    .from("reviews")
                    .select("helpful_count")
                    .eq("id", reviewId)
                    .single();

                const decremented = Math.max(0, (currentReview?.helpful_count ?? 1) - 1);
                await supabase()
                    .from("reviews")
                    .update({ helpful_count: decremented })
                    .eq("id", reviewId);
            }

            const { data: review } = await supabase()
                .from("reviews")
                .select("helpful_count")
                .eq("id", reviewId)
                .single();

            return {
                success: true,
                newCount: review?.helpful_count ?? 0,
                voted: false,
            };
        }

        // Add vote
        const { error } = await supabase()
            .from("review_helpful_votes")
            .insert({ review_id: reviewId, voter_id: userId });

        if (error) return { success: false, error: error.message };

        // Increment count
        const { data: updatedReview } = await supabase()
            .from("reviews")
            .select("helpful_count")
            .eq("id", reviewId)
            .single();

        const newCount = (updatedReview?.helpful_count ?? 0) + 1;

        await supabase()
            .from("reviews")
            .update({ helpful_count: newCount })
            .eq("id", reviewId);

        return { success: true, newCount, voted: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

/** Flag a review for moderation */
export async function flagReview(
    reviewId: string,
    input: ReviewFlagData
): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = ReviewFlagSchema.parse(input);

        const { error } = await supabase().from("review_flags").insert({
            review_id: reviewId,
            reporter_id: userId,
            reason: parsed.reason,
            description: parsed.description || null,
        });

        if (error) return { success: false, error: error.message };

        // Increment flagged_count on the review
        const { data: review } = await supabase()
            .from("reviews")
            .select("flagged_count")
            .eq("id", reviewId)
            .single();

        const newFlagCount = (review?.flagged_count ?? 0) + 1;
        const updates: Record<string, unknown> = { flagged_count: newFlagCount };

        // Auto-flag if 5+ reports
        if (newFlagCount >= 5) {
            updates.status = "flagged";
        }

        await supabase()
            .from("reviews")
            .update(updates)
            .eq("id", reviewId);

        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}
