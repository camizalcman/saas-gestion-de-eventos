"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SupplierSearchBar({ defaultValue, category, province, locality }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue || "");

  function buildBase() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (province) params.set("province", province);
    if (locality) params.set("locality", locality);
    const qs = params.toString();
    return qs ? `/dashboard/suppliers?${qs}` : "/dashboard/suppliers";
  }

  function handleClear() {
    setValue("");
    router.push(buildBase());
  }

  return (
    <>
    <style>{`input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; }`}</style>
    <form
      action={buildBase()}
      className="mt-8 flex gap-3"
      method="get"
    >
      {category ? <input name="category" type="hidden" value={category} /> : null}
      {province ? <input name="province" type="hidden" value={province} /> : null}
      {locality ? <input name="locality" type="hidden" value={locality} /> : null}
      <div className="relative min-w-0 flex-1">
        <input
          className="h-11 w-full border border-accent bg-surface px-4 pr-10 text-sm text-ink outline-none transition placeholder:text-brand/60 focus:border-secondary"
          name="search"
          onChange={(e) => setValue(e.target.value)}
          placeholder="Buscar por nombre, categoría o ubicación..."
          type="search"
          value={value}
        />
        {value ? (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/60 transition hover:text-ink"
            onClick={handleClear}
            type="button"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
      <button
        className="h-11 shrink-0 border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition hover:bg-secondary/90"
        type="submit"
      >
        Buscar
      </button>
    </form>
    </>
  );
}
