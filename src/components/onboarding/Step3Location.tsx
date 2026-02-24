"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import StepCard from "./StepCard";
import OnboardingNav from "./OnboardingNav";
import { Step3Schema, type Step3Data } from "@/lib/onboarding/schema";
import { saveStep3 } from "@/lib/onboarding/actions";
import type { Profile } from "@/lib/onboarding/types";
import {
  COUNTRIES,
  LANGUAGES,
  RELOCATION_REGIONS,
} from "@/lib/onboarding/constants";
import { useState, useCallback, useMemo } from "react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Step3LocationProps {
  defaultValues?: Partial<Profile>;
}

export default function Step3Location({ defaultValues }: Step3LocationProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(Step3Schema),
    defaultValues: {
      country: defaultValues?.country ?? "",
      city: defaultValues?.city ?? "",
      languages: defaultValues?.languages ?? ["Arabic"],
      open_to_relocate: false,
      relocation_regions: [],
    },
  });

  const selectedCountry = watch("country");
  const selectedLanguages = watch("languages");
  const openToRelocate = watch("open_to_relocate");
  const relocationRegions = watch("relocation_regions") ?? [];

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const toggleLanguage = useCallback(
    (lang: string) => {
      if (selectedLanguages.includes(lang)) {
        if (selectedLanguages.length > 1) {
          setValue(
            "languages",
            selectedLanguages.filter((l) => l !== lang)
          );
        }
      } else {
        setValue("languages", [...selectedLanguages, lang]);
      }
    },
    [selectedLanguages, setValue]
  );

  const toggleRegion = useCallback(
    (region: string) => {
      if (relocationRegions.includes(region)) {
        setValue(
          "relocation_regions",
          relocationRegions.filter((r) => r !== region)
        );
      } else {
        setValue("relocation_regions", [...relocationRegions, region]);
      }
    },
    [relocationRegions, setValue]
  );

  const selectCountry = useCallback(
    (name: string) => {
      setValue("country", name);
      setCountrySearch("");
      setShowDropdown(false);
    },
    [setValue]
  );

  const onSubmit = async (data: Step3Data) => {
    setSaving(true);
    try {
      const result = await saveStep3(data);
      if (result.success) {
        router.push("/onboarding/step-4");
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
      step={3}
      title="Where are you based?"
      subtitle="This helps us connect you with nearby professionals and relevant job opportunities."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Country */}
          <motion.div variants={fadeUp} className="relative">
            <Label className="text-sm font-medium text-charcoal">
              Country <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1.5">
              <Input
                placeholder="Search countries..."
                value={selectedCountry || countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  if (selectedCountry) setValue("country", "");
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="h-11 rounded-xl border-border bg-white text-sm"
              />
              {showDropdown && filteredCountries.length > 0 && (
                <div className="absolute left-0 right-0 top-12 z-30 max-h-52 overflow-auto rounded-xl border border-border bg-white p-1 shadow-lg">
                  {filteredCountries.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onMouseDown={() => selectCountry(c.name)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-charcoal hover:bg-olive-subtle"
                    >
                      <span>{c.flag}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.country && (
              <p className="mt-1 text-xs text-red-500">
                {errors.country.message}
              </p>
            )}
          </motion.div>

          {/* City */}
          {selectedCountry && (
            <motion.div variants={fadeUp}>
              <Label className="text-sm font-medium text-charcoal">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Dubai"
                className="mt-1.5 h-11 rounded-xl border-border bg-white text-sm"
                {...register("city")}
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.city.message}
                </p>
              )}
            </motion.div>
          )}

          {/* Languages */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Languages spoken <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedLanguages.includes(lang)
                      ? "bg-olive text-white"
                      : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            {errors.languages && (
              <p className="mt-1 text-xs text-red-500">
                {errors.languages.message}
              </p>
            )}
          </motion.div>

          {/* Relocate toggle */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-charcoal">
                Are you open to relocating?
              </Label>
              <Controller
                name="open_to_relocate"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {openToRelocate && (
              <motion.div
                className="mt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <p className="mb-2 text-xs text-muted">Which regions?</p>
                <div className="flex flex-wrap gap-2">
                  {RELOCATION_REGIONS.map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        relocationRegions.includes(region)
                          ? "bg-olive text-white"
                          : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <OnboardingNav
          step={3}
          isLoading={saving}
          onBack={() => router.push("/onboarding/step-2")}
        />
      </form>
    </StepCard>
  );
}
