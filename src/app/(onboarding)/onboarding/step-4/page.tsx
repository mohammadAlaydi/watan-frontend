import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/onboarding/actions";
import Step4Preferences from "@/components/onboarding/Step4Preferences";

export default async function Step4Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);

  return (
    <Step4Preferences
      defaultValues={profile ?? undefined}
    />
  );
}
