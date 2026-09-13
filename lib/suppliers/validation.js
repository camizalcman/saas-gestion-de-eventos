import {
  enumInput,
  optionalText,
  pathOrUrl,
  requiredText,
  storagePath,
} from "@/lib/validation";
import { SUPPLIER_CATEGORIES } from "./constants";

const SUPPLIER_CATEGORY_VALUES = SUPPLIER_CATEGORIES.map(
  (category) => category.value,
);

function optionalPhone(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  const digits = text.replace(/\D/g, "");

  if (
    text.length > 30 ||
    digits.length < 7 ||
    !/^\+?[0-9().\s-]+$/.test(text)
  ) {
    throw new Error("El WhatsApp tiene un formato invalido.");
  }

  return text;
}

export function validateSupplier(data) {
  return {
    name: requiredText(data.name, {
      label: "El nombre",
      min: 2,
      max: 120,
    }),
    description: optionalText(data.description, {
      label: "La descripcion",
      max: 2000,
    }),
    category: enumInput(data.category, {
      label: "La categoria",
      allowed: SUPPLIER_CATEGORY_VALUES,
      required: true,
    }),
    locality: requiredText(data.locality, {
      label: "La localidad",
      min: 2,
      max: 100,
    }),
    province: requiredText(data.province, {
      label: "La provincia",
      min: 2,
      max: 100,
    }),
    whatsapp: optionalPhone(data.whatsapp),
    instagram: pathOrUrl(data.instagram, {
      label: "El Instagram",
      max: 500,
    }),
    website: pathOrUrl(data.website, {
      label: "El sitio web",
      max: 500,
    }),
    imageUrl: pathOrUrl(data.imageUrl, {
      label: "La imagen",
      max: 1000,
    }),
    imagePath: storagePath(data.imagePath, {
      label: "La imagen",
    }),
  };
}
