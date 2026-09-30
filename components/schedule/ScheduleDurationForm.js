"use client";

import { useState, useTransition } from "react";

export default function ScheduleDurationForm({ action, duration = "" }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(false);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      await action(formData);
      setSaved(true);
    });
  }

  return (
    <form className="flex flex-wrap items-center gap-2" onSubmit={handleSubmit}>
      <input
        aria-label="Duración total estimada"
        className="h-10 min-w-0 flex-1 rounded-md border border-accent bg-surface px-3 text-sm text-ink outline-none transition focus:border-secondary sm:max-w-xs"
        defaultValue={duration}
        name="duration"
        placeholder="Ej. 6 horas"
        type="text"
      />
      <button
        className="h-10 rounded-md border border-secondary bg-secondary px-3 text-xs font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Guardando..." : "Guardar"}
      </button>
      {saved ? <span className="text-xs text-secondary">Guardado</span> : null}
    </form>
  );
}
