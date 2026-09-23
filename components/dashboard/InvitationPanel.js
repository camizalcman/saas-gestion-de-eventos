import Link from "next/link";
import { CalendarDays, MapPin, Clock, Plus } from "lucide-react";
import { getPalette } from "@/lib/invitation/palettes";

function formatDate(dateValue, timeValue) {
  if (!dateValue) return null;
  const time = timeValue || "12:00";
  const d = new Date(`${dateValue}T${time}`);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export default function InvitationPanel({ invitation, eventTitle }) {
  if (!invitation) {
    return (
      <div className="rounded-xl border border-dashed border-accent bg-surface p-6 text-center">
        <p className="text-sm text-brand">
          Aún no creaste la invitación digital.
        </p>
        <Link
          href="/dashboard/invitacion"
          className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition hover:bg-secondary/90"
        >
          <Plus className="size-4" />
          Crear invitación
        </Link>
      </div>
    );
  }

  const palette = getPalette(invitation.palette);
  const { bg, ink, muted, primary } = palette.colors;
  const formattedDate = formatDate(invitation.date, invitation.time);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-accent bg-surface">
      {invitation.heroImageUrl ? (
        <div className="relative flex-[1.5] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Portada de la invitación"
            className="h-full w-full object-cover"
            src={invitation.heroImageUrl}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-16"
            style={{
              background: `linear-gradient(to top, ${bg}, transparent)`,
            }}
          />
        </div>
      ) : (
        <div
          className="flex w-full items-center justify-center flex-[1.5]"
          style={{ backgroundColor: bg }}
        >
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: muted }}>
            Sin portada
          </span>
        </div>
      )}

      <div className="flex-1 px-5 py-4" style={{ backgroundColor: bg, color: ink }}>
        {invitation.names ? (
          <h3 className="text-center text-lg font-serif font-semibold">
            {invitation.names}
          </h3>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm" style={{ color: muted }}>
          {formattedDate ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" style={{ color: primary }} />
              {formattedDate}
            </span>
          ) : null}
          {invitation.time ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" style={{ color: primary }} />
              {invitation.time}
            </span>
          ) : null}
          {invitation.venue ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" style={{ color: primary }} />
              {invitation.venue}
            </span>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-accent px-5 py-3">
        <Link
          href="/dashboard/invitacion"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-accent bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        >
          Editar invitación
        </Link>
      </div>
    </div>
  );
}
