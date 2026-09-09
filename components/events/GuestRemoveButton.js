"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function GuestRemoveButton({ action, guestName }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const cancelRef = useRef(null);

  function closeModal() {
    if (isPending) return;
    setError("");
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isPending) {
        setError("");
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    cancelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isPending]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        await action(formData);
        setOpen(false);
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message || "No se pudo quitar el invitado.",
        );
      }
    });
  }

  return (
    <>
      <button
        className="h-9 border border-brand/40 px-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
        onClick={() => setOpen(true)}
        type="button"
      >
        Quitar
      </button>

      {open ? (
        <div
          aria-labelledby={`remove-guest-title-${guestName}`}
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={handleBackdropClick}
          role="dialog"
        >
          <form
            className="w-full max-w-md rounded-lg border border-accent bg-surface p-6 shadow-xl"
            onSubmit={handleSubmit}
          >
            <h2
              className="text-lg font-semibold text-ink"
              id={`remove-guest-title-${guestName}`}
            >
              ¿Quitar invitado?
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand">
              ¿Estás segura de eliminar a{" "}
              <span className="font-semibold text-ink">{guestName}</span>? Esta
              acción no se puede deshacer.
            </p>
            {error ? (
              <p className="mt-4 rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-brand">
                {error}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="h-10 rounded-md border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                onClick={closeModal}
                ref={cancelRef}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="h-10 rounded-md border border-brand/40 bg-brand/10 px-4 text-sm font-semibold text-brand transition hover:bg-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Quitando..." : "Sí, quitar"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
