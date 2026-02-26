import { Suspense } from "react";
import { getCompanies } from "@/lib/companies/queries";
import { CompanyDirectory } from "@/components/companies/CompanyDirectory";
import { CompanyFilters } from "@/components/companies/CompanyFilters";
import { CompanySearch } from "@/components/companies/CompanySearch";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Companies — Watan",
  description:
    "Find workplaces reviewed by Palestinian professionals worldwide.",
};

interface CompaniesPageProps {
  searchParams: Promise<{
    q?: string;
    industry?: string;
    size?: string;
    country?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const { companies, total } = await getCompanies({
    q: params.q,
    industry: params.industry,
    size: params.size,
    country: params.country,
    sort: params.sort,
    page,
    limit: 20,
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-cream px-6 pt-24 pb-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Companies</h1>
            <p className="mt-1 text-sm text-muted">
              Find workplaces reviewed by Palestinian professionals
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24">
              <Suspense>
                <CompanyFilters />
              </Suspense>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <Suspense>
              <CompanySearch />
            </Suspense>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted">
                Showing {total} compan{total !== 1 ? "ies" : "y"}
              </p>
            </div>

            <div className="mt-4">
              <CompanyDirectory
                companies={companies}
                total={total}
                currentPage={page}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <a
                    key={i + 1}
                    href={`/companies?${new URLSearchParams({
                      ...(params.q ? { q: params.q } : {}),
                      ...(params.industry ? { industry: params.industry } : {}),
                      ...(params.size ? { size: params.size } : {}),
                      ...(params.sort ? { sort: params.sort } : {}),
                      page: String(i + 1),
                    }).toString()}`}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${page === i + 1
                        ? "bg-olive text-white"
                        : "bg-white text-charcoal border border-border hover:bg-olive-subtle"
                      }`}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
