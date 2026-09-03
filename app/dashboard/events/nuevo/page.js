import { redirect } from "next/navigation";
import EventOnboardingWizard from "@/components/events/onboarding/EventOnboardingWizard";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  return <EventOnboardingWizard useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"} />;
}
