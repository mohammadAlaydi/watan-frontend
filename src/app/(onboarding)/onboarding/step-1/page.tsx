import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/onboarding/actions";
import Step1Identity from "@/components/onboarding/Step1Identity";

export default async function Step1Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);

  return (
    <Step1Identity
      defaultValues={profile ?? undefined}
    />
  );
}
