import Link from "next/link";
import { Users } from "lucide-react";

export default function GuestsPanel({ guests }) {
  const total = guests.reduce((sum, g) => sum + g.quantity, 0);
  const confirmed = guests
    .filter((g) => g.status === "confirmado")
    .reduce((sum, g) => sum + (g.confirmedCount || g.quantity), 0);

  return (
    <div className="rounded-xl border border-accent bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary/15">
          <Users className="size-5 text-secondary" />
        </div>
        <h3 className="text-sm font-semibold text-ink">Invitados y mesas</h3>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-ink">{confirmed}</span>
        <span className="text-lg text-brand">/</span>
        <span className="text-4xl font-bold text-ink">{total}</span>
      </div>
      <p className="mt-1 text-xs uppercase tracking-wider text-brand">
        confirmados / invitados
      </p>

      <Link
        href="/dashboard/invitados"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md border border-accent bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
      >
        Organizar invitados y mesas
      </Link>
    </div>
  );
}
