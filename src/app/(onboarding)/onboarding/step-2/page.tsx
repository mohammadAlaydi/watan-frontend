import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/onboarding/actions";
import Step2Background from "@/components/onboarding/Step2Background";

export default async function Step2Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);

  return (
    <Step2Background
      defaultValues={profile ?? undefined}
    />
  );
}
