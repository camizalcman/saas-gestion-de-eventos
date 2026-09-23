import { notFound } from "next/navigation";
import PublicInvitation from "@/components/invitation/PublicInvitation";
import { getPublishedEvent } from "@/lib/events/events";

export const dynamic = "force-dynamic";

export default async function PublicInvitationPage({ params }) {
  const { id } = await params;
  const event = await getPublishedEvent(id);
  if (!event) notFound();

  const invitation = event.invitation;
  if (!invitation) notFound();

  return <PublicInvitation event={event} />;
}
