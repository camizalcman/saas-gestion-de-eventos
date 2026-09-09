"use client";

import { EVENT_TYPES } from "@/lib/events/constants";
import {
  Baby,
  Balloon,
  Cake,
  Cross,
  Gift,
  GraduationCap,
  Sparkles,
  Gem,
  GlassWater,
  Star,
  UserCheck,
  UserRound,
  Church,
} from "lucide-react";

const iconProps = { className: "size-4", strokeWidth: 1.8, "aria-hidden": true };

const TYPE_ICONS = {
  casamiento: <Gem {...iconProps} />,
  fiesta_de_15: <Star {...iconProps} />,
  cumpleaños: <Cake {...iconProps} />,
  cumpleaños_infantil: <Balloon {...iconProps} />,
  bar_mitzvah: <UserRound {...iconProps} />,
  bat_mitzvah: <UserCheck {...iconProps} />,
  brit_milah: <Baby {...iconProps} />,
  simchat_bat: <Baby {...iconProps} />,
  bautismo: <Cross {...iconProps} />,
  comunión: <Church {...iconProps} />,
  aniversario: <GlassWater {...iconProps} />,
  fiesta_de_recibida: <GraduationCap {...iconProps} />,
  baby_shower: <Gift {...iconProps} />,
  otro: <Sparkles {...iconProps} />,
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
          minLength={3}
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
