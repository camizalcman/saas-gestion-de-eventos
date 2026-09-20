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
    tableNumber: Number.isInteger(raw?.tableNumber) ? raw.tableNumber : null,
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
    tableNumber: Number.isInteger(raw?.tableNumber) ? raw.tableNumber : null,
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
    tableNumber: Number.isInteger(raw?.tableNumber) ? raw.tableNumber : null,
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

function serializeProvider(raw, index) {
  return {
    id: raw?.id || `provider-${index}`,
    name: raw?.name || "",
    category: raw?.category || "",
    description: raw?.description || "",
    locality: raw?.locality || "",
    province: raw?.province || "",
    whatsapp: raw?.whatsapp || "",
    instagram: raw?.instagram || "",
    website: raw?.website || "",
    imageUrl: raw?.imageUrl || "",
    supplierId: raw?.supplierId || "",
    deleted: Boolean(raw?.deleted),
    createdAt: typeof raw?.createdAt === "string" ? raw.createdAt : null,
  };
}

function serializeScheduleItem(raw, index) {
  return {
    id: raw?.id || `schedule-${index}`,
    title: raw?.title || "",
    startTime: typeof raw?.startTime === "string" ? raw.startTime : "",
    endTime: typeof raw?.endTime === "string" ? raw.endTime : "",
    description: raw?.description || "",
    providerIds: Array.isArray(raw?.providerIds)
      ? raw.providerIds.filter((providerId) => typeof providerId === "string")
      : [],
    color: /^#[0-9a-f]{6}$/i.test(raw?.color || "")
      ? raw.color
      : "#B58B63",
  };
}

function serializeSchedule(rawSchedule) {
  if (!Array.isArray(rawSchedule)) {
    return [];
  }

  return rawSchedule
    .map(serializeScheduleItem)
    .filter((item) => item.title && item.startTime && item.endTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
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
            tableNumber: Number.isInteger(member?.tableNumber)
              ? member.tableNumber
              : null,
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
        tableNumber: Number.isInteger(guest?.tableNumber)
          ? guest.tableNumber
          : null,
      });
    }
  }

  return confirmed;
}

