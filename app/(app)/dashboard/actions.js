"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/firebase/constants";
import { ACTIVE_EVENT_COOKIE, getActiveEvent } from "@/lib/events/active";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  addEventExpense,
  addEventGuest,
  addEventPaymentResponsible,
  addEventProvider,
  addEventScheduleItem,
  createUserEvent,
  deleteUserEvent,
  deriveGuestStatus,
  listUserEvents,
  removeEventExpense,
  removeEventGuest,
  removeEventGuestMember,
  removeEventPaymentResponsible,
  removeEventProvider,
  removeEventScheduleItem,
  setEventBudget,
  setEventGuestTable,
  setEventTableCount,
  setEventTablePositions,
  setUserEventInvitation,
  updateEventExpense,
  updateEventGuestField,
  updateEventScheduleItem,
  updateEventPaymentResponsible,
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
  moneyInput,
  nameListInput,
  optionalText,
  pathOrUrl,
  requiredText,
  shortNameInput,
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
  const eventId = await createUserEvent(user.uid, {
    ...parseEventForm(formData),
    published: true,
  });

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

export async function saveEventTablePositions(formData) {
  const { user, event } = await requireActiveEvent();

  let parsed;
  try {
    parsed = JSON.parse(String(formData.get("positions") || "[]"));
  } catch {
    throw new Error("No se pudieron leer las posiciones de las mesas.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Las posiciones de las mesas no tienen el formato esperado.");
  }

  const positions = parsed
    .map((entry) => ({
      number: Number(entry?.number),
      x: Number(entry?.x),
      y: Number(entry?.y),
    }))
    .filter(
      (entry) =>
        Number.isInteger(entry.number) &&
        entry.number > 0 &&
        Number.isFinite(entry.x) &&
        Number.isFinite(entry.y),
    );

  await setEventTablePositions(user.uid, event.id, positions);
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

function parseScheduleActivityForm(formData, event) {
  const title = requiredText(formData.get("title"), {
    label: "El titulo de la actividad",
    min: 2,
    max: 120,
  });
  const startTime = timeInput(formData.get("startTime"), {
    label: "La hora de inicio",
    required: true,
  });
  const endTime = timeInput(formData.get("endTime"), {
    label: "La hora de finalizacion",
    required: true,
  });

  if (endTime === startTime) {
    throw new Error("La hora de finalizacion debe ser distinta al inicio.");
  }

  const description = optionalText(formData.get("description"), {
    label: "La descripcion",
    max: 2000,
  });
  const color = String(formData.get("color") || "#B58B63").trim();

  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    throw new Error("El color de la actividad no es valido.");
  }

  const eventProviders = new Map(
    (event.providers || [])
      .filter((provider) => !provider.deleted)
      .map((provider) => [provider.id, provider]),
  );
  const providerIds = [...new Set(formData.getAll("providerIds"))]
    .map((providerId) => String(providerId))
    .filter(Boolean);

  if (providerIds.some((providerId) => !eventProviders.has(providerId))) {
    throw new Error("Uno de los proveedores seleccionados no pertenece al evento.");
  }

  return { title, startTime, endTime, description, color, providerIds };
}

