"use client";

import { EVENT_TYPES } from "@/lib/events/constants";

const svgProps = { className: "size-4", fill: "none", stroke: "currentColor", strokeWidth: 1.8, viewBox: "0 0 24 24", "aria-hidden": true };

const RingsIcon = (
  <svg {...svgProps}>
    <circle cx="10.5" cy="9.5" r="4.5" />
    <circle cx="13.5" cy="9.5" r="4.5" />
  </svg>
);

const PartyPopperIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.8 11.1 2 18l6.9-3.8M17.3 8.4c.9.6 1.3 1 1.8 2a2.5 2.5 0 0 0 3-1.2M21 4c-2 .4-3.6 1.2-4.9 2.5C13.8 8.8 12 13 12 13s4.2-1.8 6.5-4.1A7.8 7.8 0 0 0 21 4ZM9 13a6 6 0 0 0 3.4 2M5 8l4-4M14 7l-3 3M9 15c0 1 2.5 3 2.5 3" />
  </svg>
);

const BirthdayHatIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 13l-1.5 8a1 1 0 0 0 1 1.2h9a1 1 0 0 0 1-1.2L16 13M9 13h6M10 13l.7-3.5a3 3 0 0 1 2.6 0L14 13M11.5 5.5v2M12 3.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
  </svg>
);

const UserIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21a8 8 0 0 1 16 0" />
  </svg>
);

const UserCheckIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M15 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-2 6 3 3 5-5" />
  </svg>
);

const BabyIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 4h2v5a3 3 0 0 1-3 3 3 3 0 0 1-3-3V7h2M9 10H6.5A1.5 1.5 0 0 0 5 11.5v.5a2 2 0 0 0 2 2M15 10h2.5A1.5 1.5 0 0 1 19 11.5v.5a2 2 0 0 1-2 2M12 17v3M7 21l1-2h8l1 2" />
  </svg>
);

const CrossIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5V4Z" />
  </svg>
);

const WineIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v5.5a4 4 0 0 0 8 0V3M9 3h8M12 9v5M7 21h10M12 14v7" />
  </svg>
);

const GraduationCapIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 10 12 5 2 10l10 5 10-5Zm0 0v6M6 12.5V16c0 1.1 2.7 2 6 2s6-.9 6-2v-3.5" />
  </svg>
);

const SparklesIcon = (
  <svg {...svgProps}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Zm6 9 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2ZM5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14Z" />
  </svg>
);

const TYPE_ICONS = {
  casamiento: RingsIcon,
  fiesta_de_15: PartyPopperIcon,
  cumpleaños: <svg {...svgProps}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 0 1-3 0 2.704 2.704 0 0 0-3 0 2.704 2.704 0 0 1-3 0 2.704 2.704 0 0 0-3 0 2.704 2.704 0 0 1-3 0 2.701 2.701 0 0 0-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7h18Zm-3-9V10a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2h6Z" /></svg>,
  cumpleaños_infantil: BirthdayHatIcon,
  bar_mitzvah: UserIcon,
  bat_mitzvah: UserCheckIcon,
  brit_milah: BabyIcon,
  simchat_bat: BabyIcon,
  bautismo: CrossIcon,
  comunión: UserIcon,
  aniversario: WineIcon,
  fiesta_de_recibida: GraduationCapIcon,
  baby_shower: BabyIcon,
  otro: SparklesIcon,
};

export default function Step1Identity({ form, updateField, onNext }) {
  const selected = form.eventType;

  function handleSelect(value) {
    updateField("eventType", value);
    if (value !== "otro") updateField("customEventType", "");
  }

  return (
    <section className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-ink sm:text-2xl">Identidad del evento</h2>
        <p className="mt-1 text-sm text-brand">Contanos qué tipo de celebración vas a organizar.</p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Título del evento</span>
        <input
          className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none focus:border-secondary"
          name="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Descripción</span>
        <textarea
          className="min-h-20 resize-y rounded-md border border-accent bg-surface px-3 py-3 text-ink outline-none focus:border-secondary"
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Contanos un poco más sobre el evento..."
        />
      </label>

      <div>
        <span className="text-sm font-medium text-ink">Tipo de evento</span>
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {EVENT_TYPES.map((type) => {
            const isSelected = selected === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleSelect(type.value)}
                className={`flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium leading-none transition ${
                  isSelected
                    ? "border-brand bg-brand text-surface"
                    : "border-accent bg-surface text-brand hover:border-secondary hover:bg-secondary/10"
                }`}
              >
                <span className="shrink-0">{TYPE_ICONS[type.value]}</span>
                <span className="truncate">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selected === "otro" && (
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Especificar tipo de evento</span>
          <input
            className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none focus:border-secondary"
            name="customEventType"
            value={form.customEventType}
            onChange={(e) => updateField("customEventType", e.target.value)}
            placeholder="Ej: Reinado, Jubilación..."
          />
        </label>
      )}

      <button
        className="h-11 w-full rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition enabled:hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={onNext}
        disabled={!form.title.trim() || !selected}
      >
        Siguiente
      </button>
    </section>
  );
}
