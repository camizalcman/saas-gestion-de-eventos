import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase/firestore";

const COLLECTION = "rsvps";

function serializeRsvp(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    eventId: data.eventId || "",
    name: data.name || "",
    guests: Number(data.guests) || 0,
    message: data.message || "",
    status: data.status || "confirmed",
    createdAt: data.createdAt?.toDate?.().toISOString() || null,
  };
}

function assertPublishedEvent(db, eventId) {
  return db.collection("events").doc(eventId).get();
}

export async function listEventRsvps(eventId) {
  const snapshot = await getDb()
    .collection(COLLECTION)
    .where("eventId", "==", eventId)
    .orderBy("createdAt", "asc")
    .get();

  return snapshot.docs.map(serializeRsvp);
}

export async function createRsvp(eventId, data) {
  const db = getDb();
  const eventDoc = await assertPublishedEvent(db, eventId);

  if (!eventDoc.exists || !eventDoc.data().published) {
    throw new Error("Event not available.");
  }

  await db.collection(COLLECTION).add({
    eventId,
    name: data.name,
    guests: data.guests,
    message: data.message,
    status: "confirmed",
    createdAt: FieldValue.serverTimestamp(),
  });
}
