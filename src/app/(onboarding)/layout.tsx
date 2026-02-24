"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Logo from "@/components/shared/Logo";
import ProgressBar from "@/components/onboarding/ProgressBar";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Extract current step from URL
  const stepMatch = pathname?.match(/step-(\d)/);
  const currentStep = stepMatch ? parseInt(stepMatch[1], 10) : 1;

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-cream/90 px-6 py-3 backdrop-blur-xl">
        <Link href="/">
          <Logo size="sm" />
        </Link>

        <div className="hidden sm:block">
          <ProgressBar currentStep={currentStep} />
        </div>

        {currentStep >= 3 && (
          <Button
            variant="ghost"
            asChild
            className="text-xs text-muted hover:text-charcoal"
          >
            <Link href="/dashboard">Skip for now</Link>
          </Button>
        )}
        {currentStep < 3 && <div className="w-20" />}
      </div>

      {/* Mobile progress */}
      <div className="flex justify-center border-b border-border px-4 py-3 sm:hidden">
        <ProgressBar currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
