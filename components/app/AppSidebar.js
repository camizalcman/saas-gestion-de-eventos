"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Package,
  Shield,
  Ticket,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import EventSwitcher from "./EventSwitcher";
import { logout } from "@/app/(app)/dashboard/actions";

const baseItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/invitacion", label: "Invitación digital", icon: Ticket },
  { href: "/dashboard/invitados", label: "Invitados y mesas", icon: Users },
  { href: "/dashboard/proveedores", label: "Proveedores", icon: Package },
  { href: "/dashboard/cronograma", label: "Cronograma", icon: CalendarClock },
  { href: "/dashboard/presupuesto", label: "Presupuesto", icon: Wallet },
];

const adminItem = { href: "/admin", label: "Administración", icon: Shield };

function isActive(pathname, href) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppSidebar({ events, activeEventId, isAdmin }) {
  const pathname = usePathname();
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-surface/15 bg-brand text-surface lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="px-4 pb-8 pt-5">
        <EventSwitcher activeEventId={activeEventId} events={events} />
      </div>

      <div className="px-5 pb-5">
        <Link
          className="min-w-0 overflow-wrap-anywhere text-sm font-serif font-semibold uppercase tracking-[0.14em] text-surface"
          href="/"
        >
          Special Day
        </Link>
        <div className="mt-4 border-t border-surface/15" />
      </div>

      <nav aria-label="Secciones" className="flex flex-1 flex-col gap-1 px-4 pb-5">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-surface/20 text-surface ring-1 ring-surface/30"
                  : "text-surface/75 hover:bg-surface/10 hover:text-surface"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-surface/15 px-4 py-4">
        <div className="flex flex-col gap-0">
          <Link
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-surface/75 transition hover:bg-surface/10 hover:text-surface"
            href="/dashboard/cuenta"
          >
            <UserRound aria-hidden="true" className="size-4 shrink-0" />
            Mi perfil
          </Link>
          <form action={logout}>
            <button
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-surface/60 transition hover:bg-surface/10 hover:text-surface/90"
              type="submit"
            >
              <LogOut aria-hidden="true" className="size-4 shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}