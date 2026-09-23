import Link from "next/link";
import { Wallet } from "lucide-react";

function formatMoney(value) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `$${Number(value || 0).toLocaleString("es-AR")}`;
  }
}

export default function BudgetPanel({ budget = 0 }) {
  return (
    <div className="relative flex h-full flex-col rounded-xl border border-accent bg-surface p-5 sm:p-6">
      <div className="flex items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary/15">
            <Wallet className="size-5 text-secondary" />
          </div>
          <h3 className="text-sm font-semibold text-ink">Presupuesto</h3>
        </div>

      </div>

      <div className="mt-auto flex flex-1 flex-col items-center justify-center gap-1">
        <span className="text-4xl font-bold tabular-nums text-ink">
          {formatMoney(budget)}
        </span>
        <p className="text-xs uppercase tracking-wider text-brand">
          total disponible
        </p>
      </div>

      <Link
        className="mt-4 w-full rounded-md border border-accent bg-surface px-4 py-2 text-center text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10 lg:absolute lg:right-5 lg:top-5 lg:mt-0 lg:w-auto"
        href="/dashboard/presupuesto"
      >
        Gestionar presupuesto
      </Link>
    </div>
  );
}
