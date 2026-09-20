"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

const inputClass =
  "h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary";

function formatMoney(value) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `$${Number(value || 0).toLocaleString("es-AR")}`;
  }
}

export default function BudgetCard({ action, current = 0 }) {
  const router = useRouter();
  const showToast = useToast();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const cancelRef = useRef(null);
  const inputRef = useRef(null);

  const hasBudget = current > 0;

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isPending) {
        setError("");
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    inputRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isPending]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !isPending) {
      setError("");
      setOpen(false);
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
        showToast("Presupuesto guardado");
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message || "No se pudo guardar el presupuesto.",
        );
      }
    });
  }

  return (
    <>
      <article className="rounded-lg bg-secondary p-6 text-surface">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-surface/80">
            Presupuesto establecido
          </span>
          <button
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-surface/40 px-3 text-xs font-semibold text-surface transition hover:bg-surface/20 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => setOpen(true)}
            type="button"
          >
            <Pencil aria-hidden="true" className="size-3.5" />
            {hasBudget ? "Editar" : "Definir"}
          </button>
        </div>
        <strong className="mt-3 block text-2xl font-semibold tabular-nums">
          {hasBudget ? formatMoney(current) : "Sin definir"}
        </strong>
      </article>

      {open ? (
        <div
          aria-labelledby="budget-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={handleBackdropClick}
          role="dialog"
        >
          <form
            className="w-full max-w-md rounded-lg border border-accent bg-surface p-6 shadow-xl"
            onSubmit={handleSubmit}
          >
            <h2 className="text-lg font-semibold text-ink" id="budget-modal-title">
              {hasBudget ? "Actualizar presupuesto" : "Definir presupuesto"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand">
              Ingresá el monto total que tenés pensado gastar en el evento.
            </p>

            <label className="mt-5 grid gap-2 text-sm font-medium text-ink">
              <span>Presupuesto en pesos</span>
              <input
                className={inputClass}
                defaultValue={hasBudget ? String(current) : ""}
                max={10000000000}
                min={0}
                name="budget"
                placeholder="Ej. 5000000"
                ref={inputRef}
                step={1}
                type="number"
              />
            </label>

            {error ? (
              <p className="mt-4 rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="h-10 rounded-md border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                onClick={() => {
                  setError("");
                  setOpen(false);
                }}
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
                {isPending ? "Guardando..." : "Guardar presupuesto"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}