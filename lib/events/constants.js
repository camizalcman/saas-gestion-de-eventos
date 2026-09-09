export const EVENT_TYPES = [
  { value: "casamiento", label: "Casamiento" },
  { value: "fiesta_de_15", label: "Fiesta de 15" },
  { value: "cumpleaños", label: "Cumpleaños" },
  { value: "cumpleaños_infantil", label: "Cumpleaños infantil" },
  { value: "bar_mitzvah", label: "Bar Mitzvah" },
  { value: "bat_mitzvah", label: "Bat Mitzvah" },
  { value: "brit_milah", label: "Brit Milah" },
  { value: "simchat_bat", label: "Simchat Bat" },
  { value: "bautismo", label: "Bautismo" },
  { value: "comunión", label: "Comunión" },
  { value: "aniversario", label: "Aniversario" },
  { value: "fiesta_de_recibida", label: "Fiesta de recibida" },
  { value: "baby_shower", label: "Baby Shower" },
  { value: "otro", label: "Otro" },
];

export const GUEST_STATUSES = [
  { value: "invitado", label: "Sin confirmar" },
  { value: "parcial", label: "Parcial" },
  { value: "confirmado", label: "Confirmado" },
  { value: "rechazado", label: "Rechazado" },
];

export const GUEST_STATUS_VALUES = GUEST_STATUSES.map((status) => status.value);

