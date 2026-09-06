const PLURAL_EVENT_TYPES = new Set([
  "casamiento",
  "aniversario",
]);

const TYPE_LABELS = {
  casamiento: "casamiento",
  fiesta_de_15: "fiesta de 15",
  cumpleaños: "cumpleaños",
  cumpleaños_infantil: "cumpleaños infantil",
  bar_mitzvah: "bar mitzvah",
  bat_mitzvah: "bat mitzvah",
  brit_milah: "brit milah",
  simchat_bat: "simchat bat",
  bautismo: "bautismo",
  comunión: "comunión",
  aniversario: "aniversario",
  fiesta_de_recibida: "fiesta de recibida",
  baby_shower: "baby shower",
};

function labelForType(eventType, customEventType) {
  if (eventType === "otro") {
    return customEventType || "evento";
  }
  return TYPE_LABELS[eventType] || eventType || "evento";
}

/**
 * Genera el mensaje de la invitación según el tipo de evento.
 * Plural (casamiento, aniversario, baby shower) usa "te invitamos a nuestro ...".
 * Singular usa "te invito a mi/el ...".
 */
export function defaultMessage({ eventType, customEventType }) {
  const plural = PLURAL_EVENT_TYPES.has(eventType);
  const label = labelForType(eventType, customEventType);

  if (plural) {
    return `Te invitamos a nuestro ${label}`;
  }
  return `Te invito a mi ${label}`;
}
