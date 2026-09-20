"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Shield,
  Ticket,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import EventSwitcher from "./EventSwitcher";
import LogoutButton from "./LogoutButton";

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
  const [expanded, setExpanded] = useState(false);
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="fixed left-0 top-0 z-50 flex h-12 w-16 items-center justify-center bg-brand text-surface lg:hidden"
        aria-label={expanded ? "Cerrar menú" : "Abrir menú"}
      >
        {expanded ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-brand text-surface transition-all duration-300 lg:static lg:z-auto lg:h-screen lg:w-64 lg:border-r lg:border-surface/15 ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        <div className={`px-4 pt-14 lg:pt-5 ${expanded ? "pb-8" : "pb-4"}`}>
          {expanded ? (
            <EventSwitcher activeEventId={activeEventId} events={events} />
          ) : (
            <div className="flex justify-center">
              <Link
                className="text-sm font-serif font-semibold uppercase tracking-[0.14em] text-surface"
                href="/"
              >
                SD
              </Link>
            </div>
          )}
        </div>

        {expanded && (
          <div className="px-5 pb-5">
            <Link
              className="min-w-0 overflow-wrap-anywhere text-sm font-serif font-semibold uppercase tracking-[0.14em] text-surface"
              href="/"
            >
              Special Day
            </Link>
            <div className="mt-4 border-t border-surface/15" />
          </div>
        )}

        <nav aria-label="Secciones" className="flex flex-1 flex-col gap-1 px-2 pb-5 lg:px-4">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                className={`flex rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  expanded
                    ? "flex-row items-center gap-3 px-4"
                    : "flex-col items-center gap-1"
                } ${
                  active
                    ? "bg-surface/20 text-surface ring-1 ring-surface/30"
                    : "text-surface/75 hover:bg-surface/10 hover:text-surface"
                }`}
                href={item.href}
                key={item.href}
                title={!expanded ? item.label : undefined}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {expanded && <span>{item.label}</span>}
                {!expanded && (
                  <span className="text-center text-[10px] leading-tight">
                    {item.label.length > 10
                      ? item.label.slice(0, 8) + "…"
                      : item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 pb-3 lg:px-4">
          <Link
            href="/dashboard/evento/nuevo"
            title={!expanded ? "Agregar evento" : undefined}
            className={`flex items-center justify-center rounded-full bg-secondary text-brand transition hover:bg-surface hover:text-brand ${
              expanded
                ? "gap-3 px-4 py-2.5 text-sm font-semibold"
                : "mx-auto size-10"
            }`}
          >
            <Plus className="size-5 shrink-0" strokeWidth={2.5} />
            {expanded && <span>Agregar evento</span>}
          </Link>
        </div>

        <div className="border-t border-surface/15 px-2 py-4 lg:px-4">
          <div className="flex flex-col gap-0">
            <Link
              className={`flex rounded-lg px-3 py-2.5 text-sm font-semibold text-surface/75 transition hover:bg-surface/10 hover:text-surface ${
                expanded
                  ? "flex-row items-center gap-3 px-4"
                  : "flex-col items-center gap-1"
              }`}
              href="/dashboard/cuenta"
              title={!expanded ? "Mi perfil" : undefined}
            >
              <UserRound aria-hidden="true" className="size-4 shrink-0" />
              {expanded && <span>Mi perfil</span>}
              {!expanded && (
                <span className="text-center text-[10px] leading-tight">
                  Perfil
                </span>
              )}
            </Link>
            <LogoutButton
              className={`flex w-full rounded-lg px-3 py-2.5 text-sm font-medium text-surface/60 transition hover:bg-surface/10 hover:text-surface/90 ${
                expanded
                  ? "flex-row items-center gap-3 px-4"
                  : "flex-col items-center gap-1"
              }`}
              title={!expanded ? "Cerrar sesión" : undefined}
            >
              <LogOut aria-hidden="true" className="size-4 shrink-0" />
              {expanded && <span>Cerrar sesión</span>}
              {!expanded && (
                <span className="text-center text-[10px] leading-tight">
                  Salir
                </span>
              )}
            </LogoutButton>
          </div>
        </div>
      </aside>
    </>
  );
}
