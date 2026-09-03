"use client";

export default function Step2Details({ form, updateField, onBack, onNext }) {
  return (
    <section className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Detalles</h2>
        <p className="mt-1 text-sm text-brand">Completá la info del evento. Podés omitirla si todavía no la tenés.</p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Protagonistas</span>
        <input
          className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none focus:border-secondary"
          name="protagonists"
          value={form.protagonists}
          onChange={(e) => updateField("protagonists", e.target.value)}
          placeholder="Nombre del o los protagonistas"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Fecha del evento</span>
        <input
          className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none focus:border-secondary"
          name="date"
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Ubicación</span>
        <input
          className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none focus:border-secondary"
          name="location"
          value={form.location}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Salón o dirección"
        />
      </label>

      <div className="mt-auto flex items-center justify-between gap-3">
        <button
          className="h-11 rounded-md border border-accent px-5 text-sm font-semibold text-brand transition hover:bg-accent/40"
          type="button"
          onClick={onBack}
        >
          Atrás
        </button>
        <button
          className="h-11 rounded-md border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition hover:bg-secondary/90"
          type="button"
          onClick={onNext}
        >
          Continuar
        </button>
      </div>
    </section>
  );
}
