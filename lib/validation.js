export function requiredText(value, { label, min = 1, max = 500, requiredMessage }) {
  const text = String(value ?? "").trim();

  if (!text) {
    throw new Error(requiredMessage || `${label} es obligatorio.`);
  }

  if (text.length < min) {
    throw new Error(`${label} debe tener al menos ${min} caracteres.`);
  }

  if (text.length > max) {
    throw new Error(`${label} no puede superar los ${max} caracteres.`);
  }

  return text;
}

export function optionalText(value, { label, max = 500 }) {
  const text = String(value ?? "").trim();

  if (text.length > max) {
    throw new Error(`${label} no puede superar los ${max} caracteres.`);
  }

  return text;
}

export function emailInput(value, { label = "El email", required = false }) {
  const text = String(value ?? "").trim();

  if (!text) {
    if (required) {
      throw new Error(`${label} es obligatorio.`);
    }

    return "";
  }

  if (text.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    throw new Error(`${label} no es valido.`);
  }

  return text;
}

export function passwordInput(
  value,
  { label = "La contrasena", required = false, min = 6, max = 72 },
) {
  const text = String(value ?? "");

  if (!text) {
    if (required) {
      throw new Error(`${label} es obligatoria.`);
    }

    return "";
  }

  if (text.length < min || text.length > max) {
    throw new Error(`${label} debe tener entre ${min} y ${max} caracteres.`);
  }

  return text;
}

export function pathOrUrl(
  value,
  { label, required = false, requiredMessage, max = 1000 },
) {
  const text = String(value ?? "").trim();

  if (!text) {
    if (required) {
      throw new Error(requiredMessage || `${label} es obligatorio.`);
    }

    return "";
  }

  if (text.startsWith("//")) {
    throw new Error(`${label} tiene un formato invalido.`);
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) {
    let parsed;

    try {
      parsed = new URL(text);
    } catch {
      throw new Error(`${label} tiene un formato invalido.`);
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error(`${label} debe ser una ruta local o una URL http/https.`);
    }
  } else if (!text.startsWith("/")) {
    throw new Error(`${label} debe ser una ruta local o una URL http/https.`);
  }

  if (text.length > max) {
    throw new Error(`${label} no puede superar los ${max} caracteres.`);
  }

  return text;
}

export function storagePath(value, { label, max = 500 }) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9/_.-]*$/.test(text) || text.length > max) {
    throw new Error(`${label} tiene un formato invalido.`);
  }

  return text;
}

function isValidCalendarDate(text) {
  const [year, month, day] = text.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day, 12));

  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

export function dateInput(value, { label, required = false }) {
  const text = String(value ?? "").trim();

  if (!text) {
    if (required) {
      throw new Error(`${label} es obligatoria.`);
    }

    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || !isValidCalendarDate(text)) {
    throw new Error(`${label} tiene un formato invalido.`);
  }

  return text;
}

export function datetimeInput(value, { label, required = false }) {
  const text = String(value ?? "").trim();

  if (!text) {
    if (required) {
      throw new Error(`${label} es obligatoria.`);
    }

    return "";
  }

  const dateOnlyMatch = text.match(/^(\d{4}-\d{2}-\d{2})$/);
  const dateTimeMatch = text.match(
    /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d$/,
  );
  const datePart = dateOnlyMatch?.[1] || dateTimeMatch?.[1];

  if (!datePart || !isValidCalendarDate(datePart)) {
    throw new Error(`${label} tiene un formato invalido.`);
  }

  return text;
}

export function timeInput(value, { label, required = false }) {
  const text = String(value ?? "").trim();

  if (!text) {
    if (required) {
      throw new Error(`${label} es obligatorio.`);
    }

    return "";
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) {
    throw new Error(`${label} tiene un formato invalido.`);
  }

  return text;
}

export function enumInput(value, { label, allowed, required = false }) {
  const text = String(value ?? "").trim();

  if (!text) {
    if (required) {
      throw new Error(`${label} es obligatorio.`);
    }

    return "";
  }

  if (!allowed.includes(text)) {
    throw new Error(`${label} tiene un valor invalido.`);
  }

  return text;
}

export function booleanInput(value) {
  return ["on", "true", "1"].includes(String(value ?? "").toLowerCase());
}

export function integerInput(value, { label, min, max }) {
  const text = String(value ?? "").trim();

  if (!/^[+-]?\d+$/.test(text)) {
    throw new Error(`${label} debe ser un numero entero.`);
  }

  const number = Number(text);
  const boundsMin = Number.isInteger(min) ? min : -Infinity;
  const boundsMax = Number.isInteger(max) ? max : Infinity;

  if (number < boundsMin || number > boundsMax) {
    throw new Error(
      `${label} debe ser un numero entre ${boundsMin} y ${boundsMax}.`,
    );
  }

  return number;
}

export function nameListInput(value, { label, maxCount = 10, itemMax = 80 }) {
  const text = String(value ?? "").trim();

  if (!text) {
    return [];
  }

  const items = text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length > maxCount) {
    throw new Error(`Se permiten hasta ${maxCount} nombres en ${label}.`);
  }

  if (items.some((item) => item.length > itemMax)) {
    throw new Error(`Cada nombre no puede superar los ${itemMax} caracteres.`);
  }

  return items;
}
