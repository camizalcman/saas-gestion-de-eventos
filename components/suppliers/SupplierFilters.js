import Link from "next/link";
import { Check } from "lucide-react";
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_PROVINCES,
} from "@/lib/suppliers/constants";

export default function SupplierFilters({ filters }) {
  const hasFilters = Boolean(
    filters.category || filters.province || filters.locality,
  );

  return (
    <form
      action="/dashboard/suppliers"
      className="grid min-w-0 gap-3 rounded-2xl border border-accent bg-surface p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
      method="get"
    >
      {filters.search ? <input name="search" type="hidden" value={filters.search} /> : null}
      <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
        <span>Categoria</span>
        <select
          className="h-11 w-full min-w-0 rounded-lg border border-accent bg-surface px-3 font-normal text-ink outline-none transition focus:border-secondary"
          defaultValue={filters.category}
          name="category"
        >
          <option value="">Todas las categorias</option>
          {SUPPLIER_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
        <span>Provincia</span>
        <select
          className="h-11 w-full min-w-0 rounded-lg border border-accent bg-surface px-3 font-normal text-ink outline-none transition placeholder:text-brand/60 focus:border-secondary"
          defaultValue={filters.province}
          name="province"
        >
          <option value="">Todas las provincias</option>
          {SUPPLIER_PROVINCES.map((province) => (
            <option key={province.value} value={province.value}>
              {province.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
        <span>Localidad</span>
        <input
          className="h-11 w-full min-w-0 rounded-lg border border-accent bg-surface px-3 font-normal text-ink outline-none transition placeholder:text-brand/60 focus:border-secondary"
          defaultValue={filters.locality}
          name="locality"
          placeholder="Ej: Godoy Cruz"
          type="search"
        />
      </label>

      <div className="flex min-w-0 flex-col items-center gap-2 sm:col-span-2 lg:col-span-1">
        <button
          aria-label="Aplicar filtros"
          className="inline-flex size-11 items-center justify-center rounded-full border border-secondary bg-secondary text-surface transition hover:bg-secondary/90"
          title="Aplicar filtros"
          type="submit"
        >
          <Check aria-hidden="true" className="size-4" />
        </button>
        {hasFilters ? (
          <Link
            className="inline-flex h-9 items-center justify-center text-sm font-semibold text-brand underline-offset-4 hover:underline"
            href="/dashboard/suppliers"
          >
            Limpiar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}
