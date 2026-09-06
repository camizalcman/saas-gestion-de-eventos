import { EMPTY_INVITATION } from "./defaults";

function normalizeGallery(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map(String);
}

export function serializeInvitation(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  return {
    heroImageUrl: String(data.heroImageUrl || ""),
    heroImagePath: String(data.heroImagePath || ""),
    names: String(data.names || ""),
    message: String(data.message || ""),
    personalText: String(data.personalText || ""),
    date: String(data.date || ""),
    time: String(data.time || ""),
    venue: String(data.venue || ""),
    mapUrl: String(data.mapUrl || ""),
    dressCode: String(data.dressCode || ""),
    gallery: normalizeGallery(data.gallery),
    giftEnabled: Boolean(data.giftEnabled),
    giftAlias: String(data.giftAlias || ""),
    closingText: String(data.closingText || ""),
    palette: String(data.palette || EMPTY_INVITATION.palette),
    typography: String(data.typography || EMPTY_INVITATION.typography),
  };
}
