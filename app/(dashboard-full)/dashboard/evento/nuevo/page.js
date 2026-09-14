import { redirect } from "next/navigation";
import EventOnboardingWizard from "@/components/events/onboarding/EventOnboardingWizard";
import { getCurrentUser } from "@/lib/firebase/session";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <EventOnboardingWizard useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"} />;
}