"use client";

import { SAMPLE_REVIEWS } from "@/lib/constants";
import type { SampleReview } from "@/types";

function ReviewCard({ review }: { review: SampleReview }) {
  return (
    <div className="w-80 shrink-0 rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-watan)]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-olive-pale text-xs font-bold text-olive">
            {review.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-charcoal">
              {review.role}
            </p>
            <p className="text-xs text-muted">{review.location}</p>
          </div>
        </div>
        <span className="rounded-full bg-charcoal/5 px-2 py-0.5 text-[10px] font-medium text-muted">
          Anonymous
        </span>
      </div>

      {/* Stars */}
      <div className="mb-3 flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={
              i < review.rating ? "text-gold" : "text-charcoal/10"
            }
          >
            ★
          </span>
        ))}
      </div>

      {/* Review text */}
      <p className="mb-4 text-sm leading-relaxed text-charcoal-mid">
        {review.text}
      </p>

      {/* Company */}
      <div className="border-t border-border pt-3">
        <p className="text-xs font-semibold text-olive">{review.company}</p>
      </div>
    </div>
  );
}

export default function ReviewsMarquee() {
  // Duplicate reviews for seamless infinite scroll
  const allReviews = [...SAMPLE_REVIEWS, ...SAMPLE_REVIEWS];

  return (
    <section className="bg-cream py-24">
      <div className="mx-auto mb-12 max-w-7xl px-6 lg:px-12">
        <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-olive">
          <span className="inline-block h-px w-8 bg-gold" />
          Community Reviews
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
          Real experiences. Real professionals.
        </h2>
      </div>

      <div className="group -mx-6 overflow-hidden">
        {/* Row 1 */}
        <div className="flex gap-6 pb-6 animate-marquee">
          {allReviews.map((review, i) => (
            <ReviewCard key={`row1-${i}`} review={review} />
          ))}
        </div>

        {/* Row 2 — offset direction via animation-direction */}
        <div
          className="flex gap-6 animate-marquee"
          style={{ animationDirection: "reverse", animationDuration: "35s" }}
        >
          {allReviews.map((review, i) => (
            <ReviewCard key={`row2-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
