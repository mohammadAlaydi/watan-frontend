import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/onboarding/actions";
import Step5Verification from "@/components/onboarding/Step5Verification";

export default async function Step5Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);

  return (
    <Step5Verification
      defaultValues={profile ?? undefined}
    />
  );
}
