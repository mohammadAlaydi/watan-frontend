import { z } from "zod";

/** Schema for adding a new company */
export const AddCompanySchema = z.object({
    name: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name must be under 100 characters"),
    industry: z.string().min(1, "Select an industry"),
    website_url: z
        .string()
        .url("Must be a valid URL")
        .optional()
        .or(z.literal("")),
    description: z
        .string()
        .max(2000, "Description must be under 2000 characters")
        .optional()
        .or(z.literal("")),
    headquarters: z
        .string()
        .max(100)
        .optional()
        .or(z.literal("")),
    company_size: z
        .enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"])
        .optional(),
});

export type AddCompanyData = z.infer<typeof AddCompanySchema>;
