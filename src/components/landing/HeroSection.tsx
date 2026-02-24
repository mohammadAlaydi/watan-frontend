"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import VerifiedBadge from "@/components/shared/VerifiedBadge";
import { AVATAR_INITIALS, AVATAR_COLORS } from "@/lib/constants";
import Link from "next/link";

const SKILL_TAGS = [
  { label: "React", variant: "default" as const },
  { label: "TypeScript", variant: "default" as const },
  { label: "Node.js", variant: "default" as const },
  { label: "Open to Work", variant: "gold" as const },
];

const MINI_STATS = [
  { emoji: "💼", value: "340+", label: "Jobs this week" },
  { emoji: "⭐", value: "1.2k", label: "Reviews" },
  { emoji: "🌍", value: "48", label: "Countries" },
  { emoji: "🔒", value: "100%", label: "Anonymous" },
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-olive/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gold/[0.04] blur-[100px]" />
        <div className="hero-grid absolute right-0 top-0 h-full w-1/2 opacity-100" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 py-24 lg:flex-row lg:items-center lg:gap-20">
        {/* ─── Left Column ─── */}
        <motion.div
          className="flex-[3] space-y-8"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-olive/20 bg-olive-pale px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className="text-sm font-medium text-olive">
              Now open for early access
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-charcoal sm:text-6xl lg:text-[68px]">
            Your professional{" "}
            <span className="relative inline-block text-olive">
              home
              <motion.span
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gold"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </span>
            , worldwide.
          </h1>

          {/* Subtitle */}
          <p className="max-w-lg text-lg leading-relaxed text-muted">
            Watan connects Palestinian professionals across the globe — find
            opportunities, share experiences, and build a career in a community
            that understands you.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Button
              asChild
              className="rounded-xl bg-olive px-6 py-3 text-[15px] font-semibold text-white shadow-none transition-all hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-lg"
            >
              <Link href="/sign-up">Create your profile →</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="rounded-xl border-border px-6 py-3 text-[15px] font-semibold text-charcoal transition-all hover:bg-olive-subtle"
            >
              <Link href="/companies">Explore companies</Link>
            </Button>
          </div>

          {/* Social proof row */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {AVATAR_INITIALS.map((initials, i) => (
                <div
                  key={initials}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-cream text-xs font-bold text-charcoal-mid ${AVATAR_COLORS[i]}`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted">
              <span className="font-bold text-charcoal">2,400+</span>{" "}
              professionals already on the waitlist
            </p>
          </div>
        </motion.div>

        {/* ─── Right Column ─── */}
        <motion.div
          className="hidden flex-[2] flex-col gap-5 lg:flex"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Profile Preview Card */}
          <div className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-watan-lg)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-olive-pale text-sm font-bold text-olive">
                  DA
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal">
                    Dana Al-Rashid
                  </p>
                  <p className="text-xs text-muted">
                    Senior Engineer · Berlin, DE
                  </p>
                </div>
              </div>
              <VerifiedBadge />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {SKILL_TAGS.map((tag) => (
                <span
                  key={tag.label}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    tag.variant === "gold"
                      ? "bg-gold/15 text-gold"
                      : "bg-olive-subtle text-olive"
                  }`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          {/* Mini stat cards */}
          <div className="grid grid-cols-2 gap-3">
            {MINI_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-white p-4 shadow-[var(--shadow-watan)]"
              >
                <span className="mb-2 inline-flex items-center justify-center rounded-lg bg-olive-pale px-2 py-1 text-base">
                  {stat.emoji}
                </span>
                <p className="text-xl font-extrabold tracking-tight text-charcoal">
                  {stat.value}
                </p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
