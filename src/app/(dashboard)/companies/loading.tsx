export default function CompaniesLoading() {
    return (
        <div className="min-h-screen bg-cream px-6 pt-24 pb-12 lg:px-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <div className="h-8 w-48 animate-pulse rounded-lg bg-olive-pale" />
                    <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-olive-pale" />
                </div>

                <div className="flex gap-6">
                    <aside className="hidden w-72 shrink-0 lg:block">
                        <div className="h-96 animate-pulse rounded-2xl bg-white border border-border" />
                    </aside>

                    <main className="min-w-0 flex-1">
                        <div className="h-12 w-full animate-pulse rounded-xl bg-white border border-border" />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-52 animate-pulse rounded-2xl bg-white border border-border"
                                />
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
