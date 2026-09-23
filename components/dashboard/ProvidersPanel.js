import Link from "next/link";
import { Package } from "lucide-react";
import { SUPPLIER_CATEGORIES } from "@/lib/suppliers/constants";

function categoryLabel(value) {
  if (!value) return "";
  return SUPPLIER_CATEGORIES.find((c) => c.value === value)?.label || value;
}

export default function ProvidersPanel({ providers }) {
  const active = providers.filter((p) => !p.deleted);
  const preview = active.slice(0, 4);

  return (
    <div className="flex h-full flex-col rounded-xl border border-accent bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary/15">
          <Package className="size-5 text-secondary" />
        </div>
        <h3 className="text-sm font-semibold text-ink">Proveedores</h3>
      </div>

      <div className="app-scrollbar mt-4 min-h-0 flex-1 overflow-y-auto">
        {active.length === 0 ? (
          <p className="text-sm text-brand">
            Todavía no hay proveedores cargados.
          </p>
        ) : (
          <ul className="space-y-2">
            {preview.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md border border-accent/50 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate font-medium text-ink">
                  {p.name || "Sin nombre"}
                </span>
                {p.category ? (
                  <span className="shrink-0 text-xs text-brand">
                    {categoryLabel(p.category)}
                  </span>
                ) : null}
              </li>
            ))}
            {active.length > 4 ? (
              <li className="pt-1 text-center text-xs text-brand">
                +{active.length - 4} más
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <Link
        href="/dashboard/proveedores"
        className="mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-md border border-accent bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
      >
        Gestionar proveedores
      </Link>
    </div>
  );
}
