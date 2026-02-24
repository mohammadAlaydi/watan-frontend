"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StepCard from "./StepCard";
import OnboardingNav from "./OnboardingNav";
import { Step2Schema, type Step2Data } from "@/lib/onboarding/schema";
import { saveStep2 } from "@/lib/onboarding/actions";
import type { Profile } from "@/lib/onboarding/types";
import {
  INDUSTRIES,
  POPULAR_SKILLS,
  YEARS_OPTIONS,
} from "@/lib/onboarding/constants";
import { useState, useCallback } from "react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Step2BackgroundProps {
  defaultValues?: Partial<Profile>;
}

export default function Step2Background({
  defaultValues,
}: Step2BackgroundProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(Step2Schema),
    defaultValues: {
      current_role: defaultValues?.current_role ?? "",
      current_company: defaultValues?.current_company ?? "",
      years_experience:
        (defaultValues?.years_experience as Step2Data["years_experience"]) ??
        "0-1",
      industries: defaultValues?.industries ?? [],
      skills: defaultValues?.skills ?? [],
      bio: defaultValues?.bio ?? "",
      linkedin_url: defaultValues?.linkedin_url ?? "",
    },
  });

  const bio = watch("bio") ?? "";
  const skills = watch("skills");
  const selectedIndustries = watch("industries");

  const handleSkillInput = useCallback(
    (value: string) => {
      setSkillInput(value);
      if (value.length > 0) {
        const filtered = POPULAR_SKILLS.filter(
          (s) =>
            s.toLowerCase().includes(value.toLowerCase()) &&
            !skills.includes(s)
        );
        setSuggestions(filtered.slice(0, 5));
      } else {
        setSuggestions([]);
      }
    },
    [skills]
  );

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (trimmed && !skills.includes(trimmed) && skills.length < 10) {
        setValue("skills", [...skills, trimmed]);
      }
      setSkillInput("");
      setSuggestions([]);
    },
    [skills, setValue]
  );

  const removeSkill = useCallback(
    (skill: string) => {
      setValue(
        "skills",
        skills.filter((s) => s !== skill)
      );
    },
    [skills, setValue]
  );

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput);
    }
  };

  const toggleIndustry = useCallback(
    (industry: string) => {
      if (selectedIndustries.includes(industry)) {
        setValue(
          "industries",
          selectedIndustries.filter((i) => i !== industry)
        );
      } else if (selectedIndustries.length < 3) {
        setValue("industries", [...selectedIndustries, industry]);
      } else {
        toast.error("Maximum 3 industries");
      }
    },
    [selectedIndustries, setValue]
  );

  const onSubmit = async (data: Step2Data) => {
    setSaving(true);
    try {
      const result = await saveStep2(data);
      if (result.success) {
        router.push("/onboarding/step-3");
      } else {
        toast.error(result.error ?? "Failed to save.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepCard
      step={2}
      title="Your professional background"
      subtitle="Help us understand your experience so we can connect you with the right people and opportunities."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Current role */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Current role / job title
            </Label>
            <Input
              placeholder="Product Manager"
              className="mt-1.5 h-11 rounded-xl border-border bg-white text-sm"
              {...register("current_role")}
            />
          </motion.div>

          {/* Current company */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Current company
            </Label>
            <Input
              placeholder="Google, Freelance, Between roles..."
              className="mt-1.5 h-11 rounded-xl border-border bg-white text-sm"
              {...register("current_company")}
            />
          </motion.div>

          {/* Years of experience */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Years of experience <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="years_experience"
              control={control}
              render={({ field }) => (
                <div className="mt-2 flex flex-wrap gap-2">
                  {YEARS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => field.onChange(opt)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        field.value === opt
                          ? "bg-olive text-white"
                          : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                      }`}
                    >
                      {opt} yrs
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.years_experience && (
              <p className="mt-1 text-xs text-red-500">
                {errors.years_experience.message}
              </p>
            )}
          </motion.div>

          {/* Industries */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Industries <span className="text-red-500">*</span>
              <span className="ml-1 font-normal text-muted">
                (max 3)
              </span>
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleIndustry(ind)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedIndustries.includes(ind)
                      ? "bg-olive text-white"
                      : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
            {errors.industries && (
              <p className="mt-1 text-xs text-red-500">
                {errors.industries.message}
              </p>
            )}
          </motion.div>

          {/* Skills */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Key skills
              <span className="ml-1 font-normal text-muted">(max 10)</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                placeholder="Type a skill and press Enter"
                value={skillInput}
                onChange={(e) => handleSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className="h-11 rounded-xl border-border bg-white text-sm"
                disabled={skills.length >= 10}
              />
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-12 z-20 rounded-xl border border-border bg-white p-2 shadow-lg">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="block w-full rounded-lg px-3 py-1.5 text-left text-sm text-charcoal hover:bg-olive-subtle"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-lg bg-olive-pale px-2.5 py-1 text-xs font-medium text-olive"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-0.5 text-olive/60 hover:text-olive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.skills && (
              <p className="mt-1 text-xs text-red-500">
                {errors.skills.message}
              </p>
            )}
          </motion.div>

          {/* Bio */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Bio <span className="font-normal text-muted">(optional)</span>
            </Label>
            <Textarea
              placeholder="Tell the community a bit about your work and what you're passionate about..."
              rows={4}
              className="mt-1.5 rounded-xl border-border bg-white text-sm"
              {...register("bio")}
            />
            <div className="mt-1 flex justify-end">
              <span
                className={`text-xs font-medium ${
                  bio.length > 500 ? "text-red-500" : "text-olive"
                }`}
              >
                {bio.length}/500
              </span>
            </div>
          </motion.div>

          {/* LinkedIn */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              LinkedIn URL{" "}
              <span className="font-normal text-muted">(optional)</span>
            </Label>
            <div className="relative mt-1.5">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted" />
              <Input
                placeholder="linkedin.com/in/your-profile"
                className="h-11 rounded-xl border-border bg-white pl-10 text-sm"
                {...register("linkedin_url")}
              />
            </div>
            {errors.linkedin_url && (
              <p className="mt-1 text-xs text-red-500">
                {errors.linkedin_url.message}
              </p>
            )}
          </motion.div>
        </motion.div>

        <OnboardingNav
          step={2}
          isLoading={saving}
          onBack={() => router.push("/onboarding/step-1")}
        />
      </form>
    </StepCard>
  );
}
