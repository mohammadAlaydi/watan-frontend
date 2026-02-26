export default function JobsLoading() {
    return (
        <div className="min-h-screen bg-cream px-6 pt-24 lg:px-12">
            <div className="mx-auto max-w-7xl">
                {/* Header skeleton */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="mb-2 h-8 w-24 animate-pulse rounded bg-olive-pale/50" />
                        <div className="h-4 w-64 animate-pulse rounded bg-olive-pale/50" />
                    </div>
                    <div className="h-10 w-28 animate-pulse rounded-xl bg-olive-pale/50" />
                </div>

                {/* Split view skeleton */}
                <div
                    className="flex overflow-hidden rounded-2xl border bg-white"
                    style={{ height: "calc(100vh - 220px)" }}
                >
                    {/* Left panel */}
                    <div className="w-full border-r border-border md:w-[420px]">
                        {/* Search skeleton */}
                        <div className="border-b p-4">
                            <div className="mb-3 h-11 w-full animate-pulse rounded-xl bg-olive-pale/30" />
                            <div className="flex gap-2">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-7 w-20 animate-pulse rounded-full bg-olive-pale/30"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sort bar skeleton */}
                        <div className="flex items-center justify-between p-4">
                            <div className="h-4 w-24 animate-pulse rounded bg-olive-pale/30" />
                            <div className="h-8 w-32 animate-pulse rounded bg-olive-pale/30" />
                        </div>

                        {/* Cards skeleton */}
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse border-b border-border p-4">
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="h-9 w-9 rounded-lg bg-olive-pale/30" />
                                    <div className="h-4 w-24 rounded bg-olive-pale/30" />
                                </div>
                                <div className="mb-2 h-5 w-3/4 rounded bg-olive-pale/30" />
                                <div className="mb-2 flex gap-2">
                                    <div className="h-6 w-16 rounded-full bg-olive-pale/30" />
                                    <div className="h-6 w-20 rounded-full bg-olive-pale/30" />
                                </div>
                                <div className="h-4 w-1/2 rounded bg-olive-pale/30" />
                            </div>
                        ))}
                    </div>

                    {/* Right panel */}
                    <div className="hidden flex-1 p-6 md:block">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-xl bg-olive-pale/30" />
                            <div>
                                <div className="mb-1 h-3 w-20 animate-pulse rounded bg-olive-pale/30" />
                                <div className="h-6 w-48 animate-pulse rounded bg-olive-pale/30" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 animate-pulse rounded-2xl bg-olive-pale/20"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
