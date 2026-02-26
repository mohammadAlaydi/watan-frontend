import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCompanyBySlug } from "@/lib/companies/queries";
import { getCompanySalaries, getCompanyInterviews } from "@/lib/companies/queries";
import {
    getCompanyReviews,
    getUserVotedReviews,
    hasUserReviewedCompany,
} from "@/lib/reviews/queries";
import { CompanyHeader } from "@/components/company-profile/CompanyHeader";
import { CompanyNav } from "@/components/company-profile/CompanyNav";
import { CompanyOverview } from "@/components/company-profile/CompanyOverview";
import { CompanyReviewsList } from "@/components/company-profile/CompanyReviewsList";
import { CompanySalaries } from "@/components/company-profile/CompanySalaries";
import { CompanyInterviews } from "@/components/company-profile/CompanyInterviews";
import { CompanyJobs } from "@/components/company-profile/CompanyJobs";
import type { Metadata } from "next";

interface CompanyProfilePageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({
    params,
}: CompanyProfilePageProps): Promise<Metadata> {
    const { slug } = await params;
    const company = await getCompanyBySlug(slug);
    if (!company) return { title: "Company Not Found — Watan" };

    return {
        title: `${company.name} Reviews — Watan`,
        description: `Read ${company.total_reviews} anonymous reviews of ${company.name}. Salary data, interview experiences, and ratings from Palestinian professionals.`,
        openGraph: {
            title: `${company.name} — Watan`,
            description: `${company.total_reviews} reviews · ${Number(company.avg_overall_rating).toFixed(1)} rating`,
        },
    };
}

export default async function CompanyProfilePage({
    params,
    searchParams,
}: CompanyProfilePageProps) {
    const { slug } = await params;
    const { tab = "overview" } = await searchParams;

    const company = await getCompanyBySlug(slug);
    if (!company) notFound();

    // Parallel fetches
    const [reviewsResult, salaries, interviews] = await Promise.all([
        getCompanyReviews(company.id, {
            sort: "recent",
            status: "all",
            page: 1,
            limit: 20,
        }),
        getCompanySalaries(company.id),
        getCompanyInterviews(company.id),
    ]);

    // Auth-dependent fetches
    let hasReviewed = false;
    let votedReviewIds: string[] = [];

    try {
        const { userId } = await auth();
        if (userId) {
            const [reviewed, voted] = await Promise.all([
                hasUserReviewedCompany(userId, company.id),
                getUserVotedReviews(userId),
            ]);
            hasReviewed = reviewed;
            votedReviewIds = voted;
        }
    } catch {
        // Not authenticated — that's fine for public pages
    }

    return (
        <div className="min-h-screen bg-cream pt-16">
            <CompanyHeader company={company} hasReviewed={hasReviewed} />
            <CompanyNav
                slug={company.slug}
                reviewCount={company.total_reviews}
            />

            {/* Tab content */}
            {tab === "overview" && (
                <CompanyOverview
                    company={company}
                    latestReviews={reviewsResult.reviews}
                    salaries={salaries}
                    hasReviewed={hasReviewed}
                    votedReviewIds={votedReviewIds}
                />
            )}

            {tab === "reviews" && (
                <CompanyReviewsList
                    reviews={reviewsResult.reviews}
                    total={reviewsResult.total}
                    votedReviewIds={votedReviewIds}
                    companySlug={company.slug}
                />
            )}

            {tab === "salaries" && (
                <CompanySalaries
                    salaries={salaries}
                    companyName={company.name}
                />
            )}

            {tab === "interviews" && (
                <CompanyInterviews
                    interviews={interviews}
                    companyName={company.name}
                />
            )}

            {tab === "jobs" && (
                <CompanyJobs companyName={company.name} />
            )}
        </div>
    );
}
