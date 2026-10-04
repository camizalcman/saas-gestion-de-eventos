"use client";

import { useState } from "react";
import CoverImagePicker from "@/components/events/CoverImagePicker";

export default function Step3Media({ availableImages, form, updateField, onBack, onCreate, loading }) {
  const [error, setError] = useState("");

  async function handleFinish() {
    setError("");
    try {
      await onCreate();
    } catch (createError) {
      setError(createError.message || "No se pudo guardar el evento.");
    }
  }

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-ink">Foto de portada</h2>
        <p className="mt-1 text-sm text-brand">Elegí la imagen principal. Se mostrará en la portada del evento.</p>
      </div>

      <CoverImagePicker
        availableImages={availableImages}
        selectedUrl={form.imageUrl}
        onSelect={(src) => updateField("imageUrl", src)}
      />

      {error ? <p className="rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-brand">{error}</p> : null}

      <div className="mt-2 flex items-center justify-between gap-3">
        <button
          className="h-12 rounded-md border border-accent px-5 text-sm font-semibold text-brand transition hover:bg-accent/40"
          type="button"
          onClick={onBack}
          disabled={loading}
        >
          Atrás
        </button>
        <button
          className="h-12 rounded-md border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition enabled:hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={handleFinish}
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear evento"}
        </button>
      </div>
    </section>
  );
}
