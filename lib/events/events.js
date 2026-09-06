import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";
import { serializeInvitation } from "@/lib/invitation/serialize";

const COLLECTION = "events";

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
