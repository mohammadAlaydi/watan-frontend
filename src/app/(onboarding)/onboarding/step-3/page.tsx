import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/onboarding/actions";
import Step3Location from "@/components/onboarding/Step3Location";

export default async function Step3Page() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile(userId);

  return (
    <Step3Location
      defaultValues={profile ?? undefined}
    />
  );
}
