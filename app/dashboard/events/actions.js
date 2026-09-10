"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  addEventGuest,
  createUserEvent,
  deleteUserEvent,
  deriveGuestStatus,
  getUserEvent,
  removeEventGuest,
  removeEventGuestMember,
  setUserEventInvitation,
  updateEventGuestField,
  updateUserEvent,
} from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";
import { EVENT_TYPES } from "@/lib/events/constants";
import { INVITATION_PALETTES } from "@/lib/invitation/palettes";
import { INVITATION_TYPOGRAPHIES } from "@/lib/invitation/typographies";
import {
  booleanInput,
  dateInput,
  datetimeInput,
  enumInput,
  integerInput,
  nameListInput,
  optionalText,
  pathOrUrl,
  requiredText,
  storagePath,
  timeInput,
} from "@/lib/validation";

const EVENT_TYPE_VALUES = EVENT_TYPES.map((type) => type.value);
const PALETTE_IDS = INVITATION_PALETTES.map((palette) => palette.id);
const TYPOGRAPHY_IDS = INVITATION_TYPOGRAPHIES.map((typography) => typography.id);

function parseEventForm(formData) {
  const title = requiredText(formData.get("title"), { label: "El titulo", min: 3, max: 120 });
  const description = optionalText(formData.get("description"), { label: "La descripcion", max: 5000 });
  const date = datetimeInput(formData.get("date"), { label: "La fecha" });
  const location = optionalText(formData.get("location"), { label: "La ubicacion", max: 250 });
  const imageUrl = pathOrUrl(formData.get("imageUrl"), { label: "La imagen del evento", max: 1000 });
  const imagePath = storagePath(formData.get("imagePath"), { label: "La imagen del evento" });
  const eventType = enumInput(formData.get("eventType"), { label: "El tipo de evento", allowed: EVENT_TYPE_VALUES, required: true });
  const customEventType = optionalText(formData.get("customEventType"), { label: "El tipo personalizado", max: 120 });
  const protagonists = nameListInput(formData.get("protagonists"), { label: "los protagonistas" });

  if (eventType === "otro" && !customEventType) {
    throw new Error("El tipo personalizado es obligatorio cuando el tipo de evento es otro.");
  }

  return {
    title,
    description,
    date,
    location,
    published: booleanInput(formData.get("published")),
    imageUrl,
    imagePath,
    eventType,
    customEventType,
    protagonists,
  };
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
  const get = (name) => formData.get(name);

  const heroImageUrl = pathOrUrl(get("heroImageUrl"), {
    label: "La foto de portada",
    required: true,
    requiredMessage: "La foto de portada es obligatoria.",
    max: 1000,
  });
  const heroImagePath = storagePath(get("heroImagePath"), { label: "La foto de portada" });
  const names = requiredText(get("names"), {
    label: "Los nombres",
    requiredMessage: "Los nombres son obligatorios.",
    max: 120,
  });
  const message = requiredText(get("message"), { label: "El mensaje", max: 500 });
  const personalText = optionalText(get("personalText"), { label: "El texto personal", max: 1000 });
  const date = dateInput(get("date"), { label: "La fecha" });
  const time = timeInput(get("time"), { label: "El horario" });
  const venue = optionalText(get("venue"), { label: "La ubicacion", max: 250 });
  const mapUrl = pathOrUrl(get("mapUrl"), { label: "El enlace del mapa", max: 2000 });
  const dressCode = optionalText(get("dressCode"), { label: "El dress code", max: 120 });
  const palette = enumInput(get("palette") || "clasico", { label: "La paleta de colores", allowed: PALETTE_IDS });
  const typography = enumInput(get("typography") || "elegante", { label: "La tipografia", allowed: TYPOGRAPHY_IDS });
  const giftEnabled = booleanInput(get("giftEnabled"));
  const giftAlias = optionalText(get("giftAlias"), { label: "El texto de regalo", max: 500 });
  const closingText = optionalText(get("closingText"), { label: "El texto de cierre", max: 1000 });
  const audioEnabled = booleanInput(get("audioEnabled"));
  const audioUrl = pathOrUrl(get("audioUrl"), { label: "El audio", max: 1000 });

  return {
    heroImageUrl,
    heroImagePath,
    names,
    message,
    personalText,
    date,
    time,
    venue,
    mapUrl,
    dressCode,
    gallery: [],
    giftEnabled,
    giftAlias,
    closingText,
    palette,
    typography,
    audioEnabled,
    audioUrl,
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

function parseGuestForm(formData) {
  const name = requiredText(formData.get("name"), {
    label: "El nombre",
    min: 2,
    max: 120,
  });
  const quantity = integerInput(formData.get("quantity"), {
    label: "La cantidad",
    min: 1,
    max: 50,
  });

  if (quantity <= 1) {
    return { type: "individual", name, quantity: 1, members: [] };
  }

  const memberNames = formData
    .getAll("memberName")
    .map((value) =>
      optionalText(value, { label: "El nombre del integrante", max: 120 }),
    );

  if (
    memberNames.length !== quantity ||
    memberNames.some((member) => member.length < 2)
  ) {
    throw new Error("Completá el nombre de cada integrante del grupo.");
  }

  return { type: "group", name, quantity, members: memberNames };
}

export async function addGuest(eventId, formData) {
  const user = await requireAdmin();
  const guest = parseGuestForm(formData);
  await addEventGuest(user.uid, eventId, guest);
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/dashboard/events/${eventId}/invitados`);
  revalidatePath(`/dashboard/events/${eventId}`, "layout");
}

export async function removeGuest(eventId, guestId) {
  const user = await requireAdmin();
  await removeEventGuest(user.uid, eventId, guestId);
  revalidatePath(`/dashboard/events/${eventId}/invitados`);
  revalidatePath(`/dashboard/events/${eventId}`, "layout");
}

export async function removeGuestMember(eventId, guestId, memberId) {
  const user = await requireAdmin();
  await removeEventGuestMember(user.uid, eventId, guestId, memberId);
  revalidatePath(`/dashboard/events/${eventId}/invitados`);
  revalidatePath(`/dashboard/events/${eventId}`, "layout");
}

export async function updateGuestConfirmedCount(eventId, guestId, formData) {
  const user = await requireAdmin();
  const event = await getUserEvent(user.uid, eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const guest = (event.guests || []).find((entry) => entry.id === guestId);

  if (!guest) {
    throw new Error("Guest not found.");
  }

  const quantity = guest.quantity;
  const parsed = integerInput(formData.get("confirmedCount"), {
    label: "Los confirmados",
    min: 0,
    max: 50,
  });
  const confirmedCount = Math.min(Math.max(parsed, 0), quantity);
  const status = deriveGuestStatus(confirmedCount, quantity);

  await updateEventGuestField(user.uid, eventId, guestId, {
    confirmedCount,
    status,
  });
  revalidatePath(`/dashboard/events/${eventId}/invitados`);
  revalidatePath(`/dashboard/events/${eventId}`, "layout");
}
