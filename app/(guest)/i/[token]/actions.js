"use server";

import { revalidatePath } from "next/cache";
import { respondToGuestInvitation } from "@/lib/events/events";

export async function respondToInvitation(token, response, memberId = null) {
  await respondToGuestInvitation(token, { memberId, response });

  revalidatePath(`/i/${token}`);
  revalidatePath("/", "layout");
}
