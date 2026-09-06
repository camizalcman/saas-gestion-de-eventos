"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import { createUserEvent, deleteUserEvent, updateUserEvent, setUserEventInvitation } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";

function parseEventForm(formData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const imagePath = String(formData.get("imagePath") || "").trim();
  const eventType = String(formData.get("eventType") || "").trim();
  const customEventType = String(formData.get("customEventType") || "").trim();
  const protagonistsRaw = String(formData.get("protagonists") || "").trim();
  const protagonists = protagonistsRaw ? protagonistsRaw.split(",").map((p) => p.trim()).filter(Boolean) : [];

  if (!title) throw new Error("El titulo es obligatorio.");
  if (date && Number.isNaN(new Date(date).getTime())) throw new Error("La fecha no es valida.");

  return { title, description, date, location, published: formData.get("published") === "on", imageUrl, imagePath, eventType, customEventType, protagonists };
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

function parseInvitationForm(formData) {
  const value = (name) => String(formData.get(name) || "").trim();

  const heroImageUrl = value("heroImageUrl");
  const names = value("names");
  const message = value("message");
  const date = value("date");
  const time = value("time");
  const venue = value("venue");
  const dressCode = value("dressCode");

  if (!heroImageUrl) throw new Error("La foto de portada es obligatoria.");
  if (!names) throw new Error("Los nombres son obligatorios.");
  if (!message) throw new Error("El mensaje es obligatorio.");

  return {
    heroImageUrl,
    heroImagePath: value("heroImagePath"),
    names,
    message,
    personalText: value("personalText"),
    date,
    time,
    venue,
    mapUrl: value("mapUrl"),
    dressCode,
    gallery: [],
    giftEnabled: formData.get("giftEnabled") === "on",
    giftAlias: value("giftAlias"),
    closingText: value("closingText"),
    palette: value("palette") || "clasico",
    typography: value("typography") || "elegante",
  };
}

export async function saveInvitation(eventId, formData) {
  const user = await requireAdmin();
  await setUserEventInvitation(user.uid, eventId, parseInvitationForm(formData));
  revalidatePath(`/events/${eventId}/invitacion`);
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/dashboard/events");
  redirect(`/dashboard/events/${eventId}`);
}
