"use client";

import { useRef, useState, useTransition } from "react";
import { useToast } from "@/components/ToastProvider";
import { SUPPLIER_CATEGORIES } from "@/lib/suppliers/constants";

const inputClass =
  "h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary";

export default function ProviderForm({ action }) {
  const formRef = useRef(null);
  const showToast = useToast();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);
        formRef.current?.reset();
        showToast("Proveedor agregado a tu evento");
      } catch (submitError) {
        setError(submitError?.message || "No se pudo agregar el proveedor.");
      }
    });
  }

  return (
    <form
      className="grid min-w-0 gap-3 border border-accent p-4 sm:p-5"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-end">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Proveedor</span>
          <input
            className={inputClass}
            maxLength={120}
            minLength={2}
            name="name"
            placeholder="Ej. Salón Teresita"
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Categoria</span>
          <select
            className={inputClass}
            name="category"
            required
          >
            {SUPPLIER_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>WhatsApp</span>
          <input
            className={inputClass}
            maxLength={60}
            name="whatsapp"
            placeholder="Ej. +54 9 11 2345-6789"
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Instagram</span>
          <input
            className={inputClass}
            maxLength={120}
            name="instagram"
            placeholder="Ej. @salonteresita"
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Sitio web</span>
          <input
            className={inputClass}
            maxLength={200}
            name="website"
            placeholder="Ej. https://..."
            type="text"
          />
        </label>
      </div>

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
        {isPending ? "Agregando..." : "Agregar proveedor"}
      </button>
    </form>
  );
}