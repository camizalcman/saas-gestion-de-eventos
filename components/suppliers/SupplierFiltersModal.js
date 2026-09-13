"use client";

import { useEffect, useState } from "react";
import SupplierFilters from "@/components/suppliers/SupplierFilters";

export default function SupplierFiltersModal({ filters }) {
  const [open, setOpen] = useState(false);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className="inline-flex h-11 w-full items-center justify-center border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10 sm:w-auto"
        type="button"
        onClick={() => setOpen(true)}
      >
        Filtrar proveedores
        {activeFilters ? ` (${activeFilters})` : ""}
      </button>

      {open ? (
        <div
          aria-labelledby="supplier-filters-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand/70 p-4 sm:p-8"
          role="dialog"
        >
          <button
            aria-label="Cerrar ventana"
            className="absolute inset-0 h-full w-full cursor-default"
            type="button"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 my-auto w-full max-w-2xl border border-accent bg-surface shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-accent p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                  Galeria de proveedores
                </p>
                <h2 className="mt-2 text-xl font-semibold text-ink" id="supplier-filters-modal-title">
                  Filtrar proveedores
                </h2>
              </div>
              <button
                aria-label="Cerrar ventana"
                className="inline-flex size-9 items-center justify-center border border-accent text-lg text-ink transition hover:border-secondary hover:bg-secondary/10"
                type="button"
                onClick={() => setOpen(false)}
              >
                x
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <SupplierFilters filters={filters} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
