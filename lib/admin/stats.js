import { listUserProfiles } from "@/lib/users/users";
import { getDb } from "@/lib/firebase/firestore";
import { EVENT_TYPES } from "@/lib/events/constants";

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

function toAmount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

const EVENT_TYPE_LABELS = new Map(
  EVENT_TYPES.map((type) => [type.value, type.label]),
);
const UNKNOWN_TYPE_LABEL = "Sin tipo definido";

const NICE_BUDGET_STEPS = [
  10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000,
  250000, 500000, 1000000, 2500000, 5000000, 10000000,
];
const MAX_BUDGET_BUCKETS = 8;

function buildBudgetRanges(budgets) {
  if (budgets.length === 0) return [];

  const max = budgets[budgets.length - 1];
  const step =
    NICE_BUDGET_STEPS.find(
      (candidate) => Math.ceil(max / candidate) <= MAX_BUDGET_BUCKETS,
    ) || NICE_BUDGET_STEPS[NICE_BUDGET_STEPS.length - 1];
  const bucketCount = Math.ceil(max / step);
  const counts = new Array(bucketCount).fill(0);

  for (const budget of budgets) {
    const index = Math.min(Math.floor(budget / step), bucketCount - 1);
    counts[index] += 1;
  }

  return counts
    .map((count, index) => {
      const from = index * step;
      const to =
        index === bucketCount - 1 ? max : Math.min((index + 1) * step, max);
      return { from, to, count };
    })
    .filter((range) => range.count > 0);
}

function computePercentages(items) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return items.map(() => 0);

  const exact = items.map((item) => (item.count / total) * 100);
  const percentages = exact.map((value) => Math.floor(value));
  let remaining = 100 - percentages.reduce((sum, value) => sum + value, 0);

  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remaining; i += 1) {
    percentages[order[i].index] += 1;
  }

  return percentages;
}

function buildEventsByType(eventDocs) {
  const counts = new Map();

  for (const doc of eventDocs) {
    const rawType = doc.eventType || "";
    const label =
      EVENT_TYPE_LABELS.get(rawType) || UNKNOWN_TYPE_LABEL;
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  const entries = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
  const percentages = computePercentages(entries);

  return entries.map((entry, index) => ({
    label: entry.label,
    count: entry.count,
    percentage: percentages[index],
  }));
}

export async function getAdminStats() {
  const [profiles, eventsSnapshot] = await Promise.all([
    listUserProfiles(),
    getDb().collection("events").get(),
  ]);

  const eventDocs = eventsSnapshot.docs.map((doc) => doc.data());
  const budgets = [];
  let budgetsWithoutValue = 0;

  for (const doc of eventDocs) {
    const budget = toAmount(doc.budget);
    if (budget > 0) {
      budgets.push(budget);
    } else {
      budgetsWithoutValue += 1;
    }
  }
  budgets.sort((a, b) => a - b);

  return {
    totalUsers: profiles.length,
    totalEvents: eventsSnapshot.size,
    usersPerMonth: countByMonth(profiles, "createdAt"),
    eventsPerMonth: countByMonth(eventDocs, "createdAt"),
    budgetRanges: buildBudgetRanges(budgets),
    budgetsWithoutValue,
    eventsByType: buildEventsByType(eventDocs),
  };
}