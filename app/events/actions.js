"use server";

import { revalidatePath } from "next/cache";
import { createRsvp } from "@/lib/rsvps/rsvps";

export async function confirmAttendance(eventId, formData) {
  const name = String(formData.get("name") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const guests = parseInt(String(formData.get("guests") || ""), 10);

  if (!name) throw new Error("El nombre es obligatorio.");

  await createRsvp(eventId, {
    name,
    guests: Number.isFinite(guests) && guests > 1 ? guests : 1,
    message,
  });

  revalidatePath(`/events/${eventId}/invitacion`);
}
