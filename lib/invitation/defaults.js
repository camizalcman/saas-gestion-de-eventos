import { defaultMessage } from "./message";

export const EMPTY_INVITATION = {
  heroImageUrl: "",
  heroImagePath: "",
  names: "",
  message: "",
  personalText: "",
  date: "",
  time: "",
  venue: "",
  mapUrl: "",
  dressCode: "",
  gallery: [],
  giftEnabled: false,
  giftAlias: "",
  closingText: "",
  palette: "clasico",
  typography: "elegante",
};

function formatDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

/**
 * Arma el estado inicial de la invitación precargando los datos que
 * ya pudieron completarse en el onboarding (protagonistas, fecha, tipo de evento).
 */
export function makeInvitationDefaults(event = {}) {
  const protagonists = Array.isArray(event.protagonists)
    ? event.protagonists.join(" y ")
    : "";

  const typeHint = {
    eventType: event.eventType || "",
    customEventType: event.customEventType || "",
  };

  return {
    ...EMPTY_INVITATION,
    names: protagonists,
    date: formatDateInputValue(event.date) || "",
    message: defaultMessage(typeHint),
  };
}
