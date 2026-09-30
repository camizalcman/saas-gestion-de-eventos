"use server";

import { revalidatePath } from "next/cache";
import { submitGuestInvitation } from "@/lib/events/events";

export async function respondToInvitation(token, payload) {
  const eventId = await submitGuestInvitation(token, payload);

  revalidatePath(`/i/${token}`);
  revalidatePath("/dashboard/invitados");
  revalidatePath("/", "layout");

  return eventId;
}
