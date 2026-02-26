export default function CompanyProfileLoading() {
    return (
        <div className="min-h-screen bg-cream pt-16">
            {/* Cover skeleton */}
            <div className="h-48 w-full animate-pulse bg-charcoal/10" />

            {/* Header skeleton */}
            <div className="border-b bg-white pb-6">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="flex items-start gap-4">
                        <div className="-mt-10 h-20 w-20 animate-pulse rounded-2xl border-4 border-white bg-olive-pale" />
                        <div className="mt-2 space-y-2">
                            <div className="h-8 w-56 animate-pulse rounded-lg bg-olive-pale" />
                            <div className="h-4 w-40 animate-pulse rounded-lg bg-olive-pale" />
                        </div>
                    </div>
                    <div className="mt-4 flex gap-4">
                        <div className="h-14 w-20 animate-pulse rounded-lg bg-olive-pale" />
                        <div className="space-y-1">
                            <div className="h-5 w-24 animate-pulse rounded bg-olive-pale" />
                            <div className="h-4 w-16 animate-pulse rounded bg-olive-pale" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav skeleton */}
            <div className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl gap-4 px-6 py-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-5 w-20 animate-pulse rounded bg-olive-pale"
                        />
                    ))}
                </div>
            </div>

            {/* Content skeleton */}
            <div className="mx-auto max-w-6xl px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7 space-y-4">
                        <div className="h-40 animate-pulse rounded-2xl bg-white border border-border" />
                        <div className="h-64 animate-pulse rounded-2xl bg-white border border-border" />
                    </div>
                    <div className="lg:col-span-5 space-y-4">
                        <div className="h-40 animate-pulse rounded-2xl bg-white border border-border" />
                        <div className="h-32 animate-pulse rounded-2xl bg-white border border-border" />
                    </div>
                </div>
            </div>
        </div>
    );
}
