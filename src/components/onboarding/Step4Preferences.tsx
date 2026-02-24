"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import StepCard from "./StepCard";
import OnboardingNav from "./OnboardingNav";
import { Step4Schema, type Step4Data } from "@/lib/onboarding/schema";
import { saveStep4 } from "@/lib/onboarding/actions";
import type { Profile } from "@/lib/onboarding/types";
import {
  JOB_SEEKING_OPTIONS,
  JOB_TYPES,
  WORK_ARRANGEMENTS,
  CURRENCIES,
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

interface Step4PreferencesProps {
  defaultValues?: Partial<Profile>;
}

export default function Step4Preferences({
  defaultValues,
}: Step4PreferencesProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step4Data>({
    resolver: zodResolver(Step4Schema),
    defaultValues: {
      job_seeking_status:
        (defaultValues?.job_seeking_status as Step4Data["job_seeking_status"]) ??
        "open",
      preferred_roles: defaultValues?.preferred_roles ?? [],
      work_arrangement: defaultValues?.work_arrangement ?? [],
      salary_min: defaultValues?.salary_expectation_min ?? undefined,
      salary_max: defaultValues?.salary_expectation_max ?? undefined,
      salary_currency: defaultValues?.salary_currency ?? "USD",
      preferred_locations: defaultValues?.preferred_locations ?? [],
    },
  });

  const selectedRoles = watch("preferred_roles");
  const workArr = watch("work_arrangement");
  const locations = watch("preferred_locations");
  const currency = watch("salary_currency");

  const toggleRole = useCallback(
    (role: string) => {
      if (selectedRoles.includes(role)) {
        setValue("preferred_roles", selectedRoles.filter((r) => r !== role));
      } else {
        setValue("preferred_roles", [...selectedRoles, role]);
      }
    },
    [selectedRoles, setValue]
  );

  const toggleWork = useCallback(
    (arr: string) => {
      if (workArr.includes(arr)) {
        if (workArr.length > 1) {
          setValue("work_arrangement", workArr.filter((w) => w !== arr));
        }
      } else {
        setValue("work_arrangement", [...workArr, arr]);
      }
    },
    [workArr, setValue]
  );

  const addLocation = useCallback(
    (loc: string) => {
      const trimmed = loc.trim();
      if (trimmed && !locations.includes(trimmed)) {
        setValue("preferred_locations", [...locations, trimmed]);
      }
      setLocationInput("");
    },
    [locations, setValue]
  );

  const removeLocation = useCallback(
    (loc: string) => {
      setValue("preferred_locations", locations.filter((l) => l !== loc));
    },
    [locations, setValue]
  );

  const handleRemoteOnly = useCallback(
    (checked: boolean) => {
      setRemoteOnly(checked);
      if (checked) {
        setValue("preferred_locations", ["Remote"]);
      } else {
        setValue("preferred_locations", []);
      }
    },
    [setValue]
  );

  const onSubmit = async (data: Step4Data) => {
    setSaving(true);
    try {
      const result = await saveStep4(data);
      if (result.success) {
        router.push("/onboarding/step-5");
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
      step={4}
      title="What are you looking for?"
      subtitle="This helps us match you with the right opportunities. You can always change this later."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <motion.div
          className="space-y-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Job seeking status */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Job seeking status <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="job_seeking_status"
              control={control}
              render={({ field }) => (
                <div className="mt-2 space-y-3">
                  {JOB_SEEKING_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={`flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                        field.value === opt.value
                          ? "border-olive bg-olive-subtle"
                          : "border-border bg-white hover:border-olive/40"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="font-semibold text-charcoal">
                          {opt.title}
                        </p>
                        <p className="text-xs text-muted">{opt.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            />
          </motion.div>

          {/* Preferred job types */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Preferred job types
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleRole(type)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedRoles.includes(type)
                      ? "bg-olive text-white"
                      : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Work arrangement */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Work arrangement <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {WORK_ARRANGEMENTS.map((arr) => (
                <button
                  key={arr}
                  type="button"
                  onClick={() => toggleWork(arr)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    workArr.includes(arr)
                      ? "bg-olive text-white"
                      : "border border-border bg-white text-charcoal hover:bg-olive-subtle"
                  }`}
                >
                  {arr}
                </button>
              ))}
            </div>
            {errors.work_arrangement && (
              <p className="mt-1 text-xs text-red-500">
                {errors.work_arrangement.message}
              </p>
            )}
          </motion.div>

          {/* Salary expectations */}
          <motion.div variants={fadeUp}>
            <Label className="text-sm font-medium text-charcoal">
              Salary expectations{" "}
              <span className="font-normal text-muted">(optional)</span>
            </Label>
            <div className="mt-2 flex items-center gap-3">
              <Controller
                name="salary_currency"
                control={control}
                render={({ field }) => (
                  <select
                    value={field.value ?? "USD"}
                    onChange={field.onChange}
                    className="h-11 rounded-xl border border-border bg-white px-3 text-sm text-charcoal"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              />
              <Controller
                name="salary_min"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-11 rounded-xl border-border bg-white text-sm"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
              <span className="text-muted">—</span>
              <Controller
                name="salary_max"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-11 rounded-xl border-border bg-white text-sm"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>
            <div className="mt-1 flex items-center gap-1">
              <Lock className="h-3 w-3 text-muted" />
              <p className="text-xs text-muted">
                This is never shown publicly. Used only for job matching.
              </p>
            </div>
          </motion.div>

          {/* Preferred locations */}
          <motion.div variants={fadeUp}>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-charcoal">
                Preferred locations
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Remote only</span>
                <Switch
                  checked={remoteOnly}
                  onCheckedChange={handleRemoteOnly}
                />
              </div>
            </div>
            {!remoteOnly && (
              <>
                <Input
                  placeholder="Type a country or city and press Enter"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && locationInput.trim()) {
                      e.preventDefault();
                      addLocation(locationInput);
                    }
                  }}
                  className="mt-1.5 h-11 rounded-xl border-border bg-white text-sm"
                />
                {locations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {locations.map((loc) => (
                      <span
                        key={loc}
                        className="inline-flex items-center gap-1 rounded-lg bg-olive-pale px-2.5 py-1 text-xs font-medium text-olive"
                      >
                        {loc}
                        <button
                          type="button"
                          onClick={() => removeLocation(loc)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>

        <OnboardingNav
          step={4}
          isLoading={saving}
          onBack={() => router.push("/onboarding/step-3")}
        />
      </form>
    </StepCard>
  );
}
