import { cookies } from "next/headers";
import { listUserEvents } from "./events";

export const ACTIVE_EVENT_COOKIE = "__active_event";

export async function getActiveEventId(user, events) {
  const owned = events ?? (await listUserEvents(user.uid));
  const value = (await cookies()).get(ACTIVE_EVENT_COOKIE)?.value;

  if (value && owned.some((event) => event.id === value)) {
    return value;
  }

  return owned[0]?.id || null;
}

export async function getActiveEvent(user, events) {
  const owned = events ?? (await listUserEvents(user.uid));
  const id = await getActiveEventId(user, owned);
  return owned.find((event) => event.id === id) || null;
}