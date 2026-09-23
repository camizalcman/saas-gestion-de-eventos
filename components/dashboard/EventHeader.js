import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { EVENT_TYPES } from "@/lib/events/constants";
import EventDeleteButton from "@/components/events/EventDeleteButton";

function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function eventTypeLabel(value) {
  if (!value) return "—";
  const found = EVENT_TYPES.find((t) => t.value === value);
  return found ? found.label : value;
}

export default function EventHeader({ event, deleteAction }) {
  return (
    <div className="rounded-xl border border-accent bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-serif font-semibold text-ink sm:text-3xl">
            {event.title}
          </h1>
          {event.published ? (
            <span className="mt-2 inline-block border border-accent px-2 py-0.5 text-xs uppercase text-brand">
              Publicado
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/evento/edit"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-accent text-ink transition hover:border-secondary hover:bg-secondary/10"
            aria-label="Editar evento"
          >
            <Pencil className="size-4" />
          </Link>
          <EventDeleteButton
            action={deleteAction}
            eventTitle={event.title}
            variant="round"
          />
        </div>
      </div>

      <div className="mt-4 gap-10 text-sm text-brand flex">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Fecha
          </span>
          <span className="mt-0.5 block">{formatDate(event.date)}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Tipo de evento
          </span>
          <span className="mt-0.5 block">{eventTypeLabel(event.eventType)}</span>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink/50">
            Protagonistas
          </span>
          <span className="mt-0.5 block">
            {event.protagonists?.join(", ") || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
