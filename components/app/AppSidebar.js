"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  ChevronsLeft,
  ChevronsRight,
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
  const [open, setOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const items = isAdmin ? [...baseItems, adminItem] : baseItems;

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <div
        className={`fixed left-1/2 top-3 z-50 grid w-[90%] -translate-x-1/2 grid-cols-[auto_1fr_auto] items-center rounded-full border border-secondary/70 bg-brand/80 px-3 py-1.5 shadow-lg shadow-brand/30 backdrop-blur-sm lg:hidden ${
          open ? "invisible" : ""
        }`}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-surface transition hover:bg-surface/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          <Menu className="size-5" />
        </button>

        <Link
          aria-label="Ir al inicio de Special Day"
          className="mx-auto whitespace-nowrap px-2 font-serif text-xs font-semibold uppercase tracking-[0.14em] text-surface transition hover:text-secondary sm:text-sm"
          href="/"
        >
          Special Day
        </Link>

        <span aria-hidden="true" className="size-9 shrink-0" />
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMenu} />
      ) : null}

      <aside
        aria-label="Menú principal"
        className={`fixed left-0 top-0 z-40 flex h-screen w-[90%] max-w-md flex-col border-r border-surface/15 bg-brand text-surface transition-[transform,visibility] duration-300 lg:hidden ${
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <Link
            className="min-w-0 overflow-wrap-anywhere font-serif text-sm font-semibold uppercase tracking-[0.14em] text-surface"
            href="/"
            onClick={closeMenu}
          >
            Special Day
          </Link>
          <button
            aria-label="Cerrar menú"
            className="grid size-9 shrink-0 place-items-center rounded-full text-surface transition hover:bg-surface/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            onClick={closeMenu}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="px-5 pt-5">
          <EventSwitcher activeEventId={activeEventId} events={events} />
        </div>

        <nav aria-label="Secciones" className="flex flex-1 flex-col gap-1 px-4 py-5">
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
                onClick={closeMenu}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-3">
          <Link
            className="flex items-center justify-center gap-3 rounded-full bg-secondary px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-surface"
            href="/dashboard/evento/nuevo"
            onClick={closeMenu}
          >
            <Plus aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.5} />
            Agregar evento
          </Link>
        </div>

        <div className="border-t border-surface/15 px-4 py-4">
          <div className="flex flex-col gap-0">
            <Link
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-surface/75 transition hover:bg-surface/10 hover:text-surface"
              href="/dashboard/cuenta"
              onClick={closeMenu}
            >
              <UserRound aria-hidden="true" className="size-4 shrink-0" />
              Mi perfil
            </Link>
            <LogoutButton className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-surface/60 transition hover:bg-surface/10 hover:text-surface/90">
              <LogOut aria-hidden="true" className="size-4 shrink-0" />
              Cerrar sesión
            </LogoutButton>
          </div>
        </div>
      </aside>

      <div
        aria-hidden="true"
        className={`hidden shrink-0 lg:block ${
          desktopExpanded ? "lg:w-64" : "lg:w-[84px]"
        }`}
      />

      <aside
        aria-label="Menú principal"
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-surface/15 bg-brand text-surface transition-all duration-300 lg:flex ${
          desktopExpanded ? "w-64" : "w-[84px]"
        }`}
      >
        <button
          aria-label={desktopExpanded ? "Comprimir menú" : "Expandir menú"}
          className={`absolute top-3 z-50 grid size-8 place-items-center rounded-md text-surface transition hover:bg-surface/20 ${
            desktopExpanded ? "right-3" : "left-1/2 -translate-x-1/2"
          }`}
          onClick={() => setDesktopExpanded((value) => !value)}
          type="button"
        >
          {desktopExpanded ? (
            <ChevronsLeft aria-hidden="true" className="size-5" />
          ) : (
            <ChevronsRight aria-hidden="true" className="size-5" />
          )}
        </button>

        <div className="px-4 pt-14 pb-4">
          {desktopExpanded ? (
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

        {desktopExpanded ? (
          <div className="px-5 pb-5">
            <Link
              className="min-w-0 overflow-wrap-anywhere text-sm font-serif font-semibold uppercase tracking-[0.14em] text-surface"
              href="/"
            >
              Special Day
            </Link>
            <div className="mt-4 border-t border-surface/15" />
          </div>
        ) : null}

        <nav aria-label="Secciones" className="flex flex-1 flex-col gap-1 px-4 pb-5">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                className={`flex rounded-lg py-2.5 text-sm font-semibold transition ${
                  desktopExpanded
                    ? "flex-row items-center gap-3 px-4"
                    : "flex-col items-center gap-1 px-3"
                } ${
                  active
                    ? "bg-surface/20 text-surface ring-1 ring-surface/30"
                    : "text-surface/75 hover:bg-surface/10 hover:text-surface"
                }`}
                href={item.href}
                key={item.href}
                title={!desktopExpanded ? item.label : undefined}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {desktopExpanded ? (
                  <span>{item.label}</span>
                ) : (
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

        <div className="px-4 pb-3">
          <Link
            className={`flex items-center rounded-full bg-secondary text-brand transition hover:bg-surface hover:text-brand ${
              desktopExpanded
                ? "w-full justify-start gap-3 px-4 py-2.5 text-sm font-semibold"
                : "mx-auto size-10 justify-center"
            }`}
            href="/dashboard/evento/nuevo"
            title={!desktopExpanded ? "Agregar evento" : undefined}
          >
            <Plus aria-hidden="true" className="size-5 shrink-0" strokeWidth={2.5} />
            {desktopExpanded ? <span>Agregar evento</span> : null}
          </Link>
        </div>

        <div className="border-t border-surface/15 px-4 py-4">
          <div className="flex flex-col gap-0">
            <Link
              className={`flex rounded-lg py-2.5 text-sm font-semibold text-surface/75 transition hover:bg-surface/10 hover:text-surface ${
                desktopExpanded
                  ? "flex-row items-center gap-3 px-4"
                  : "flex-col items-center gap-1 px-3"
              }`}
              href="/dashboard/cuenta"
              title={!desktopExpanded ? "Mi perfil" : undefined}
            >
              <UserRound aria-hidden="true" className="size-4 shrink-0" />
              {desktopExpanded ? (
                <span>Mi perfil</span>
              ) : (
                <span className="text-center text-[10px] leading-tight">Perfil</span>
              )}
            </Link>
            <LogoutButton
              className={`flex w-full rounded-lg py-2.5 text-sm font-medium text-surface/60 transition hover:bg-surface/10 hover:text-surface/90 ${
                desktopExpanded
                  ? "flex-row items-center gap-3 px-4"
                  : "flex-col items-center gap-1 px-3"
              }`}
              title={!desktopExpanded ? "Cerrar sesión" : undefined}
            >
              <LogOut aria-hidden="true" className="size-4 shrink-0" />
              {desktopExpanded ? (
                <span>Cerrar sesión</span>
              ) : (
                <span className="text-center text-[10px] leading-tight">Salir</span>
              )}
            </LogoutButton>
          </div>
        </div>
      </aside>
    </>
  );
}
