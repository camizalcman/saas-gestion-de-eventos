import { redirect } from "next/navigation";
import EventOnboardingWizard from "@/components/events/onboarding/EventOnboardingWizard";
import { getCurrentUser } from "@/lib/firebase/session";
import { listLocalEventImages } from "@/lib/events/localImages";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <EventOnboardingWizard availableImages={listLocalEventImages()} />;
}