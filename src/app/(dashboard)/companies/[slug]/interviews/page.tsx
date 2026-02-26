import { notFound } from "next/navigation";
import { getCompanyBySlug, getCompanyInterviews } from "@/lib/companies/queries";
import { CompanyInterviews } from "@/components/company-profile/CompanyInterviews";
import type { Metadata } from "next";

interface InterviewsPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: InterviewsPageProps): Promise<Metadata> {
    const { slug } = await params;
    const company = await getCompanyBySlug(slug);
    if (!company) return { title: "Not Found" };
    return {
        title: `Interviews at ${company.name} — Watan`,
        description: `Interview experiences at ${company.name} shared by Palestinian professionals.`,
    };
}

export default async function InterviewsPage({
    params,
}: InterviewsPageProps) {
    const { slug } = await params;
    const company = await getCompanyBySlug(slug);
    if (!company) notFound();

    const interviews = await getCompanyInterviews(company.id);

    return (
        <div className="min-h-screen bg-cream pt-24 pb-12">
            <CompanyInterviews
                interviews={interviews}
                companyName={company.name}
            />
        </div>
    );
}
