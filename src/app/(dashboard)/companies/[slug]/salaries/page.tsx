import { notFound } from "next/navigation";
import { getCompanyBySlug, getCompanySalaries } from "@/lib/companies/queries";
import { CompanySalaries } from "@/components/company-profile/CompanySalaries";
import type { Metadata } from "next";

interface SalariesPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({
    params,
}: SalariesPageProps): Promise<Metadata> {
    const { slug } = await params;
    const company = await getCompanyBySlug(slug);
    if (!company) return { title: "Not Found" };
    return {
        title: `Salaries at ${company.name} — Watan`,
        description: `Anonymous salary data for ${company.name} from Palestinian professionals.`,
    };
}

export default async function SalariesPage({ params }: SalariesPageProps) {
    const { slug } = await params;
    const company = await getCompanyBySlug(slug);
    if (!company) notFound();

    const salaries = await getCompanySalaries(company.id);

    return (
        <div className="min-h-screen bg-cream pt-24 pb-12">
            <CompanySalaries salaries={salaries} companyName={company.name} />
        </div>
    );
}
