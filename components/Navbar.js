"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/dashboard/actions";
import { User } from "lucide-react";

function isActivePath(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ href, label, onClick, pathname }) {
  const active = isActivePath(pathname, href);

  if (href.startsWith("#")) {
    function scrollToSection(e) {
      e.preventDefault();
      onClick?.();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }

    return (
      <a
        className="block px-3 py-2 text-sm font-medium text-surface transition hover:text-accent"
        href={href}
        onClick={scrollToSection}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      className={`block px-3 py-2 text-sm font-medium transition hover:text-accent ${
        active ? "text-surface" : "text-surface"
      }`}
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

export default function Navbar({ actions, profile, user }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const userType = profile?.user_type || "user";
  const links = [
    { href: "/", label: "Inicio" },
    { href: "#funcionalidades", label: "Funciones" },
    { href: "#preguntas", label: "Preguntas" },
  ];

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <nav className="border-b border-brand bg-brand">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <Link
            className="min-w-0 overflow-wrap-anywhere text-sm font-serif font-semibold uppercase tracking-[0.14em] text-surface"
            href="/"
            onClick={closeMenu}
          >
            Special Day
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-between gap-4 md:flex">
            <div className="grid flex-1 place-items-center">
              <div className="flex min-w-0 flex-wrap items-center justify-center gap-1">
                {links.map((link) => (
                  <NavLink
                    href={link.href}
                    key={link.href}
                    label={link.label}
                    pathname={pathname}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-3">
              {actions}
              {user ? (
                <>
                  <span className="min-w-0 max-w-64 overflow-wrap-anywhere text-right text-sm text-surface/80">
                    {user.email || "Sin email"} ({userType})
                  </span>
                  <form action={logout}>
                    <button
                      className="h-10 rounded-md border border-accent bg-transparent px-4 text-sm font-semibold text-surface transition hover:border-surface hover:bg-accent/20"
                      type="submit"
                    >
                      Cerrar sesion
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-surface transition hover:text-accent"
                  href="/login"
                >
                  <User className="size-4" aria-hidden="true" />
                  Ingresar
                </Link>
              )}
            </div>
          </div>

          <button
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            className="grid size-10 place-items-center rounded-md border border-accent bg-transparent text-surface transition hover:border-surface hover:bg-accent/20 md:hidden"
            onClick={() => setIsOpen((value) => !value)}
            type="button"
          >
            <span className="sr-only">Abrir menu</span>
            <span className="grid gap-1.5">
              <span className="block h-px w-5 bg-surface" />
              <span className="block h-px w-5 bg-surface" />
              <span className="block h-px w-5 bg-surface" />
            </span>
          </button>
        </div>

        <div
          className={`grid gap-3 overflow-hidden transition-[grid-template-rows,padding] duration-200 md:hidden ${
            isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr] pb-0"
          }`}
          id="mobile-menu"
        >
          <div className="min-h-0 overflow-hidden">
            <div className="grid gap-1 border-t border-surface/20 pt-3">
              {links.map((link) => (
                <NavLink
                  href={link.href}
                  key={link.href}
                  label={link.label}
                  onClick={closeMenu}
                  pathname={pathname}
                />
              ))}
            </div>

            <div className="mt-3 grid min-w-0 gap-3 border-t border-surface/20 pt-3">
              {actions}
              {user ? (
                <span className="overflow-wrap-anywhere text-sm text-surface/80">
                  {user.email || "Sin email"} ({userType})
                </span>
              ) : null}
            </div>

          {user ? (
            <form action={logout} className="mt-3">
              <button
                className="h-10 w-full rounded-md border border-accent bg-transparent px-4 text-sm font-semibold text-surface transition hover:border-surface hover:bg-accent/20"
                type="submit"
              >
                Cerrar sesion
              </button>
            </form>
          ) : (
            <Link
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-surface transition hover:text-accent"
              href="/login"
              onClick={closeMenu}
            >
              <User className="size-4" aria-hidden="true" />
              Login
            </Link>
          )}
        </div>
        </div>
      </div>
    </nav>
  );
}
