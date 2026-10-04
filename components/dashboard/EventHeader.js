import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { EVENT_TYPES } from "@/lib/events/constants";
import EventDeleteButton from "@/components/events/EventDeleteButton";

function formatDate(value, fallbackTime = "00:00") {
  const text = String(value || "").trim();
  const time = /^\d{2}:\d{2}$/.test(fallbackTime) ? fallbackTime : "00:00";
  const match = text.match(
    /^(\d{4}-\d{2}-\d{2})(?:T([01]\d|2[0-3]):([0-5]\d))?$/,
  );

  if (!match) return "Sin fecha";

  const [, date, hours = time.slice(0, 2), minutes = time.slice(3, 5)] = match;
  const parsed = new Date(`${date}T${hours}:${minutes}:00Z`);

  if (Number.isNaN(parsed.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parsed);
}

function eventTypeLabel(value) {
  if (!value) return "—";
  const found = EVENT_TYPES.find((t) => t.value === value);
  return found ? found.label : value;
}

export default function EventHeader({ event, deleteAction }) {
  const hasCover = Boolean(event.imageUrl);
  const labelClass = `block text-xs font-semibold uppercase tracking-wider ${
    hasCover ? "text-surface/70" : "text-ink/50"
  }`;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-accent p-5 sm:p-6 ${
        hasCover ? "bg-brand text-surface" : "bg-surface"
      }`}
    >
      {hasCover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
            src={event.imageUrl}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-brand/60" />
        </>
      ) : null}

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className={`text-3xl font-serif font-semibold sm:text-3xl ${
              hasCover ? "text-surface" : "text-ink"
            }`}
          >
            {event.title}
          </h1>
          {event.published ? (
            <span
              className={`mt-2 inline-block border px-2 py-0.5 text-xs uppercase ${
                hasCover ? "border-surface/60 text-surface" : "border-accent text-brand"
              }`}
            >
              Publicado
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/evento/edit"
            className={`flex size-10 shrink-0 items-center justify-center rounded-full border transition ${
              hasCover
                ? "border-surface/60 bg-surface/15 text-surface hover:bg-surface/30"
                : "border-accent text-ink hover:border-secondary hover:bg-secondary/10"
            }`}
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

      <div
        className={`relative mt-4 flex flex-wrap gap-x-10 gap-y-4 text-sm ${
          hasCover ? "text-surface" : "text-brand"
        }`}
      >
        <div className="min-w-0">
          <span className={labelClass}>
            Fecha
          </span>
          <span className="mt-0.5 block">
            {formatDate(event.date || event.invitation?.date, event.invitation?.time)}
          </span>
        </div>
        <div className="min-w-0">
          <span className={labelClass}>
            Tipo de evento
          </span>
          <span className="mt-0.5 block">{eventTypeLabel(event.eventType)}</span>
        </div>
        <div className="min-w-0">
          <span className={labelClass}>
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
