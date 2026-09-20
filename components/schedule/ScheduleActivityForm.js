"use client";

import { useState } from "react";

const inputClassName =
  "h-11 w-full border border-accent bg-surface px-3 text-sm text-ink outline-none transition focus:border-secondary";

export default function ScheduleActivityForm({
  action,
  initialActivity = null,
  onCancel,
  onSuccess,
  providers = [],
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProviderIds, setSelectedProviderIds] = useState(
    initialActivity?.providerIds || [],
  );

  function toggleProvider(providerId) {
    setSelectedProviderIds((currentIds) =>
      currentIds.includes(providerId)
        ? currentIds.filter((id) => id !== providerId)
        : [...currentIds, providerId],
    );
  }

  async function handleSubmit(formEvent) {
    formEvent.preventDefault();
    setError("");
    setLoading(true);
    const form = formEvent.currentTarget;

    try {
      const formData = new FormData(form);
      await action(formData);
      form.reset();
      setSelectedProviderIds([]);
      onSuccess?.();
    } catch (submissionError) {
      setError(submissionError.message || "No se pudo agregar la actividad.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="grid gap-5 border border-accent bg-surface p-5"
      onSubmit={handleSubmit}
    >
      <div>
        <h3 className="text-lg font-semibold text-ink">
          {initialActivity ? "Editar actividad" : "Nueva actividad"}
        </h3>
        <p className="mt-1 text-sm leading-6 text-brand">
          Organizá un momento del evento y vinculá los proveedores que participan.
        </p>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Título de la actividad o momento</span>
        <input
          className={inputClassName}
          defaultValue={initialActivity?.title || ""}
          name="title"
          placeholder="Ej. Recepción de invitados"
          required
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Hora de inicio</span>
          <input
            className={inputClassName}
            defaultValue={initialActivity?.startTime || ""}
            name="startTime"
            required
            type="time"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Hora de finalización</span>
          <input
            className={inputClassName}
            defaultValue={initialActivity?.endTime || ""}
            name="endTime"
            required
            type="time"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Descripción o detalles <span className="font-normal text-brand">(opcional)</span></span>
        <textarea
          className="min-h-24 resize-y border border-accent bg-surface px-3 py-3 text-sm text-ink outline-none transition focus:border-secondary"
          defaultValue={initialActivity?.description || ""}
          name="description"
          placeholder="Agregá indicaciones o información importante"
        />
      </label>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-ink">Proveedores asociados</legend>
        {providers.length === 0 ? (
          <p className="text-sm leading-6 text-brand">
            Todavía no hay proveedores agregados a este evento.
          </p>
        ) : (
          <div className="grid gap-2">
            {providers.filter((provider) => !provider.deleted).map((provider) => {
              const selected = selectedProviderIds.includes(provider.id);

              return (
                <button
                  aria-pressed={selected}
                  className={`flex min-h-11 items-center justify-between gap-3 border px-3 py-2 text-left text-sm transition ${
                    selected
                      ? "border-secondary bg-secondary/10 text-ink"
                      : "border-accent bg-surface text-brand hover:border-secondary"
                  }`}
                  key={provider.id}
                  onClick={() => toggleProvider(provider.id)}
                  type="button"
                >
                  <span className="min-w-0 overflow-wrap-anywhere font-medium">
                    {provider.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center border text-xs font-semibold ${
                      selected
                        ? "border-secondary bg-secondary text-surface"
                        : "border-accent text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {selectedProviderIds.map((providerId) => (
          <input key={providerId} name="providerIds" type="hidden" value={providerId} />
        ))}
      </fieldset>

      <label className="flex items-center justify-between gap-4 text-sm font-medium text-ink">
        <span>Color de la actividad</span>
        <input
          aria-label="Color de la actividad"
          className="size-11 cursor-pointer border border-accent bg-surface p-1"
          defaultValue={initialActivity?.color || "#B58B63"}
          name="color"
          type="color"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="h-11 border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90"
          disabled={loading}
          type="submit"
        >
          {loading
            ? "Guardando..."
            : initialActivity
              ? "Guardar cambios"
              : "Agregar actividad"}
        </button>
        {initialActivity ? (
          <button
            className="h-11 border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
            disabled={loading}
            onClick={onCancel}
            type="button"
          >
            Cancelar
          </button>
        ) : null}
      </div>

      {initialActivity ? (
        <input name="activityId" type="hidden" value={initialActivity.id} />
      ) : null}

      {error ? (
        <p className="border border-brand/40 bg-brand/10 p-3 text-sm leading-6 text-brand">
          {error}
        </p>
      ) : null}
    </form>
  );
}
