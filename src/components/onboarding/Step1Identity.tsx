"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StepCard from "./StepCard";
import OnboardingNav from "./OnboardingNav";
import { Step1Schema, type Step1Data } from "@/lib/onboarding/schema";
import { saveStep1 } from "@/lib/onboarding/actions";
import type { Profile } from "@/lib/onboarding/types";
import { useState, useRef } from "react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Step1IdentityProps {
  defaultValues?: Partial<Profile>;
}

export default function Step1Identity({ defaultValues }: Step1IdentityProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.profile_photo_url ?? null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      full_name: defaultValues?.full_name ?? "",
      headline: defaultValues?.headline ?? "",
      profile_photo_url: defaultValues?.profile_photo_url ?? "",
    },
  });

  const headline = watch("headline") ?? "";

  const onSubmit = async (data: Step1Data) => {
    setSaving(true);
    try {
      const result = await saveStep1(data);
      if (result.success) {
        router.push("/onboarding/step-2");
      } else {
        toast.error(result.error ?? "Failed to save. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <StepCard
      step={1}
      title="Let's start with you"
      subtitle="Tell us who you are. This helps the community find and connect with you."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Photo upload */}
          <motion.div variants={fadeUp} className="flex flex-col items-center">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-olive/30 bg-olive-pale transition-colors hover:border-olive"
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-6 w-6 text-olive/60 transition-colors group-hover:text-olive" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <p className="mt-2 text-xs text-muted">
              Add a profile photo (optional)
            </p>
          </motion.div>

          {/* Full name */}
          <motion.div variants={fadeUp}>
            <Label htmlFor="full_name" className="text-sm font-medium text-charcoal">
              Full name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="Sara Al-Ahmad"
              className="mt-1.5 h-11 rounded-xl border-border bg-white text-sm focus:border-olive focus:ring-1 focus:ring-olive"
              aria-describedby={errors.full_name ? "name-error" : undefined}
              {...register("full_name")}
            />
            {errors.full_name && (
              <p id="name-error" className="mt-1 text-xs text-red-500">
                {errors.full_name.message}
              </p>
            )}
          </motion.div>

          {/* Headline */}
          <motion.div variants={fadeUp}>
            <Label htmlFor="headline" className="text-sm font-medium text-charcoal">
              Professional headline <span className="text-red-500">*</span>
            </Label>
            <Input
              id="headline"
              placeholder="Senior Product Designer at Google"
              className="mt-1.5 h-11 rounded-xl border-border bg-white text-sm focus:border-olive focus:ring-1 focus:ring-olive"
              aria-describedby={errors.headline ? "headline-error" : "headline-hint"}
              {...register("headline")}
            />
            <div className="mt-1 flex items-center justify-between">
              <p id="headline-hint" className="text-xs text-muted">
                This is the first thing people see on your profile
              </p>
              <span
                className={`text-xs font-medium ${
                  headline.length > 100 ? "text-red-500" : "text-olive"
                }`}
              >
                {headline.length}/100
              </span>
            </div>
            {errors.headline && (
              <p id="headline-error" className="mt-1 text-xs text-red-500">
                {errors.headline.message}
              </p>
            )}
          </motion.div>
        </motion.div>

        <OnboardingNav step={1} isLoading={saving} />
      </form>
    </StepCard>
  );
}
