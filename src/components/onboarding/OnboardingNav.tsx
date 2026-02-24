"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface OnboardingNavProps {
  step: number;
  isLoading?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export default function OnboardingNav({
  step,
  isLoading = false,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
}: OnboardingNavProps) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4">
      {step > 1 ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="gap-2 text-muted hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      ) : (
        <div />
      )}
      <Button
        type={onContinue ? "button" : "submit"}
        onClick={onContinue}
        disabled={isLoading || continueDisabled}
        className={`gap-2 rounded-xl bg-olive px-6 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-lg ${
          step === 5 ? "w-full sm:w-auto" : ""
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {continueLabel}
            {step < 5 && <ArrowRight className="h-4 w-4" />}
          </>
        )}
      </Button>
    </div>
  );
}
