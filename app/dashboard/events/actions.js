"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { createUserEvent, deleteUserEvent, updateUserEvent } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";

function parseEventForm(formData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imagePath = String(formData.get("imagePath") || "").trim();

  if (!title || !date || !location) throw new Error("Titulo, fecha y ubicacion son obligatorios.");
  if (Number.isNaN(new Date(date).getTime())) throw new Error("La fecha no es valida.");

  return { title, description, date, location, published: formData.get("published") === "on", imageUrl, imagePath };
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  return user;
}

export async function createEvent(formData) {
  const user = await requireAdmin();
  await createUserEvent(user.uid, parseEventForm(formData));
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
}

export async function updateEvent(eventId, formData) {
  const user = await requireAdmin();
  await updateUserEvent(user.uid, eventId, parseEventForm(formData));
  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}

export async function deleteEvent(eventId) {
  const user = await requireAdmin();
  await deleteUserEvent(user.uid, eventId);
  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
}
