"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Check, ChevronDown, Plus, Sparkles } from "lucide-react";
import { selectEvent } from "@/app/(app)/dashboard/actions";

export default function EventSwitcher({ events, activeEventId }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current =
    events.find((event) => event.id === activeEventId) || events[0] || null;

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!current) {
    return (
      <Link
        className="flex items-center justify-center gap-2 rounded-xl bg-surface/15 px-3 py-3 text-sm font-semibold text-surface transition hover:bg-surface/25"
        href="/dashboard/evento/nuevo"
      >
        <Plus aria-hidden="true" className="size-4" />
        Crear mi evento
      </Link>
    );
  }

  function handleSelect(eventId) {
    setOpen(false);

    if (eventId === current.id) {
      return;
    }

    const formData = new FormData();
    formData.set("eventId", eventId);
    startTransition(() => selectEvent(formData));
  }

  return (
    <div className="relative min-w-0" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-surface/70 bg-surface/20 pl-3.5 pr-3 text-sm font-semibold text-surface shadow-sm outline-none transition hover:bg-surface/25 focus:border-secondary/70 focus:ring-2 focus:ring-secondary/40"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <Sparkles aria-hidden="true" className="size-4 shrink-0 text-secondary" />
        <span className="min-w-0 flex-1 truncate text-left">{current.title}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-surface/80 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          aria-label="Eventos disponibles"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-accent bg-surface p-1.5 shadow-xl"
          role="listbox"
        >
          {events.map((event) => {
            const selected = event.id === current.id;

            return (
              <li key={event.id} role="option" aria-selected={selected}>
                <button
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                    selected
                      ? "bg-secondary text-surface"
                      : "text-ink hover:bg-secondary/15"
                  }`}
                  disabled={isPending}
                  onClick={() => handleSelect(event.id)}
                  type="button"
                >
                  <span className="min-w-0 flex-1 truncate">{event.title}</span>
                  {selected ? (
                    <Check aria-hidden="true" className="size-4 shrink-0" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}