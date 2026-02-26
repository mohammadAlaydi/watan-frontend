import { z } from "zod";

// ─── Application Questions Schema ───

export const ApplicationQuestionSchema = z.object({
    id: z.string(),
    question: z.string(),
    required: z.boolean(),
    type: z.enum(["text", "textarea", "select", "boolean"]),
    options: z.array(z.string()).optional(),
});

// ─── Job Filters Schema ───

export const JobFiltersSchema = z.object({
    q: z.string().optional(),
    department: z.string().optional(),
    seniority: z.string().optional(),
    arrangement: z.string().optional(),
    country: z.string().optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    salaryCurrency: z.string().optional(),
    employmentType: z.string().optional(),
    visaSponsorship: z.boolean().optional(),
    relocationAssistance: z.boolean().optional(),
    arabicRequired: z.boolean().optional(),
    arabicPreferred: z.boolean().optional(),
    featured: z.boolean().optional(),
    postedWithin: z.enum(["24h", "week", "month", "any"]).optional(),
    sort: z
        .enum(["recent", "match", "salary_desc", "applications"])
        .optional()
        .default("recent"),
    page: z.number().int().positive().optional().default(1),
});

// ─── Application Submission Schema ───

export const ApplicationStep1Schema = z.object({
    fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must be under 100 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().max(30).optional().or(z.literal("")),
    resumeUrl: z.string().url("Invalid resume URL").optional().or(z.literal("")),
    linkedinUrl: z
        .string()
        .url("Invalid LinkedIn URL")
        .optional()
        .or(z.literal("")),
    portfolioUrl: z
        .string()
        .url("Invalid portfolio URL")
        .optional()
        .or(z.literal("")),
});

export const ApplicationStep2Schema = z.object({
    coverLetter: z
        .string()
        .max(2000, "Cover letter must be under 2000 characters")
        .optional()
        .or(z.literal("")),
    answers: z
        .array(
            z.object({
                questionId: z.string(),
                answer: z.string(),
            })
        )
        .optional(),
});

export const ApplicationSubmissionSchema = ApplicationStep1Schema.merge(
    ApplicationStep2Schema
).extend({
    agreedToTerms: z.literal(true, {
        message: "You must agree to the terms",
    }),
});

// ─── Job Post Schema ───

export const PostJobSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(150, "Title must be under 150 characters"),
    description: z
        .string()
        .min(50, "Description must be at least 50 characters")
        .max(10000),
    requirements: z.array(z.string()).optional(),
    responsibilities: z.array(z.string()).optional(),
    niceToHave: z.array(z.string()).optional(),
    department: z.string().optional(),
    seniority: z
        .enum([
            "junior",
            "mid",
            "senior",
            "lead",
            "manager",
            "director",
            "vp",
            "c-level",
        ])
        .optional(),
    employmentType: z
        .enum(["full-time", "part-time", "contract", "internship"])
        .optional(),
    workArrangement: z.enum(["remote", "hybrid", "on-site"]).optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    timezoneRequirement: z.string().optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    salaryCurrency: z.string().default("USD"),
    salaryPeriod: z.enum(["annual", "monthly", "hourly"]).default("annual"),
    salaryPublic: z.boolean().default(true),
    applyType: z.enum(["internal", "external", "email"]).default("internal"),
    externalApplyUrl: z.string().url().optional().or(z.literal("")),
    applyEmail: z.string().email().optional().or(z.literal("")),
    applicationQuestions: z.array(ApplicationQuestionSchema).optional(),
    resumeRequired: z.boolean().default(true),
    coverLetterRequired: z.boolean().default(false),
    welcomesDiaspora: z.boolean().default(true),
    visaSponsorship: z.boolean().default(false),
    relocationAssistance: z.boolean().default(false),
    arabicRequired: z.boolean().default(false),
    arabicPreferred: z.boolean().default(false),
});

// ─── Job Alert Schema ───

export const JobAlertSchema = z.object({
    name: z
        .string()
        .min(2, "Alert name must be at least 2 characters")
        .max(100),
    keywords: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
    seniority: z.array(z.string()).optional(),
    workArrangement: z.array(z.string()).optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    frequency: z.enum(["daily", "weekly", "instant"]).default("weekly"),
});

// ─── Inferred Types ───

export type ApplicationQuestion = z.infer<typeof ApplicationQuestionSchema>;
export type JobFilters = z.infer<typeof JobFiltersSchema>;
export type ApplicationStep1Data = z.infer<typeof ApplicationStep1Schema>;
export type ApplicationStep2Data = z.infer<typeof ApplicationStep2Schema>;
export type ApplicationSubmissionData = z.infer<
    typeof ApplicationSubmissionSchema
>;
export type PostJobData = z.infer<typeof PostJobSchema>;
export type JobAlertData = z.infer<typeof JobAlertSchema>;
