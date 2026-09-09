import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";
import { serializeInvitation } from "@/lib/invitation/serialize";
import { GUEST_STATUS_VALUES } from "./constants";

const COLLECTION = "events";

function generateToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function generateGuestId() {
  return generateToken();
}

export function deriveGuestStatus(confirmedCount, quantity) {
  const safeQuantity =
    Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  const safeCount =
    Number.isInteger(confirmedCount) && confirmedCount > 0
      ? Math.min(confirmedCount, safeQuantity)
      : 0;

  if (safeCount <= 0) return "invitado";
  if (safeCount >= safeQuantity) return "confirmado";
  return "parcial";
}

function serializeGuest(raw, index) {
  const quantity = Number(raw?.quantity);
  const safeQuantity =
    Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  const rawConfirmed = Number(raw?.confirmedCount);
  const confirmedCount = Number.isInteger(rawConfirmed)
    ? Math.min(Math.max(rawConfirmed, 0), safeQuantity)
    : 0;

  const storedStatus =
    typeof raw?.status === "string" && GUEST_STATUS_VALUES.includes(raw.status)
      ? raw.status
      : null;

  const status =
    storedStatus === "rechazado"
      ? "rechazado"
      : deriveGuestStatus(confirmedCount, safeQuantity);

  const createdAt =
    typeof raw?.createdAt === "string"
      ? raw.createdAt
      : raw?.createdAt?.toDate?.().toISOString() || null;

  return {
    id: raw?.id || `guest-${index}`,
    name: raw?.name || "",
    quantity: safeQuantity,
    status,
    confirmedCount,
    token: typeof raw?.token === "string" && raw.token ? raw.token : null,
    createdAt,
  };
}

function serializeGuests(rawGuests) {
  if (!Array.isArray(rawGuests)) {
    return [];
  }

  return rawGuests
    .map((guest, index) => serializeGuest(guest, index))
    .filter((guest) => guest.name);
}

function serializeEvent(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    location: data.location || "",
    published: Boolean(data.published),
    imageUrl: data.imageUrl || "",
    imagePath: data.imagePath || "",
    eventType: data.eventType || "",
    customEventType: data.customEventType || "",
    protagonists: Array.isArray(data.protagonists) ? data.protagonists : [],
    invitation: serializeInvitation(data.invitation),
    guests: serializeGuests(data.guests),
    userId: data.userId,
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() || null,
  };
}

export async function listUserEvents(userId) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .get();

  return snapshot.docs
    .map(serializeEvent)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
}

export async function listPublishedEvents() {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("published", "==", true)
    .get();

  return snapshot.docs
    .map(serializeEvent)
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
}

export async function getUserEvent(userId, eventId) {
  const doc = await getDb().collection(COLLECTION).doc(eventId).get();

  if (!doc.exists || doc.data().userId !== userId) {
    return null;
  }

  return serializeEvent(doc);
}

export async function getPublishedEvent(eventId) {
  const doc = await getDb().collection(COLLECTION).doc(eventId).get();

  if (!doc.exists) {
    return null;
  }

  const event = serializeEvent(doc);
  return event.published ? event : null;
}

export async function createUserEvent(userId, data) {
  const now = FieldValue.serverTimestamp();

  await getDb().collection(COLLECTION).add({
    userId,
    title: data.title,
    description: data.description,
    date: data.date,
    location: data.location,
    published: data.published,
    imageUrl: data.imageUrl,
    imagePath: data.imagePath,
    eventType: data.eventType,
    customEventType: data.customEventType,
    protagonists: data.protagonists,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateUserEvent(userId, eventId, data) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  await eventRef.update({
    title: data.title,
    description: data.description,
    date: data.date,
    location: data.location,
    published: data.published,
    imageUrl: data.imageUrl,
    imagePath: data.imagePath,
    eventType: data.eventType,
    customEventType: data.customEventType,
    protagonists: data.protagonists,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteUserEvent(userId, eventId) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  await eventRef.delete();
}

export async function setUserEventInvitation(userId, eventId, invitation) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  await eventRef.update({
    invitation,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function addEventGuest(userId, eventId, guest) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const entry = {
    id: generateGuestId(),
    name: guest.name,
    quantity: guest.quantity,
    status: "invitado",
    confirmedCount: 0,
    token: generateToken(),
    createdAt: new Date().toISOString(),
  };

  await eventRef.update({
    guests: FieldValue.arrayUnion(entry),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return entry.id;
}

export async function updateEventGuestField(userId, eventId, guestId, patch) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const rawGuests = Array.isArray(doc.data().guests) ? doc.data().guests : [];
  const index = rawGuests.findIndex((entry) => entry?.id === guestId);

  if (index === -1) {
    return false;
  }

  const nextGuests = rawGuests.map((entry, entryIndex) => {
    if (entryIndex !== index) {
      return entry;
    }

    const merged = { ...entry, ...patch };
    delete merged.id;
    return merged;
  });

  await eventRef.update({
    guests: nextGuests,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return true;
}

export async function removeEventGuest(userId, eventId, guestId) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const guests = Array.isArray(doc.data().guests) ? doc.data().guests : [];
  const match = guests.find((entry) => entry?.id === guestId);

  if (!match) {
    return false;
  }

  await eventRef.update({
    guests: FieldValue.arrayRemove(match),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return true;
}
