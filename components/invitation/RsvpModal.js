"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmAttendance } from "@/app/events/actions";

export default function RsvpModal({ eventId, palette, open, onClose }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const accent = palette.colors.cta;
  const ctaText = palette.colors.ctaText;

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await confirmAttendance(eventId, formData);
      setDone(true);
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "No se pudo confirmar la asistencia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg p-6 shadow-xl" style={{ backgroundColor: palette.colors.card }}>
        {done ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold" style={{ color: palette.colors.ink }}>
              ¡Gracias por confirmar!
            </h3>
            <p className="mt-2 text-sm" style={{ color: palette.colors.muted }}>
              Tu asistencia fue registrada. Quedamos a la espera de verte.
            </p>
            <button
              className="mt-5 rounded-md px-5 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: accent, color: ctaText }}
              type="button"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: palette.colors.ink }}>
                Confirmar asistencia
              </h3>
              <p className="mt-1 text-sm" style={{ color: palette.colors.muted }}>
                Contanos quién va a asistir al evento.
              </p>
            </div>

            <label className="grid gap-1.5 text-sm font-medium" style={{ color: palette.colors.ink }}>
              Nombre
              <input
                className="h-11 rounded-md border px-3 outline-none"
                style={{ borderColor: palette.colors.accent, backgroundColor: palette.colors.bg, color: palette.colors.ink }}
                name="name"
                required
                disabled={loading}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" style={{ color: palette.colors.ink }}>
              Cantidad de personas
              <input
                className="h-11 rounded-md border px-3 outline-none"
                style={{ borderColor: palette.colors.accent, backgroundColor: palette.colors.bg, color: palette.colors.ink }}
                name="guests"
                type="number"
                min="1"
                defaultValue="1"
                disabled={loading}
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium" style={{ color: palette.colors.ink }}>
              Mensaje (opcional)
              <textarea
                className="min-h-16 resize-y rounded-md border px-3 py-2 outline-none"
                style={{ borderColor: palette.colors.accent, backgroundColor: palette.colors.bg, color: palette.colors.ink }}
                name="message"
                disabled={loading}
              />
            </label>

            {error ? (
              <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            ) : null}

            <div className="flex justify-between gap-3">
              <button
                className="rounded-md border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: palette.colors.accent, color: palette.colors.muted }}
                type="button"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className="rounded-md px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                style={{ backgroundColor: accent, color: ctaText }}
                type="submit"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
