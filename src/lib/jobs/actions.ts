"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import {
    ApplicationSubmissionSchema,
    JobAlertSchema,
    PostJobSchema,
} from "./schema";
import type {
    ApplicationSubmissionData,
    JobAlertData,
    PostJobData,
} from "./schema";
import { generateJobSlug } from "./utils";
import { revalidatePath } from "next/cache";

// ─── Types ───

interface ActionResult {
    success: boolean;
    error?: string;
}

interface SubmitApplicationResult extends ActionResult {
    applicationId?: string;
}

interface ToggleSaveResult extends ActionResult {
    saved?: boolean;
    savedCount?: number;
}

interface PostJobResult extends ActionResult {
    jobId?: string;
    slug?: string;
}

// ─── Helpers ───

async function getClerkUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

function supabase() {
    return createServerClient();
}

// ─── Actions ───

/** Submit a job application */
export async function submitApplication(
    jobId: string,
    data: ApplicationSubmissionData
): Promise<SubmitApplicationResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = ApplicationSubmissionSchema.parse(data);

        // Check duplicate
        const { count } = await supabase()
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("job_id", jobId)
            .eq("applicant_id", userId);

        if ((count ?? 0) > 0) {
            return {
                success: false,
                error: "You've already applied to this position",
            };
        }

        // Insert application
        const { data: application, error } = await supabase()
            .from("applications")
            .insert({
                job_id: jobId,
                applicant_id: userId,
                resume_url: parsed.resumeUrl || null,
                cover_letter: parsed.coverLetter || null,
                answers: parsed.answers ?? null,
                linkedin_url: parsed.linkedinUrl || null,
                portfolio_url: parsed.portfolioUrl || null,
                status: "submitted",
            })
            .select("id")
            .single();

        if (error) return { success: false, error: error.message };

        // Increment application_count on the job
        const { data: job } = await supabase()
            .from("jobs")
            .select("application_count")
            .eq("id", jobId)
            .single();

        await supabase()
            .from("jobs")
            .update({
                application_count: (job?.application_count ?? 0) + 1,
            })
            .eq("id", jobId);

        revalidatePath("/jobs");
        revalidatePath("/applications");

        return { success: true, applicationId: application?.id };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

/** Toggle save/unsave a job */
export async function toggleSaveJob(
    jobId: string
): Promise<ToggleSaveResult> {
    try {
        const userId = await getClerkUserId();

        // Check if already saved
        const { data: existing } = await supabase()
            .from("saved_jobs")
            .select("id")
            .eq("job_id", jobId)
            .eq("user_id", userId)
            .single();

        if (existing) {
            // Remove save
            await supabase()
                .from("saved_jobs")
                .delete()
                .eq("id", existing.id);

            // Decrement saved_count
            const { data: job } = await supabase()
                .from("jobs")
                .select("saved_count")
                .eq("id", jobId)
                .single();

            const newCount = Math.max(0, (job?.saved_count ?? 1) - 1);
            await supabase()
                .from("jobs")
                .update({ saved_count: newCount })
                .eq("id", jobId);

            return { success: true, saved: false, savedCount: newCount };
        }

        // Add save
        const { error } = await supabase()
            .from("saved_jobs")
            .insert({ job_id: jobId, user_id: userId });

        if (error) return { success: false, error: error.message };

        // Increment saved_count
        const { data: job } = await supabase()
            .from("jobs")
            .select("saved_count")
            .eq("id", jobId)
            .single();

        const newCount = (job?.saved_count ?? 0) + 1;
        await supabase()
            .from("jobs")
            .update({ saved_count: newCount })
            .eq("id", jobId);

        revalidatePath("/saved-jobs");

        return { success: true, saved: true, savedCount: newCount };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

/** Withdraw a job application */
export async function withdrawApplication(
    applicationId: string
): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();

        // Verify ownership
        const { data: app, error: fetchError } = await supabase()
            .from("applications")
            .select("id, applicant_id")
            .eq("id", applicationId)
            .single();

        if (fetchError || !app) {
            return { success: false, error: "Application not found" };
        }

        if (app.applicant_id !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        const { error } = await supabase()
            .from("applications")
            .update({
                status: "withdrawn",
                status_updated_at: new Date().toISOString(),
            })
            .eq("id", applicationId);

        if (error) return { success: false, error: error.message };

        revalidatePath("/applications");
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

/** Create a job alert */
export async function createJobAlert(
    data: JobAlertData
): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = JobAlertSchema.parse(data);

        const { error } = await supabase().from("job_alerts").insert({
            user_id: userId,
            name: parsed.name,
            keywords: parsed.keywords ?? [],
            locations: parsed.locations ?? [],
            departments: parsed.departments ?? [],
            seniority: parsed.seniority ?? [],
            work_arrangement: parsed.workArrangement ?? [],
            salary_min: parsed.salaryMin ?? null,
            frequency: parsed.frequency,
            is_active: true,
        });

        if (error) return { success: false, error: error.message };

        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

/** Post a new job (for employers) */
export async function postJob(data: PostJobData): Promise<PostJobResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = PostJobSchema.parse(data);

        // Get user's company
        const { data: profile } = await supabase()
            .from("profiles")
            .select("company_id")
            .eq("clerk_user_id", userId)
            .single();

        if (!profile?.company_id) {
            return {
                success: false,
                error: "You must be associated with a company to post jobs",
            };
        }

        const slug = generateJobSlug(
            parsed.title,
            "company",
            crypto.randomUUID().slice(0, 8)
        );

        const { data: job, error } = await supabase()
            .from("jobs")
            .insert({
                company_id: profile.company_id,
                title: parsed.title,
                slug,
                description: parsed.description,
                requirements: parsed.requirements ?? [],
                responsibilities: parsed.responsibilities ?? [],
                nice_to_have: parsed.niceToHave ?? [],
                department: parsed.department ?? null,
                seniority: parsed.seniority ?? null,
                employment_type: parsed.employmentType ?? null,
                work_arrangement: parsed.workArrangement ?? null,
                country: parsed.country ?? null,
                city: parsed.city ?? null,
                timezone_requirement: parsed.timezoneRequirement ?? null,
                salary_min: parsed.salaryMin ?? null,
                salary_max: parsed.salaryMax ?? null,
                salary_currency: parsed.salaryCurrency,
                salary_period: parsed.salaryPeriod,
                salary_public: parsed.salaryPublic,
                apply_type: parsed.applyType,
                external_apply_url: parsed.externalApplyUrl || null,
                apply_email: parsed.applyEmail || null,
                application_questions: parsed.applicationQuestions ?? null,
                resume_required: parsed.resumeRequired,
                cover_letter_required: parsed.coverLetterRequired,
                welcomes_diaspora: parsed.welcomesDiaspora,
                visa_sponsorship: parsed.visaSponsorship,
                relocation_assistance: parsed.relocationAssistance,
                arabic_required: parsed.arabicRequired,
                arabic_preferred: parsed.arabicPreferred,
                status: "active",
                posted_by: userId,
            })
            .select("id")
            .single();

        if (error) return { success: false, error: error.message };

        revalidatePath("/jobs");

        return { success: true, jobId: job?.id, slug };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}
