import { z } from "zod";

/** Step 1 — Role & employment context */
export const ReviewStep1Schema = z.object({
  job_title: z
    .string()
    .min(2, "Job title must be at least 2 characters")
    .max(100, "Job title must be under 100 characters"),
  employment_status: z.enum(["current", "former", "contractor"], {
    error: "Select your employment status",
  }),
  years_at_company: z.string().optional(),
  employment_start_year: z.number().int().min(1970).max(2030).optional(),
  employment_end_year: z.number().int().min(1970).max(2030).optional(),
  work_location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be under 100 characters"),
});

/** Step 2 — Ratings */
export const ReviewStep2Schema = z.object({
  overall_rating: z
    .number()
    .int()
    .min(1, "Overall rating is required")
    .max(5),
  culture_rating: z.number().int().min(1).max(5).optional(),
  management_rating: z.number().int().min(1).max(5).optional(),
  worklife_rating: z.number().int().min(1).max(5).optional(),
  compensation_rating: z.number().int().min(1).max(5).optional(),
  growth_rating: z.number().int().min(1).max(5).optional(),
  recommends_company: z.boolean().optional(),
});

/** Step 3 — Written review */
export const ReviewStep3Schema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must be under 100 characters"),
  pros: z
    .string()
    .min(100, "Pros must be at least 100 characters")
    .max(2000, "Pros must be under 2000 characters"),
  cons: z
    .string()
    .min(100, "Cons must be at least 100 characters")
    .max(2000, "Cons must be under 2000 characters"),
  advice_to_management: z
    .string()
    .max(1000, "Advice must be under 1000 characters")
    .optional()
    .or(z.literal("")),
});

/** Step 4 — Optional salary & interview data */
export const ReviewStep4Schema = z.object({
  salary_amount: z.number().positive().optional(),
  salary_currency: z.string().optional(),
  salary_period: z.enum(["annual", "monthly", "hourly"]).optional(),
  interview_difficulty: z
    .enum(["easy", "medium", "hard", "very_hard"])
    .optional(),
  interview_experience: z
    .enum(["positive", "negative", "neutral"])
    .optional(),
  interview_questions: z.array(z.string()).max(5).optional(),
  got_offer: z.boolean().optional(),
});

/** Full merged schema (used on final submit) */
export const FullReviewSchema = ReviewStep1Schema.merge(ReviewStep2Schema)
  .merge(ReviewStep3Schema)
  .merge(ReviewStep4Schema);

/** Report review schema */
export const ReviewFlagSchema = z.object({
  reason: z.enum(["fake", "offensive", "irrelevant", "private_info", "other"], {
    error: "Select a reason for reporting",
  }),
  description: z.string().max(500).optional().or(z.literal("")),
});

/** Salary submission schema */
export const SalarySubmissionSchema = z.object({
  job_title: z
    .string()
    .min(2, "Job title is required")
    .max(100),
  salary_amount: z.number().positive("Salary must be positive"),
  currency: z.string().default("USD"),
  period: z.enum(["annual", "monthly", "hourly"]).default("annual"),
  location: z.string().max(100).optional().or(z.literal("")),
  years_experience: z.string().optional(),
  employment_type: z.string().optional(),
});

// Inferred types
export type ReviewStep1Data = z.infer<typeof ReviewStep1Schema>;
export type ReviewStep2Data = z.infer<typeof ReviewStep2Schema>;
export type ReviewStep3Data = z.infer<typeof ReviewStep3Schema>;
export type ReviewStep4Data = z.infer<typeof ReviewStep4Schema>;
export type FullReviewData = z.infer<typeof FullReviewSchema>;
export type ReviewFlagData = z.infer<typeof ReviewFlagSchema>;
export type SalarySubmissionData = z.infer<typeof SalarySubmissionSchema>;
