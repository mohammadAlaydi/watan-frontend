// ─── User / Professional ───

export interface User {
    id: string;
    clerkId: string;
    email: string;
    firstName: string;
    lastName: string;
    headline: string;
    bio: string;
    location: string;
    country: string;
    skills: string[];
    profileImage: string;
    isVerified: boolean;
    isAnonymous: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── Company ───

export interface Company {
    id: string;
    name: string;
    slug: string;
    description: string;
    industry: string;
    size: CompanySize;
    location: string;
    logo: string;
    website: string;
    isVerified: boolean;
    averageRating: number;
    reviewCount: number;
    createdAt: string;
    updatedAt: string;
}

export type CompanySize =
    | "1-10"
    | "11-50"
    | "51-200"
    | "201-500"
    | "501-1000"
    | "1000+";

// ─── Review ───

export interface Review {
    id: string;
    rating: number;
    title: string;
    content: string;
    pros: string;
    cons: string;
    isAnonymous: boolean;
    authorId: string;
    authorName: string;
    authorRole: string;
    authorLocation: string;
    companyId: string;
    companyName: string;
    status: ReviewStatus;
    createdAt: string;
    updatedAt: string;
}

export type ReviewStatus = "published" | "pending" | "flagged";

// ─── Job ───

export interface Job {
    id: string;
    title: string;
    description: string;
    type: JobType;
    location: string;
    isRemote: boolean;
    salaryMin: number;
    salaryMax: number;
    currency: string;
    requirements: string[];
    companyId: string;
    companyName: string;
    companyLogo: string;
    postedById: string;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
}

export type JobType =
    | "full-time"
    | "part-time"
    | "contract"
    | "freelance"
    | "remote"
    | "internship";

export type JobStatus = "active" | "closed" | "draft";

// ─── Salary ───

export interface Salary {
    id: string;
    role: string;
    companyId: string;
    companyName: string;
    location: string;
    yearsExperience: number;
    baseSalary: number;
    totalCompensation: number;
    currency: string;
    isAnonymous: boolean;
    createdAt: string;
}

// ─── UI Types ───

export interface NavLink {
    label: string;
    href: string;
}

export interface Stat {
    value: number;
    suffix: string;
    label: string;
}

export interface HowItWorksStep {
    step: string;
    icon: string;
    title: string;
    description: string;
}

export interface Feature {
    icon: string;
    title: string;
    description: string;
    variant: "green" | "gold" | "dark";
    fullWidth?: boolean;
}

export interface SampleReview {
    initials: string;
    name: string;
    role: string;
    location: string;
    rating: number;
    text: string;
    company: string;
}
