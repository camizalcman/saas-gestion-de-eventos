import { listUserProfiles } from "@/lib/users/users";
import { getDb } from "@/lib/firebase/firestore";

function monthKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getAdminStats() {
  const [profiles, eventsSnapshot] = await Promise.all([
    listUserProfiles(),
    getDb().collection("events").get(),
  ]);

  const now = new Date();
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const usersThisMonth = profiles.filter(
    (profile) => monthKey(profile.createdAt) === currentMonth,
  ).length;

  const usersByMonth = profiles.reduce((acc, profile) => {
    const key = monthKey(profile.createdAt);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const usersPerMonth = Object.keys(usersByMonth)
    .sort()
    .map((key) => ({ month: key, count: usersByMonth[key] }));

  return {
    totalUsers: profiles.length,
    usersThisMonth,
    totalEvents: eventsSnapshot.size,
    usersPerMonth,
  };
}