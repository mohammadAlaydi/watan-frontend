"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { STEP_LABELS } from "@/lib/onboarding/constants";

interface ProgressBarProps {
  currentStep: number;
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isUpcoming = step > currentStep;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              {/* Circle */}
              <div className="relative">
                {isCompleted && (
                  <motion.div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-olive"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}
                {isCurrent && (
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-olive ring-offset-2 ring-offset-cream">
                    <motion.div
                      className="h-3 w-3 rounded-full bg-olive"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  </div>
                )}
                {isUpcoming && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-white">
                    <span className="text-xs font-medium text-muted">
                      {step}
                    </span>
                  </div>
                )}
              </div>
              {/* Label */}
              <span
                className={`mt-1.5 text-[10px] font-medium ${
                  isCurrent
                    ? "text-olive"
                    : isCompleted
                    ? "text-charcoal"
                    : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 rounded-full sm:w-12 ${
                  step < currentStep ? "bg-olive" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
