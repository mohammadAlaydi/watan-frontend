"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/lib/constants";

const iconBgMap = {
  green: "bg-olive-pale",
  gold: "bg-gold/15",
  dark: "bg-charcoal/10",
} as const;

export default function FeaturesGrid() {
  const regularFeatures = FEATURES.filter((f) => !f.fullWidth);
  const fullWidthFeature = FEATURES.find((f) => f.fullWidth);

  return (
    <section className="bg-olive-subtle px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16">
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-olive">
            <span className="inline-block h-px w-8 bg-gold" />
            Features
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </div>

        {/* 2x2 grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {regularFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group flex gap-5 rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-olive/20 hover:shadow-lg"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div
                className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl text-xl ${iconBgMap[feature.variant]}`}
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-charcoal">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full-width card */}
        {fullWidthFeature && (
          <motion.div
            className="mt-6 flex flex-col items-center gap-5 rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-olive/20 hover:shadow-lg sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-2xl ${iconBgMap[fullWidthFeature.variant]}`}
            >
              {fullWidthFeature.icon}
            </div>
            <div>
              <h3 className="mb-1 text-lg font-bold text-charcoal">
                {fullWidthFeature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {fullWidthFeature.description}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
