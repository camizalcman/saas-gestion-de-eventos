import { listUserProfiles } from "@/lib/users/users";
import { getDb } from "@/lib/firebase/firestore";

function monthKey(value) {
  if (!value) return null;
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function countByMonth(records, field) {
  const counts = {};

  for (const record of records) {
    const key = monthKey(record[field]);
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }

  return Object.keys(counts)
    .sort()
    .map((month) => ({ month, count: counts[month] }));
}

export async function getAdminStats() {
  const [profiles, eventsSnapshot] = await Promise.all([
    listUserProfiles(),
    getDb().collection("events").get(),
  ]);

  const eventDocs = eventsSnapshot.docs.map((doc) => doc.data());

  return {
    totalUsers: profiles.length,
    totalEvents: eventsSnapshot.size,
    usersPerMonth: countByMonth(profiles, "createdAt"),
    eventsPerMonth: countByMonth(eventDocs, "createdAt"),
  };
}