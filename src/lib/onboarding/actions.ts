"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import {
    Step1Schema,
    Step2Schema,
    Step3Schema,
    Step4Schema,
    Step5Schema,
    type Step1Data,
    type Step2Data,
    type Step3Data,
    type Step4Data,
    type Step5Data,
} from "./schema";
import type {
    ActionResult,
    Profile,
} from "./types";

async function getClerkUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

function supabase() {
    return createServerClient();
}

export async function getProfile(
    clerkUserId: string
): Promise<Profile | null> {
    const { data } = await supabase()
        .from("profiles")
        .select("*")
        .eq("clerk_user_id", clerkUserId)
        .single();
    return data as Profile | null;
}

export async function ensureProfile(
    clerkUserId: string
): Promise<Profile> {
    const existing = await getProfile(clerkUserId);
    if (existing) return existing;

    const { data, error } = await supabase()
        .from("profiles")
        .upsert(
            { clerk_user_id: clerkUserId, onboarding_step: 1 },
            { onConflict: "clerk_user_id" }
        )
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as Profile;
}

export async function saveStep1(input: Step1Data): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = Step1Schema.parse(input);

        const { error } = await supabase()
            .from("profiles")
            .upsert(
                {
                    clerk_user_id: userId,
                    full_name: parsed.full_name,
                    headline: parsed.headline,
                    profile_photo_url: parsed.profile_photo_url || null,
                    onboarding_step: 2,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_user_id" }
            );

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function saveStep2(input: Step2Data): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = Step2Schema.parse(input);

        const { error } = await supabase()
            .from("profiles")
            .upsert(
                {
                    clerk_user_id: userId,
                    current_role: parsed.current_role || null,
                    current_company: parsed.current_company || null,
                    years_experience: parsed.years_experience,
                    industries: parsed.industries,
                    skills: parsed.skills,
                    bio: parsed.bio || null,
                    linkedin_url: parsed.linkedin_url || null,
                    onboarding_step: 3,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_user_id" }
            );

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function saveStep3(input: Step3Data): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = Step3Schema.parse(input);

        const { error } = await supabase()
            .from("profiles")
            .upsert(
                {
                    clerk_user_id: userId,
                    country: parsed.country,
                    city: parsed.city,
                    languages: parsed.languages,
                    onboarding_step: 4,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_user_id" }
            );

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function saveStep4(input: Step4Data): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = Step4Schema.parse(input);

        const { error } = await supabase()
            .from("profiles")
            .upsert(
                {
                    clerk_user_id: userId,
                    job_seeking_status: parsed.job_seeking_status,
                    preferred_roles: parsed.preferred_roles,
                    work_arrangement: parsed.work_arrangement,
                    salary_expectation_min: parsed.salary_min ?? null,
                    salary_expectation_max: parsed.salary_max ?? null,
                    salary_currency: parsed.salary_currency || null,
                    preferred_locations: parsed.preferred_locations,
                    onboarding_step: 5,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_user_id" }
            );

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function saveStep5(input: Step5Data): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();
        const parsed = Step5Schema.parse(input);

        const { error } = await supabase()
            .from("profiles")
            .upsert(
                {
                    clerk_user_id: userId,
                    verification_method: parsed.verification_method,
                    verification_status:
                        parsed.verification_method === "skip"
                            ? "unverified"
                            : "pending",
                    linkedin_url:
                        parsed.verification_method === "linkedin"
                            ? parsed.linkedin_url || null
                            : undefined,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "clerk_user_id" }
            );

        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

export async function completeOnboarding(): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();

        const { error } = await supabase()
            .from("profiles")
            .update({
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
            })
            .eq("clerk_user_id", userId);

        if (error) return { success: false, error: error.message };

        // Update Clerk metadata
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: { onboardingComplete: true },
        });

        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}
