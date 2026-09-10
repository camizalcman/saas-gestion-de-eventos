"use client";

import { useRef, useState, useTransition } from "react";
import { useToast } from "@/components/ToastProvider";

const inputClass =
  "h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary";

export default function GuestForm({ action, defaultQuantity = 1 }) {
  const formRef = useRef(null);
  const showToast = useToast();
  const [quantity, setQuantity] = useState(String(defaultQuantity));
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const parsedQuantity = Number.parseInt(quantity, 10);
  const memberCount =
    Number.isInteger(parsedQuantity) && parsedQuantity >= 2
      ? Math.min(parsedQuantity, 50)
      : 0;

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);
        formRef.current?.reset();
        setQuantity(String(defaultQuantity));
        showToast("Invitado agregado a la lista");
      } catch (submitError) {
        setError(submitError?.message || "No se pudo agregar el invitado.");
      }
    });
  }

  return (
    <form
      className="grid min-w-0 gap-3 border border-accent p-4 sm:p-5"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-end">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Nombre del invitado o grupo</span>
          <input
            className={inputClass}
            maxLength={120}
            minLength={2}
            name="name"
            placeholder="Ej. Familia Garcia"
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Cantidad</span>
          <input
            className={inputClass}
            max={50}
            min={1}
            name="quantity"
            onChange={(event) => setQuantity(event.target.value)}
            required
            type="number"
            value={quantity}
          />
        </label>
      </div>

      {memberCount >= 2 ? (
        <div className="grid gap-3">
          <p className="text-sm font-medium text-ink">
            Integrantes
            <span className="ml-2 text-xs font-normal text-brand">
              Completá el nombre de cada persona del grupo.
            </span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: memberCount }).map((_, index) => (
              <label
                className="grid gap-2 text-sm font-medium text-ink"
                key={index}
              >
                <span>Persona {index + 1}</span>
                <input
                  className={inputClass}
                  maxLength={120}
                  minLength={2}
                  name="memberName"
                  placeholder="Nombre y apellido"
                  required
                  type="text"
                />
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      <button
        className="h-11 w-full rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Agregando..." : "Agregar invitado"}
      </button>
    </form>
  );
}