export async function addScheduleActivity(formData) {
  const { user, event } = await requireActiveEvent();
  const activity = parseScheduleActivityForm(formData, event);

  await addEventScheduleItem(user.uid, event.id, activity);
  revalidatePath("/dashboard/cronograma", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function updateScheduleActivity(formData) {
  const { user, event } = await requireActiveEvent();
  const activityId = requiredText(formData.get("activityId"), {
    label: "La actividad",
    max: 200,
  });
  const activity = parseScheduleActivityForm(formData, event);

  await updateEventScheduleItem(user.uid, event.id, activityId, activity);
  revalidatePath("/dashboard/cronograma", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function removeScheduleActivity(formData) {
  const { user, event } = await requireActiveEvent();
  const activityId = requiredText(formData.get("activityId"), {
    label: "La actividad",
    max: 200,
  });

  await removeEventScheduleItem(user.uid, event.id, activityId);
  revalidatePath("/dashboard/cronograma", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function removeProvider(providerId) {
  const { user, event } = await requireActiveEvent();
  const expenses = Array.isArray(event.expenses) ? event.expenses : [];
  const usedCount = expenses.filter(
    (expense) => expense.providerId === providerId,
  ).length;

  if (usedCount > 0) {
    const provider = (event.providers || []).find(
      (entry) => entry.id === providerId,
    );
    const name = provider?.name || "el proveedor";
    throw new Error(
      `No se puede quitar "${name}": hay ${usedCount} gasto(s) asociados. Reasigná o eliminá esos gastos primero.`,
    );
  }

  await removeEventProvider(user.uid, event.id, providerId);
  revalidatePath("/dashboard/proveedores", "layout");
}

function parseExpenseForm(formData) {
  return {
    title: requiredText(formData.get("title"), {
      label: "El concepto",
      min: 2,
      max: 120,
    }),
    cost: moneyInput(formData.get("cost"), {
      label: "El costo total",
      required: true,
    }),
    paidAmount: moneyInput(formData.get("paidAmount"), {
      label: "El monto pagado",
    }),
    providerId: requiredText(formData.get("providerId"), {
      label: "El proveedor",
      min: 1,
      max: 200,
    }),
    responsibleId: requiredText(formData.get("responsibleId"), {
      label: "El responsable",
      min: 1,
      max: 200,
    }),
    notes: optionalText(formData.get("notes"), {
      label: "Las observaciones",
      max: 500,
    }),
  };
}

function validateExpenseRefs(event, expense) {
  const providers = Array.isArray(event.providers) ? event.providers : [];
  const provider = providers.find(
    (entry) => entry.id === expense.providerId && !entry.deleted,
  );

  if (!provider) {
    throw new Error("El proveedor seleccionado no pertenece a este evento.");
  }

  const responsibles = Array.isArray(event.paymentResponsibles)
    ? event.paymentResponsibles
    : [];
  const hasResponsible = responsibles.some(
    (entry) => entry.id === expense.responsibleId,
  );

  if (!hasResponsible) {
    throw new Error(
      "El responsable seleccionado no pertenece a este evento.",
    );
  }
}

export async function saveBudget(formData) {
  const { user, event } = await requireActiveEvent();
  const budget = moneyInput(formData.get("budget"), {
    label: "El presupuesto",
  });

  await setEventBudget(user.uid, event.id, budget);
  revalidatePath("/dashboard/presupuesto", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function addExpense(formData) {
  const { user, event } = await requireActiveEvent();
  const expense = parseExpenseForm(formData);
  validateExpenseRefs(event, expense);

  await addEventExpense(user.uid, event.id, expense);
  revalidatePath("/dashboard/presupuesto", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function updateExpense(expenseId, formData) {
  const { user, event } = await requireActiveEvent();
  const expense = parseExpenseForm(formData);
  validateExpenseRefs(event, expense);

  await updateEventExpense(user.uid, event.id, expenseId, expense);
  revalidatePath("/dashboard/presupuesto", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function removeExpense(expenseId) {
  const { user, event } = await requireActiveEvent();
  await removeEventExpense(user.uid, event.id, expenseId);
  revalidatePath("/dashboard/presupuesto", "layout");
  revalidatePath("/dashboard", "layout");
}

function parseResponsibleForm(formData) {
  return shortNameInput(formData.get("name"), {
    label: "El responsable",
    min: 2,
    max: 60,
  });
}

function validateResponsibleRemoval(event, responsibleId, name) {
  const expenses = Array.isArray(event.expenses) ? event.expenses : [];
  const usedCount = expenses.filter(
    (expense) => expense.responsibleId === responsibleId,
  ).length;

  if (usedCount > 0) {
    throw new Error(
      `No se puede eliminar "${name}": hay ${usedCount} gasto(s) asociados. Reasigná o eliminá esos gastos primero.`,
    );
  }
}

export async function addPaymentResponsible(formData) {
  const { user, event } = await requireActiveEvent();
  const name = parseResponsibleForm(formData);
  const id = await addEventPaymentResponsible(user.uid, event.id, name);

  revalidatePath("/dashboard/presupuesto", "layout");
  return id;
}

export async function updatePaymentResponsible(responsibleId, formData) {
  const { user, event } = await requireActiveEvent();
  const name = parseResponsibleForm(formData);

  await updateEventPaymentResponsible(user.uid, event.id, responsibleId, name);
  revalidatePath("/dashboard/presupuesto", "layout");
}

export async function removePaymentResponsible(responsibleId) {
  const { user, event } = await requireActiveEvent();
  const responsible = (event.paymentResponsibles || []).find(
    (entry) => entry.id === responsibleId,
  );

  if (responsible) {
    validateResponsibleRemoval(event, responsibleId, responsible.name);
  }

  await removeEventPaymentResponsible(user.uid, event.id, responsibleId);
  revalidatePath("/dashboard/presupuesto", "layout");
}
