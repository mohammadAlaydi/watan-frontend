"use server";

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import { AddCompanySchema } from "./schema";
import type { AddCompanyData } from "./schema";
import { slugify } from "@/lib/reviews/utils";
import { revalidatePath } from "next/cache";

interface ActionResult {
    success: boolean;
    error?: string;
    slug?: string;
}

async function getClerkUserId(): Promise<string> {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    return userId;
}

function supabase() {
    return createServerClient();
}

/** Add a new company to the directory */
export async function addCompany(
    data: AddCompanyData
): Promise<ActionResult> {
    try {
        await getClerkUserId();
        const parsed = AddCompanySchema.parse(data);

        let slug = slugify(parsed.name);

        // Ensure slug uniqueness
        const { data: existing } = await supabase()
            .from("companies")
            .select("slug")
            .eq("slug", slug)
            .single();

        if (existing) {
            slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
        }

        const { error } = await supabase().from("companies").insert({
            slug,
            name: parsed.name,
            industry: parsed.industry,
            website_url: parsed.website_url || null,
            description: parsed.description || null,
            headquarters: parsed.headquarters || null,
            company_size: parsed.company_size ?? null,
        });

        if (error) return { success: false, error: error.message };

        revalidatePath("/companies");

        return { success: true, slug };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}

/** Submit a standalone salary entry */
export async function submitSalary(
    companyId: string,
    data: {
        job_title: string;
        salary_amount: number;
        currency?: string;
        period?: string;
        location?: string;
        years_experience?: string;
    }
): Promise<ActionResult> {
    try {
        const userId = await getClerkUserId();

        const { error } = await supabase().from("salaries").insert({
            company_id: companyId,
            submitter_id: userId,
            job_title: data.job_title,
            salary_amount: data.salary_amount,
            currency: data.currency ?? "USD",
            period: data.period ?? "annual",
            location: data.location ?? null,
            years_experience: data.years_experience ?? null,
        });

        if (error) return { success: false, error: error.message };

        revalidatePath("/companies");
        return { success: true };
    } catch (err) {
        return { success: false, error: (err as Error).message };
    }
}
