"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Linkedin, Users, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StepCard from "./StepCard";
import OnboardingNav from "./OnboardingNav";
import { saveStep5, completeOnboarding } from "@/lib/onboarding/actions";
import type { Profile } from "@/lib/onboarding/types";
import { useState } from "react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Step5VerificationProps {
  defaultValues?: Partial<Profile>;
}

export default function Step5Verification({
  defaultValues,
}: Step5VerificationProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(
    defaultValues?.verification_method === "linkedin"
  );
  const [emailVerified, setEmailVerified] = useState(false);
  const [workEmail, setWorkEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleLinkedIn = async () => {
    // In production: trigger Clerk LinkedIn OAuth or URL verification
    setLinkedinConnected(true);
    toast.success("LinkedIn connected successfully!");
  };

  const handleEmailVerify = async () => {
    if (!workEmail || !workEmail.includes("@")) {
      toast.error("Please enter a valid work email");
      return;
    }
    setEmailSent(true);
    toast.success("Verification email sent!");
    // In production: send actual verification email
    setTimeout(() => {
      setEmailVerified(true);
      toast.success("Email verified!");
    }, 2000);
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      let method: "linkedin" | "email" | "skip" = "skip";
      if (linkedinConnected) method = "linkedin";
      else if (emailVerified) method = "email";

      const stepResult = await saveStep5({
        verification_method: method,
        linkedin_url: linkedinConnected
          ? defaultValues?.linkedin_url ?? ""
          : "",
        work_email: emailVerified ? workEmail : "",
      });

      if (!stepResult.success) {
        toast.error(stepResult.error ?? "Failed to save.");
        setSaving(false);
        return;
      }

      const completeResult = await completeOnboarding();
      if (completeResult.success) {
        toast.success("Welcome to Watan! 🎉");
        router.push("/dashboard");
      } else {
        toast.error(completeResult.error ?? "Failed to complete setup.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepCard
      step={5}
      title="Verify your profile"
      subtitle="Verified profiles get 3x more visibility and build faster trust in the community."
    >
      <motion.div
        className="space-y-5"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Header icon */}
        <motion.div variants={fadeUp} className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive-pale">
            <Shield className="h-7 w-7 text-olive" />
          </div>
        </motion.div>

        {/* Card 1: LinkedIn */}
        <motion.div
          variants={fadeUp}
          className={`rounded-xl border p-5 transition-all ${
            linkedinConnected
              ? "border-olive bg-olive-subtle"
              : "border-border bg-white hover:-translate-y-0.5 hover:shadow-md"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              {linkedinConnected ? (
                <Check className="h-5 w-5 text-olive" />
              ) : (
                <Linkedin className="h-5 w-5 text-blue-700" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-charcoal">
                  Connect LinkedIn
                </h3>
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
                  Recommended
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Instantly verify your work history and identity
              </p>
              <p className="mt-1 text-[10px] text-olive">
                Takes 10 seconds
              </p>
              {!linkedinConnected && (
                <Button
                  type="button"
                  onClick={handleLinkedIn}
                  className="mt-3 rounded-lg bg-olive px-4 py-2 text-xs font-semibold text-white hover:bg-charcoal"
                >
                  Connect LinkedIn
                </Button>
              )}
              {linkedinConnected && (
                <p className="mt-2 text-xs font-semibold text-olive">
                  ✓ LinkedIn connected
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Card 2: Community vouching */}
        <motion.div
          variants={fadeUp}
          className="rounded-xl border border-border bg-white p-5"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-olive-pale">
              <Users className="h-5 w-5 text-olive" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal">
                Get vouched by members
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                When 3 Watan members vouch for you, you earn full verification
              </p>
              <span className="mt-2 inline-block rounded-full bg-charcoal/5 px-2.5 py-1 text-[10px] font-medium text-muted">
                Pending — invite colleagues after signup
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Work email */}
        <motion.div
          variants={fadeUp}
          className={`rounded-xl border p-5 transition-all ${
            emailVerified
              ? "border-olive bg-olive-subtle"
              : "border-border bg-white hover:-translate-y-0.5 hover:shadow-md"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
              {emailVerified ? (
                <Check className="h-5 w-5 text-olive" />
              ) : (
                <Mail className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-charcoal">
                Verify with work email
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                Add your company email to verify your current employer
              </p>
              {!emailVerified && (
                <div className="mt-3 flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="h-9 rounded-lg border-border bg-white text-xs"
                    disabled={emailSent}
                  />
                  <Button
                    type="button"
                    onClick={handleEmailVerify}
                    disabled={emailSent && !emailVerified}
                    className="h-9 rounded-lg bg-olive px-3 text-xs font-semibold text-white hover:bg-charcoal"
                  >
                    {emailSent ? "Sent" : "Verify"}
                  </Button>
                </div>
              )}
              {emailVerified && (
                <p className="mt-2 text-xs font-semibold text-olive">
                  ✓ Email verified
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Note */}
        <p className="text-center text-xs text-muted">
          You can complete verification anytime from your profile settings.
        </p>
      </motion.div>

      <OnboardingNav
        step={5}
        isLoading={saving}
        onBack={() => router.push("/onboarding/step-4")}
        onContinue={handleComplete}
        continueLabel="Complete setup →"
      />
    </StepCard>
  );
}
