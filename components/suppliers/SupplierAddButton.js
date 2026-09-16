"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

export default function SupplierAddButton({ action, supplierName, events }) {
  const router = useRouter();
  const [step, setStep] = useState("idle");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const cancelRef = useRef(null);

  const hasEvents = events.length > 0;
  const hasMultipleEvents = events.length > 1;

  function openSelector() {
    setError("");
    setStep("selecting");
  }

  function closeModal() {
    if (isPending) return;
    setError("");
    setStep("idle");
    setSelectedEvent(null);
  }

  function selectEvent(event) {
    setSelectedEvent(event);
    setError("");
    setStep("confirming");
  }

  useEffect(() => {
    if (step === "idle") return undefined;

    function handleKeyDown(e) {
      if (e.key === "Escape" && !isPending) {
        setError("");
        setStep("idle");
        setSelectedEvent(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    cancelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [step, isPending]);

  useEffect(() => {
    if (!showSuccess) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowSuccess("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSuccess]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const title = await action(selectedEvent?.id);
        setStep("idle");
        setSelectedEvent(null);
        setError("");
        setShowSuccess(title || "");
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message || "No se pudo agregar el proveedor.",
        );
      }
    });
  }

  if (!hasEvents) return null;

  const confirmTitle = selectedEvent?.title || "";

  return (
    <>
      <button
        className="h-9 border border-secondary bg-secondary px-3 text-sm font-semibold text-surface transition hover:bg-secondary/90"
        onClick={hasMultipleEvents ? openSelector : () => { setSelectedEvent(events[0]); setStep("confirming"); }}
        type="button"
      >
        Agregar a mi evento
      </button>

      {showSuccess ? (
        <div
          aria-live="polite"
          className="fixed right-4 top-4 z-[60] border border-secondary bg-secondary px-5 py-3 text-sm font-semibold text-surface shadow-lg sm:right-6 sm:top-6"
          role="status"
        >
          Proveedor agregado al evento - {showSuccess}
        </div>
      ) : null}

      {step === "selecting" ? (
        <div
          aria-labelledby="select-event-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={handleBackdropClick}
          role="dialog"
        >
          <div className="w-full max-w-md rounded-lg border border-accent bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-ink" id="select-event-title">
              Elegí un evento
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand">
              Seleccioná a qué evento querés agregar a{" "}
              <span className="font-semibold text-ink">{supplierName}</span>.
            </p>
            <div className="mt-5 grid gap-2">
              {events.map((event) => (
                <button
                  className="flex w-full items-center justify-between rounded-md border border-accent px-4 py-3 text-left text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
                  key={event.id}
                  onClick={() => selectEvent(event)}
                  type="button"
                >
                  <span className="min-w-0 truncate">{event.title}</span>
                  {event.date ? (
                    <span className="ml-3 shrink-0 text-xs font-normal text-brand">
                      {formatDate(event.date)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                className="h-10 rounded-md border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-accent/40"
                onClick={closeModal}
                ref={cancelRef}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {step === "confirming" ? (
        <div
          aria-labelledby="confirm-add-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={handleBackdropClick}
          role="dialog"
        >
          <form
            className="w-full max-w-md rounded-lg border border-accent bg-surface p-6 shadow-xl"
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg font-semibold text-ink" id="confirm-add-title">
              Agregar proveedor
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand">
              ¿Querés agregar a{" "}
              <span className="font-semibold text-ink">{supplierName}</span>{" "}
              {confirmTitle ? (
                <>al evento <span className="font-semibold text-ink">{confirmTitle}</span>?</>
              ) : (
                "a tu evento?"
              )}
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
                className="h-10 rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Agregando..." : "Agregar"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
