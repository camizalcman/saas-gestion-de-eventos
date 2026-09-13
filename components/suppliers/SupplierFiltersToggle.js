"use client";

import { useState } from "react";
import SupplierFilters from "@/components/suppliers/SupplierFilters";

export default function SupplierFiltersToggle({ filters }) {
  const [open, setOpen] = useState(false);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <button
          aria-controls="supplier-filters-panel"
          aria-expanded={open}
          className="inline-flex h-11 w-full items-center justify-center border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10 sm:w-auto"
          type="button"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Ocultar filtros" : "Filtrar proveedores"}
          {activeFilters ? ` (${activeFilters})` : ""}
        </button>
      </div>

      {open ? (
        <div className="mt-4" id="supplier-filters-panel">
          <SupplierFilters filters={filters} />
        </div>
      ) : null}
    </div>
  );
}
