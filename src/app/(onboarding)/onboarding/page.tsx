import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile, ensureProfile } from "@/lib/onboarding/actions";

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Ensure profile exists (handles missed webhooks)
  let profile = await getProfile(userId);
  if (!profile) {
    profile = await ensureProfile(userId);
  }

  if (profile.onboarding_completed) {
    redirect("/dashboard");
  }

  const step = profile.onboarding_step ?? 1;
  redirect(`/onboarding/step-${step}`);
}
