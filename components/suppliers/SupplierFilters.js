import Link from "next/link";
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
      className="grid gap-4 border border-accent p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
      method="get"
    >
      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span>Categoria</span>
        <select
          className="h-11 border border-accent bg-surface px-3 font-normal text-ink outline-none transition focus:border-secondary"
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

      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span>Provincia</span>
        <select
          className="h-11 border border-accent bg-surface px-3 font-normal text-ink outline-none transition placeholder:text-brand/60 focus:border-secondary"
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

      <label className="grid gap-2 text-sm font-semibold text-ink">
        <span>Localidad</span>
        <input
          className="h-11 border border-accent bg-surface px-3 font-normal text-ink outline-none transition placeholder:text-brand/60 focus:border-secondary"
          defaultValue={filters.locality}
          name="locality"
          placeholder="Ej: Godoy Cruz"
          type="search"
        />
      </label>

      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
        <button
          className="h-11 border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90"
          type="submit"
        >
          Aplicar filtros
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
