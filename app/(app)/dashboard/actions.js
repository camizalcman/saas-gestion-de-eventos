"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/firebase/constants";
import { ACTIVE_EVENT_COOKIE, getActiveEvent } from "@/lib/events/active";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  addEventGuest,
  addEventProvider,
  createUserEvent,
  deleteUserEvent,
  deriveGuestStatus,
  listUserEvents,
  removeEventGuest,
  removeEventGuestMember,
  removeEventProvider,
  setEventGuestTable,
  setEventTableCount,
  setUserEventInvitation,
  updateEventGuestField,
  updateUserEvent,
} from "@/lib/events/events";
import { EVENT_TYPES } from "@/lib/events/constants";
import { SUPPLIER_CATEGORIES } from "@/lib/suppliers/constants";
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
  tableCountInput,
  tableNumberInput,
  timeInput,
} from "@/lib/validation";

const EVENT_TYPE_VALUES = EVENT_TYPES.map((type) => type.value);
const PALETTE_IDS = INVITATION_PALETTES.map((palette) => palette.id);
const TYPOGRAPHY_IDS = INVITATION_TYPOGRAPHIES.map((typography) => typography.id);
const SUPPLIER_CATEGORY_VALUES = SUPPLIER_CATEGORIES.map(
  (category) => category.value,
);

function cookieOptions() {
  return {
    maxAge: SESSION_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/login");
}

async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

async function requireActiveEvent() {
  const user = await requireUser();
  const event = await getActiveEvent(user);

  if (!event) {
    throw new Error("No tenés ningún evento creado.");
  }

  return { user, event };
}

export async function selectEvent(formData) {
  const user = await requireUser();
  const eventId = String(formData.get("eventId") || "");
  const owned = await listUserEvents(user.uid);

  if (owned.some((event) => event.id === eventId)) {
    const cookieStore = await cookies();
    cookieStore.set(ACTIVE_EVENT_COOKIE, eventId, cookieOptions());
  }

  revalidatePath("/", "layout");
}

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

export async function createEvent(formData) {
  const user = await requireUser();
  const eventId = await createUserEvent(user.uid, parseEventForm(formData));

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_EVENT_COOKIE, eventId, cookieOptions());

  revalidatePath("/", "layout");
}

export async function updateEvent(formData) {
  const { user, event } = await requireActiveEvent();
  await updateUserEvent(user.uid, event.id, parseEventForm(formData));
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function deleteEvent() {
  const { user, event } = await requireActiveEvent();
  await deleteUserEvent(user.uid, event.id);

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_EVENT_COOKIE, "", { ...cookieOptions(), maxAge: 0 });

  revalidatePath("/", "layout");
  redirect("/dashboard");
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

export async function saveInvitation(formData) {
  const { user, event } = await requireActiveEvent();
  await setUserEventInvitation(user.uid, event.id, parseInvitationForm(formData));
  revalidatePath("/", "layout");
  redirect("/dashboard/invitacion");
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

export async function addGuest(formData) {
  const { user, event } = await requireActiveEvent();
  const guest = parseGuestForm(formData);
  await addEventGuest(user.uid, event.id, guest);
  revalidatePath("/dashboard/invitados", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function removeGuest(guestId) {
  const { user, event } = await requireActiveEvent();
  await removeEventGuest(user.uid, event.id, guestId);
  revalidatePath("/dashboard/invitados", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function removeGuestMember(guestId, memberId) {
  const { user, event } = await requireActiveEvent();
  await removeEventGuestMember(user.uid, event.id, guestId, memberId);
  revalidatePath("/dashboard/invitados", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function updateGuestConfirmedCount(guestId, formData) {
  const { user, event } = await requireActiveEvent();
  const guest = (event.guests || []).find((entry) => entry.id === guestId);

  if (!guest) {
    throw new Error("Invitado no encontrado.");
  }

  const quantity = guest.quantity;
  const parsed = integerInput(formData.get("confirmedCount"), {
    label: "Los confirmados",
    min: 0,
    max: 50,
  });
  const confirmedCount = Math.min(Math.max(parsed, 0), quantity);
  const status = deriveGuestStatus(confirmedCount, quantity);

  await updateEventGuestField(user.uid, event.id, guestId, {
    confirmedCount,
    status,
  });
  revalidatePath("/dashboard/invitados", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function saveEventTables(formData) {
  const { user, event } = await requireActiveEvent();
  const count = tableCountInput(formData.get("tableCount"), {
    label: "La cantidad de mesas",
  });

  await setEventTableCount(user.uid, event.id, count);
  revalidatePath("/dashboard/invitados", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function assignGuestTable(guestId, memberId, formData) {
  const { user, event } = await requireActiveEvent();
  const guest = (event.guests || []).find((entry) => entry.id === guestId);

  if (!guest) {
    throw new Error("Invitado no encontrado.");
  }

  const isMember = Boolean(memberId);

  if (guest.type === "group") {
    if (!isMember) {
      throw new Error("Para un grupo elegí el integrante.");
    }

    const member = guest.members.find((entry) => entry.id === memberId);

    if (!member) {
      throw new Error("Integrante no encontrado.");
    }

    if (member.status !== "confirmado") {
      throw new Error("El integrante aún no confirmó su asistencia.");
    }
  } else if (isMember) {
    throw new Error("El invitado no es un grupo.");
  } else if (guest.status !== "confirmado") {
    throw new Error("El invitado aún no confirmó su asistencia.");
  }

  const tableNumber = tableNumberInput(formData.get("tableNumber"), {
    label: "La mesa",
    max: event.tableCount,
  });

  await setEventGuestTable(user.uid, event.id, {
    guestId,
    memberId: isMember ? memberId : null,
    tableNumber,
  });
  revalidatePath("/dashboard/invitados", "layout");
  revalidatePath("/dashboard", "layout");
}

function parseProviderForm(formData) {
  const name = requiredText(formData.get("name"), {
    label: "El proveedor",
    min: 2,
    max: 120,
  });
  const category = enumInput(formData.get("category"), {
    label: "La categoria",
    allowed: SUPPLIER_CATEGORY_VALUES,
    required: true,
  });
  const whatsapp = optionalText(formData.get("whatsapp"), {
    label: "El WhatsApp",
    max: 60,
  });
  const instagram = optionalText(formData.get("instagram"), {
    label: "El Instagram",
    max: 120,
  });
  const website = optionalText(formData.get("website"), {
    label: "El sitio web",
    max: 200,
  });

  return { name, category, whatsapp, instagram, website };
}

export async function addProvider(formData) {
  const { user, event } = await requireActiveEvent();
  const provider = parseProviderForm(formData);
  await addEventProvider(user.uid, event.id, provider);
  revalidatePath("/dashboard/proveedores", "layout");
}

export async function removeProvider(providerId) {
  const { user, event } = await requireActiveEvent();
  await removeEventProvider(user.uid, event.id, providerId);
  revalidatePath("/dashboard/proveedores", "layout");
}