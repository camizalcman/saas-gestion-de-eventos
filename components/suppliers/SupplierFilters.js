"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_PROVINCES,
} from "@/lib/suppliers/constants";

const GALLERY_PATH = "/dashboard/proveedores/galeria";

export default function SupplierFilters({ filters }) {
  const router = useRouter();
  const hasFilters = Boolean(
    filters.category || filters.province || filters.locality,
  );

  function applyFilters(form) {
    const params = new URLSearchParams();

    for (const [key, value] of new FormData(form)) {
      const text = String(value).trim();
      if (text) params.set(key, text);
    }

    const qs = params.toString();
    router.push(qs ? `${GALLERY_PATH}?${qs}` : GALLERY_PATH);
  }

  function applyLocality(input) {
    if (input.value.trim() !== (filters.locality || "")) {
      applyFilters(input.form);
    }
  }

  return (
    <form
      action={GALLERY_PATH}
      className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters(event.currentTarget);
      }}
    >
      {filters.search ? <input name="search" type="hidden" value={filters.search} /> : null}
      <label className="grid min-w-0 gap-2 text-sm font-semibold text-ink">
        <span>Categoria</span>
        <select
          className="h-11 w-full min-w-0 rounded-lg border border-accent bg-surface px-3 font-normal text-ink outline-none transition focus:border-secondary"
          defaultValue={filters.category}
          name="category"
          onChange={(event) => applyFilters(event.currentTarget.form)}
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
          onChange={(event) => applyFilters(event.currentTarget.form)}
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
          onBlur={(event) => applyLocality(event.currentTarget)}
          onChange={(event) => {
            if (event.currentTarget.value === "") applyLocality(event.currentTarget);
          }}
          placeholder="Ej: Godoy Cruz"
          type="search"
        />
      </label>

      {hasFilters ? (
        <div className="flex min-w-0 items-center justify-center sm:col-span-2 lg:col-span-1">
          <Link
            className="inline-flex h-11 items-center justify-center text-sm font-semibold text-brand underline-offset-4 hover:underline"
            href={
              filters.search
                ? `${GALLERY_PATH}?search=${encodeURIComponent(filters.search)}`
                : GALLERY_PATH
            }
          >
            Limpiar filtros
          </Link>
        </div>
      ) : null}
    </form>
  );
}