function serializeTables(rawTables) {
  if (!Array.isArray(rawTables)) {
    return [];
  }

  return rawTables
    .map((entry, index) => ({
      number:
        Number.isInteger(entry?.number) && entry.number > 0
          ? entry.number
          : index + 1,
      x: typeof entry?.x === "number" ? entry.x : null,
      y: typeof entry?.y === "number" ? entry.y : null,
    }))
    .filter((entry) => entry.number > 0);
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
    providers: Array.isArray(data.providers)
      ? data.providers.map(serializeProvider)
      : [],
    schedule: serializeSchedule(data.schedule),
    tableCount:
      Number.isInteger(data.tableCount) && data.tableCount > 0
        ? data.tableCount
        : 0,
    tables: serializeTables(data.tables),
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

  const docRef = await getDb().collection(COLLECTION).add({
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

  return docRef.id;
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

function normalizeGuestTables(guests, maxTable) {
  const within = (value) => {
    const safe = Number.isInteger(value) && value > 0 ? value : null;
    return safe && maxTable > 0 && safe <= maxTable ? safe : null;
  };

  return guests.map((guest) => {
    if (guest?.type !== "group" || !Array.isArray(guest.members)) {
      return { ...guest, tableNumber: within(guest?.tableNumber) };
    }

    const members = guest.members.map((member) => ({
      ...member,
      tableNumber: within(member?.tableNumber),
    }));

    return { ...guest, members };
  });
}

export async function setEventTableCount(userId, eventId, count) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const safeCount =
    Number.isInteger(count) && count > 0 ? Math.min(count, 60) : 0;
  const tables =
    safeCount > 0
      ? Array.from({ length: safeCount }, (_, index) => ({
          number: index + 1,
          x: null,
          y: null,
        }))
      : [];

  const rawGuests = Array.isArray(doc.data().guests) ? doc.data().guests : [];
  const nextGuests = normalizeGuestTables(rawGuests, safeCount);

  await eventRef.update({
    tableCount: safeCount,
    tables,
    guests: nextGuests,
    confirmedGuests: buildConfirmedGuests(nextGuests),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function clampTablePercent(value) {
  if (!Number.isFinite(value)) return null;
  return Math.min(96, Math.max(4, value));
}

export async function setEventTablePositions(userId, eventId, positions) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const currentTables = Array.isArray(doc.data().tables) ? doc.data().tables : [];
  const byNumber = new Map(currentTables.map((entry) => [entry?.number, entry]));

  for (const position of positions) {
    if (!position || !Number.isInteger(position.number) || position.number <= 0) {
      continue;
    }

    const x = clampTablePercent(position.x);
    const y = clampTablePercent(position.y);

    if (x === null || y === null) {
      continue;
    }

    byNumber.set(position.number, { number: position.number, x, y });
  }

  const tables = Array.from(byNumber.values())
    .map((entry) => ({
      number: entry?.number,
      x: Number.isFinite(entry?.x) ? entry.x : null,
      y: Number.isFinite(entry?.y) ? entry.y : null,
    }))
    .filter((entry) => Number.isInteger(entry.number) && entry.number > 0)
    .sort((a, b) => a.number - b.number);

  await eventRef.update({
    tables,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function setEventGuestTable(
  userId,
  eventId,
  { guestId, memberId = null, tableNumber = null },
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

  const guest = rawGuests[index];
  const tableCount = Number.isInteger(doc.data().tableCount)
    ? doc.data().tableCount
    : 0;
  const safeTable =
    Number.isInteger(tableNumber) && tableNumber > 0 && tableNumber <= tableCount
      ? tableNumber
      : null;

  let nextGuests;

  if (memberId) {
    const members = Array.isArray(guest.members) ? guest.members : [];
    const memberIndex = members.findIndex((member) => member?.id === memberId);

    if (memberIndex === -1) {
      return false;
    }

    const nextMembers = members.map((member, entryIndex) =>
      entryIndex === memberIndex
        ? { ...member, tableNumber: safeTable }
        : member,
    );

    nextGuests = rawGuests.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, members: nextMembers } : entry,
    );
  } else {
    nextGuests = rawGuests.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, tableNumber: safeTable } : entry,
    );
  }

  await eventRef.update({
    guests: nextGuests,
    confirmedGuests: buildConfirmedGuests(nextGuests),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return true;
}

export async function addEventProvider(userId, eventId, provider) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const entry = {
    id: generateToken(),
    name: provider.name,
    category: provider.category,
    description: provider.description || "",
    locality: provider.locality || "",
    province: provider.province || "",
    whatsapp: provider.whatsapp || "",
    instagram: provider.instagram || "",
    website: provider.website || "",
    imageUrl: provider.imageUrl || "",
    supplierId: provider.supplierId || "",
    createdAt: new Date().toISOString(),
  };

  await eventRef.update({
    providers: FieldValue.arrayUnion(entry),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return entry.id;
}

export async function addEventScheduleItem(userId, eventId, activity) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const entry = {
    id: generateToken(),
    title: activity.title,
    startTime: activity.startTime,
    endTime: activity.endTime,
    description: activity.description || "",
    providerIds: activity.providerIds || [],
    color: activity.color,
  };

  await eventRef.update({
    schedule: FieldValue.arrayUnion(entry),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return entry.id;
}

export async function updateEventScheduleItem(userId, eventId, activityId, activity) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const schedule = Array.isArray(doc.data().schedule)
    ? doc.data().schedule
    : [];
  const index = schedule.findIndex((entry) => entry?.id === activityId);

  if (index === -1) {
    throw new Error("Actividad no encontrada.");
  }

  const nextSchedule = schedule.map((entry, entryIndex) =>
    entryIndex === index
      ? { ...entry, ...activity, id: activityId }
      : entry,
  );

  await eventRef.update({
    schedule: nextSchedule,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function removeEventScheduleItem(userId, eventId, activityId) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const schedule = Array.isArray(doc.data().schedule)
    ? doc.data().schedule
    : [];
  const nextSchedule = schedule.filter((entry) => entry?.id !== activityId);

  if (nextSchedule.length === schedule.length) {
    throw new Error("Actividad no encontrada.");
  }

  await eventRef.update({
    schedule: nextSchedule,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function removeEventProvider(userId, eventId, providerId) {
  const eventRef = getDb().collection(COLLECTION).doc(eventId);
  const doc = await eventRef.get();

  if (!doc.exists || doc.data().userId !== userId) {
    throw new Error("Event not found.");
  }

  const rawProviders = Array.isArray(doc.data().providers)
    ? doc.data().providers
    : [];
  const nextProviders = rawProviders.filter((entry) => entry?.id !== providerId);

  if (nextProviders.length === rawProviders.length) {
    return false;
  }

  await eventRef.update({
    providers: nextProviders,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return true;
}

function matchesSupplier(provider, supplierId, supplierName, supplierCategory) {
  if (provider.supplierId && provider.supplierId === supplierId) return true;
  if (
    supplierName &&
    supplierCategory &&
    provider.name === supplierName &&
    provider.category === supplierCategory
  ) return true;
  return false;
}

export async function syncSupplierInEvents(supplierId, updates, supplierData) {
  if (!supplierId) return;

  const supplierName = supplierData?.name || "";
  const supplierCategory = supplierData?.category || "";

  const snapshot = await getDb().collection(COLLECTION).get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const rawProviders = Array.isArray(data.providers) ? data.providers : [];

    const hasMatch = rawProviders.some((p) =>
      matchesSupplier(p, supplierId, supplierName, supplierCategory),
    );

    if (!hasMatch) continue;

    const nextProviders = rawProviders.map((provider) => {
      if (!matchesSupplier(provider, supplierId, supplierName, supplierCategory)) {
        return provider;
      }
      return { ...provider, ...updates };
    });

    await getDb().collection(COLLECTION).doc(doc.id).update({
      providers: nextProviders,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}
