"use client";

import { motion } from "framer-motion";

interface StepCardProps {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function StepCard({
  step,
  title,
  subtitle,
  children,
}: StepCardProps) {
  return (
    <motion.div
      className="w-full rounded-2xl border border-border bg-white p-8 shadow-sm sm:p-12"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <p className="mb-2 text-xs font-medium text-muted">Step {step} of 5</p>
      <h2 className="mb-1 text-2xl font-bold text-charcoal">{title}</h2>
      <p className="mb-8 text-sm text-muted">{subtitle}</p>
      {children}
    </motion.div>
  );
}
