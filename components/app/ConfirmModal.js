"use client";

import { useEffect, useId } from "react";
import { TriangleAlert, X } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  pending = false,
  onConfirm,
  onClose,
}) {
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-labelledby={titleId}
      aria-describedby={messageId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand/70 p-4"
      role="dialog"
    >
      <button
        aria-label="Cerrar ventana"
        className="absolute inset-0 h-full w-full cursor-default"
        type="button"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-lg border border-accent bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-accent text-secondary">
              <TriangleAlert aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-lg font-semibold text-ink" id={titleId}>
              {title}
            </h2>
          </div>
          <button
            aria-label="Cerrar ventana"
            className="text-ink transition hover:text-secondary"
            type="button"
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-brand" id={messageId}>
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-10 rounded-md border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={onClose}
            disabled={pending}
          >
            {cancelLabel}
          </button>
          <button
            className="h-10 rounded-md border border-brand/40 bg-brand/10 px-4 text-sm font-semibold text-brand transition hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}