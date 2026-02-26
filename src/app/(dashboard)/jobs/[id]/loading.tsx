export default function JobDetailLoading() {
    return (
        <div className="min-h-screen bg-cream px-6 pt-24 lg:px-12">
            <div className="mx-auto max-w-3xl">
                {/* Back button skeleton */}
                <div className="mb-4 h-9 w-20 animate-pulse rounded-lg bg-olive-pale/30" />

                {/* Header skeleton */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-olive-pale/30" />
                    <div>
                        <div className="mb-1 h-3 w-20 animate-pulse rounded bg-olive-pale/30" />
                        <div className="h-6 w-48 animate-pulse rounded bg-olive-pale/30" />
                    </div>
                </div>

                {/* Detail cards skeleton */}
                <div className="space-y-4">
                    <div className="h-48 animate-pulse rounded-2xl border bg-olive-pale/10" />
                    <div className="h-64 animate-pulse rounded-2xl border bg-olive-pale/10" />
                    <div className="h-40 animate-pulse rounded-2xl border bg-olive-pale/10" />
                    <div className="h-40 animate-pulse rounded-2xl border bg-olive-pale/10" />
                </div>
            </div>
        </div>
    );
}
