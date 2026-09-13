"use server";

import { revalidatePath } from "next/cache";
import { createRsvp } from "@/lib/rsvps/rsvps";
import { integerInput, optionalText, requiredText } from "@/lib/validation";

export async function confirmAttendance(eventId, formData) {
  const name = requiredText(formData.get("name"), { label: "El nombre", max: 120 });
  const message = optionalText(formData.get("message"), { label: "El mensaje", max: 1000 });
  const guests = integerInput(formData.get("guests") || "1", {
    label: "La cantidad de personas",
    min: 1,
    max: 20,
  });

  await createRsvp(eventId, { name, guests, message });

  revalidatePath(`/events/${eventId}/invitacion`);
}
