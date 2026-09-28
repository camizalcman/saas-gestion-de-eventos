"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import SupplierFilters from "@/components/suppliers/SupplierFilters";

export default function SupplierFiltersToggle({ filters }) {
  const [open, setOpen] = useState(false);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex shrink-0 justify-start">
        <button
          aria-label={open ? "Ocultar filtros" : "Mostrar filtros"}
          aria-controls="supplier-filters-panel"
          aria-expanded={open}
          className="relative inline-flex size-11 items-center justify-center rounded-full border border-accent bg-surface text-ink transition hover:border-secondary hover:bg-secondary/10"
          title={open ? "Ocultar filtros" : "Mostrar filtros"}
          type="button"
          onClick={() => setOpen((current) => !current)}
        >
          <Filter aria-hidden="true" className="size-4" />
          {activeFilters ? (
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-secondary text-[10px] font-bold text-surface">
              {activeFilters}
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div className="min-w-0 flex-1" id="supplier-filters-panel">
          <SupplierFilters filters={filters} />
        </div>
      ) : null}
    </div>
  );
}
