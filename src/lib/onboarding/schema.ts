import { z } from "zod";

export const Step1Schema = z.object({
    full_name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(80, "Name must be under 80 characters"),
    headline: z
        .string()
        .min(5, "Headline must be at least 5 characters")
        .max(100, "Headline must be under 100 characters"),
    profile_photo_url: z.string().url().optional().or(z.literal("")),
});

export const Step2Schema = z.object({
    current_role: z.string().max(100).optional().or(z.literal("")),
    current_company: z.string().max(100).optional().or(z.literal("")),
    years_experience: z.enum(["0-1", "1-3", "3-5", "5-10", "10+"]),
    industries: z
        .array(z.string())
        .min(1, "Select at least 1 industry")
        .max(3, "Maximum 3 industries"),
    skills: z.array(z.string()).max(10, "Maximum 10 skills"),
    bio: z.string().max(500).optional().or(z.literal("")),
    linkedin_url: z
        .string()
        .url("Must be a valid URL")
        .refine((val) => val.includes("linkedin.com/in/"), {
            message: "Must be a LinkedIn profile URL",
        })
        .optional()
        .or(z.literal("")),
});

export const Step3Schema = z.object({
    country: z.string().min(2, "Select a country"),
    city: z.string().min(2, "Enter your city").max(100),
    languages: z.array(z.string()).min(1, "Select at least 1 language"),
    open_to_relocate: z.boolean(),
    relocation_regions: z.array(z.string()).optional(),
});

export const Step4Schema = z.object({
    job_seeking_status: z.enum(["actively", "open", "not_looking"]),
    preferred_roles: z.array(z.string()),
    work_arrangement: z.array(z.string()).min(1, "Select at least 1"),
    salary_min: z.number().optional(),
    salary_max: z.number().optional(),
    salary_currency: z.string().optional(),
    preferred_locations: z.array(z.string()),
});

export const Step5Schema = z.object({
    verification_method: z.enum(["linkedin", "email", "skip"]),
    linkedin_url: z.string().url().optional().or(z.literal("")),
    work_email: z.string().email().optional().or(z.literal("")),
});

export type Step1Data = z.infer<typeof Step1Schema>;
export type Step2Data = z.infer<typeof Step2Schema>;
export type Step3Data = z.infer<typeof Step3Schema>;
export type Step4Data = z.infer<typeof Step4Schema>;
export type Step5Data = z.infer<typeof Step5Schema>;
