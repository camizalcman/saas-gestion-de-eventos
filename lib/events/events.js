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

function serializeGuestMember(raw, index) {
  const storedStatus = raw?.status;
  const status =
    storedStatus === "confirmado" || storedStatus === "rechazado"
      ? storedStatus
      : "invitado";

  return {
    id: raw?.id || `member-${index}`,
    name: raw?.name || "",
    status,
  };
}

function deriveGroupStatus(confirmedCount, quantity) {
  if (confirmedCount <= 0) return "invitado";
  if (confirmedCount >= quantity) return "confirmado";
  return "parcial";
}

function serializeGuest(raw, index) {
  const type = raw?.type === "group" ? "group" : "individual";

  const rawQuantity = Number(raw?.quantity);
  const safeQuantity =
    Number.isInteger(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;

  const members =
    type === "group" && Array.isArray(raw?.members)
      ? raw.members
          .map((member, memberIndex) =>
            serializeGuestMember(member, memberIndex),
          )
          .filter((member) => member.name)
      : [];

  const quantity = type === "group" ? members.length || safeQuantity : safeQuantity;

  const storedStatus =
    typeof raw?.status === "string" && GUEST_STATUS_VALUES.includes(raw.status)
      ? raw.status
      : null;

  const confirmedCount =
    type === "group"
      ? members.filter((member) => member.status === "confirmado").length
      : storedStatus === "confirmado"
        ? quantity
        : 0;

  let status;
  if (type === "group") {
    status = deriveGroupStatus(confirmedCount, quantity);
  } else if (storedStatus === "rechazado") {
    status = "rechazado";
  } else if (storedStatus === "confirmado") {
    status = "confirmado";
  } else {
    status = "invitado";
  }

  const createdAt =
    typeof raw?.createdAt === "string"
      ? raw.createdAt
      : raw?.createdAt?.toDate?.().toISOString() || null;

  return {
    id: raw?.id || `guest-${index}`,
    type,
    name: raw?.name || "",
    quantity,
    status,
    confirmedCount,
    token: typeof raw?.token === "string" && raw.token ? raw.token : null,
    members,
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

function serializeConfirmedGuest(raw, index) {
  return {
    id: raw?.id || `confirmed-${index}`,
    guestId: raw?.guestId || null,
    memberId: raw?.memberId || null,
    groupName: raw?.groupName || null,
    name: raw?.name || "",
  };
}

function serializeConfirmedGuests(rawGuests) {
  if (!Array.isArray(rawGuests)) {
    return [];
  }

  return rawGuests
    .map((guest, index) => serializeConfirmedGuest(guest, index))
    .filter((guest) => guest.name);
}

function buildConfirmedGuests(rawGuests) {
  const confirmed = [];

  for (const guest of rawGuests) {
    if (!guest) continue;

    if (guest.type === "group" && Array.isArray(guest.members)) {
      for (const member of guest.members) {
        if (member?.status === "confirmado" && member?.name) {
          confirmed.push({
            id: member.id || `${guest.id}-${confirmed.length}`,
            guestId: guest.id || null,
            memberId: member.id || null,
            groupName: guest.name || null,
            name: member.name,
          });
        }
      }
      continue;
    }

    if (guest.status === "confirmado" && guest.name) {
      confirmed.push({
        id: guest.id || `confirmed-${confirmed.length}`,
        guestId: guest.id || null,
        memberId: null,
        groupName: null,
        name: guest.name,
      });
    }
  }

  return confirmed;
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
    confirmedGuests: serializeConfirmedGuests(data.confirmedGuests),
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

export async function findEventByGuestToken(token) {
  if (!token) {
    return null;
  }

  const snapshot = await getDb().collection(COLLECTION).get();

  for (const doc of snapshot.docs) {
    const rawGuests = Array.isArray(doc.data().guests) ? doc.data().guests : [];
    const match = rawGuests.find((guest) => guest?.token === token);

    if (match) {
      const event = serializeEvent(doc);
      const guest = event.guests.find((entry) => entry.id === match.id) || null;
      return { event, guest };
    }
  }

  return null;
}

export const GUEST_RESPONSE_VALUES = ["confirmado", "rechazado"];

export async function respondToGuestInvitation(
  token,
  { memberId = null, response } = {},
) {
  if (!token || !GUEST_RESPONSE_VALUES.includes(response)) {
    throw new Error("Invalid response.");
  }

  const snapshot = await getDb().collection(COLLECTION).get();

  for (const doc of snapshot.docs) {
    const rawGuests = Array.isArray(doc.data().guests) ? doc.data().guests : [];
    const index = rawGuests.findIndex((guest) => guest?.token === token);

    if (index === -1) {
      continue;
    }

    const guest = rawGuests[index];
    let nextGuests;

    if (memberId) {
      const members = Array.isArray(guest.members) ? guest.members : [];
      const memberIndex = members.findIndex(
        (member) => member?.id === memberId,
      );

      if (memberIndex === -1) {
        throw new Error("Guest member not found.");
      }

      const nextMembers = members.map((member, entryIndex) =>
        entryIndex === memberIndex ? { ...member, status: response } : member,
      );

      nextGuests = rawGuests.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, members: nextMembers } : entry,
      );
    } else {
      nextGuests = rawGuests.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, status: response } : entry,
      );
    }

    await doc.ref.update({
      guests: nextGuests,
      confirmedGuests: buildConfirmedGuests(nextGuests),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return doc.id;
  }

  throw new Error("Invitation not found.");
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

  const isGroup =
    guest.type === "group" &&
    Array.isArray(guest.members) &&
    guest.members.length > 0;

  const members = isGroup
    ? guest.members
        .map((member) => String(member ?? "").trim())
        .filter(Boolean)
        .map((memberName) => ({
          id: generateGuestId(),
          name: memberName,
          status: "invitado",
        }))
    : [];

  const entry = {
    id: generateGuestId(),
    type: isGroup ? "group" : "individual",
    name: guest.name,
    quantity: isGroup ? members.length : guest.quantity,
    status: "invitado",
    confirmedCount: 0,
    members,
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

export async function removeEventGuestMember(
  userId,
  eventId,
  guestId,
  memberId,
) {
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

  const members = Array.isArray(rawGuests[index]?.members)
    ? rawGuests[index].members
    : [];
  const nextMembers = members.filter((member) => member?.id !== memberId);

  if (nextMembers.length === members.length) {
    return false;
  }

  const nextGuests = rawGuests.map((entry, entryIndex) =>
    entryIndex === index ? { ...entry, members: nextMembers } : entry,
  );

  await eventRef.update({
    guests: nextGuests,
    confirmedGuests: buildConfirmedGuests(nextGuests),
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

  const nextGuests = guests.filter((entry) => entry?.id !== guestId);

  await eventRef.update({
    guests: nextGuests,
    confirmedGuests: buildConfirmedGuests(nextGuests),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return true;
}
