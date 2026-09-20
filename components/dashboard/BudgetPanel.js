import Link from "next/link";
import { Wallet } from "lucide-react";

export default function BudgetPanel() {
  return (
    <div className="rounded-xl border border-accent bg-surface p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-secondary/15">
            <Wallet className="size-5 text-secondary" />
          </div>
          <h3 className="text-sm font-semibold text-ink">Presupuesto</h3>
        </div>

        <Link
          href="/dashboard/presupuesto"
          className="rounded-md border border-accent bg-surface px-4 py-2 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        >
          Gestionar presupuesto
        </Link>
      </div>

      <div className="mt-5">
        <span className="text-4xl font-bold text-ink">$0</span>
        <p className="mt-1 text-xs uppercase tracking-wider text-brand">
          total estimado
        </p>
      </div>
    </div>
  );
}
