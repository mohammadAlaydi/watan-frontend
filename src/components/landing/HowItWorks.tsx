"use client";

import { motion } from "framer-motion";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <section className="bg-cream px-6 py-24 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="mb-16">
          <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-olive">
            <span className="inline-block h-px w-8 bg-gold" />
            How it works
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
            Built for the Palestinian professional experience
          </h2>
          <p className="max-w-xl text-muted">
            Three simple steps to connect with your community, discover
            opportunities, and grow your career on your terms.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-olive/25 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              {/* Top gradient border on hover */}
              <div className="absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 bg-gradient-to-r from-olive to-gold transition-transform duration-300 group-hover:scale-x-100" />

              <p className="mb-5 font-mono text-xs tracking-widest text-muted">
                {step.step}
              </p>

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-olive-pale text-xl">
                {step.icon}
              </div>

              <h3 className="mb-2 text-lg font-bold text-charcoal">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
