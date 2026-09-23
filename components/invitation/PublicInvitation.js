import { Calendar, Clock, Gift, MapPin, Shirt } from "lucide-react";
import Countdown from "@/components/invitation/Countdown";
import InvitationActions from "@/components/invitation/InvitationActions";
import InvitationResponse from "@/components/invitation/InvitationResponse";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import { getPalette } from "@/lib/invitation/palettes";
import { getTypography } from "@/lib/invitation/typographies";

const iconProps = { size: 20, strokeWidth: 1.8, "aria-hidden": true };

function formatInvitationDate(dateValue, timeValue) {
  if (!dateValue) return "";
  const time = timeValue || "12:00";
  const d = new Date(`${dateValue}T${time}`);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    timeZone: "UTC",
  }).formatToParts(d);
  const pick = (type) => parts.find((p) => p.type === type)?.value || "";
  return `${pick("day")}/${pick("month")}/${pick("year")}`;
}

export default function PublicInvitation({
  event,
  guest = null,
  respondAction,
  token,
}) {
  const invitation = event.invitation;
  const palette = getPalette(invitation.palette);
  const typography = getTypography(invitation.typography);
  const { bg, ink, muted, primary, secondary, accent, cta } = palette.colors;

  const target = invitation.date
    ? new Date(`${invitation.date}T${invitation.time || "12:00"}`).getTime()
    : 0;
  const formattedDate = formatInvitationDate(invitation.date, invitation.time);

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: bg, color: ink, fontFamily: typography.bodyFont }}
    >
      {invitation.heroImageUrl ? (
        <div className="relative h-[55vh] w-full overflow-hidden sm:h-[68vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Portada"
            className="h-full w-full object-cover"
            src={invitation.heroImageUrl}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-32"
            style={{ background: `linear-gradient(to top, ${bg}, transparent)` }}
          />
        </div>
      ) : null}

      {invitation.audioEnabled && invitation.audioUrl ? (
        <div className="fixed right-4 top-4 z-40">
          <MusicPlayer src={invitation.audioUrl} color={cta} />
        </div>
      ) : null}

      <article className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
        <header className="text-center">
          {invitation.message ? (
            <p
              className="text-lg font-medium sm:text-xl"
              style={{ color: primary, fontFamily: typography.headingFont }}
            >
              {invitation.message}
            </p>
          ) : null}
          {invitation.names ? (
            <h1
              className="mt-4 overflow-wrap-anywhere text-4xl font-serif font-semibold sm:text-6xl"
              style={{ color: ink, fontFamily: typography.headingFont }}
            >
              {invitation.names}
            </h1>
          ) : null}
        </header>

        {invitation.personalText ? (
          <p
            className="mx-auto mt-12 max-w-md whitespace-pre-wrap border-t border-b py-6 text-center text-base leading-7"
            style={{ color: muted, borderColor: accent }}
          >
            {invitation.personalText}
          </p>
        ) : null}

        <div className="mt-14 flex items-start justify-center gap-10">
          {formattedDate ? (
            <div className="flex flex-col items-center gap-2">
              <Calendar color={muted} {...iconProps} />
              <span className="text-xl font-semibold" style={{ color: ink }}>
                {formattedDate}
              </span>
            </div>
          ) : null}
          {invitation.time ? (
            <div className="flex flex-col items-center gap-2">
              <Clock color={muted} {...iconProps} />
              <span className="text-xl font-semibold" style={{ color: ink }}>
                {invitation.time}
              </span>
            </div>
          ) : null}
        </div>

        {target > 0 ? (
          <div className="mt-12">
            <Countdown target={target} palette={palette} />
          </div>
        ) : null}

        {invitation.venue ? (
          <section
            className="mt-20 flex flex-col items-center gap-3 border-t pt-12 text-center"
            style={{ borderColor: accent }}
          >
            <MapPin color={cta} {...iconProps} />
            <h3
              className="text-xl font-bold tracking-widest"
              style={{ color: ink, fontFamily: typography.headingFont }}
            >
              UBICACIÓN
            </h3>
            <p className="text-lg font-semibold" style={{ color: muted }}>
              {invitation.venue}
            </p>
            {invitation.mapUrl ? (
              <a
                className="rounded-md border px-5 py-2.5 text-base font-semibold transition hover:opacity-90"
                href={invitation.mapUrl}
                rel="noreferrer"
                style={{ borderColor: cta, color: cta }}
                target="_blank"
              >
                Ver en el mapa
              </a>
            ) : null}
          </section>
        ) : null}

        {invitation.dressCode ? (
          <section
            className="mt-20 flex flex-col items-center gap-3 border-t pt-12 text-center"
            style={{ borderColor: accent }}
          >
            <Shirt color={cta} {...iconProps} />
            <h3
              className="text-xl font-bold tracking-widest"
              style={{ color: ink, fontFamily: typography.headingFont }}
            >
              VESTIMENTA
            </h3>
            <p className="text-lg font-semibold" style={{ color: muted }}>
              {invitation.dressCode}
            </p>
          </section>
        ) : null}

        {invitation.giftEnabled && invitation.giftAlias ? (
          <section
            className="mt-20 flex flex-col items-center gap-3 border-t pt-12 text-center"
            style={{ borderColor: accent }}
          >
            <Gift color={cta} {...iconProps} />
            <h3
              className="text-xl font-bold tracking-widest"
              style={{ color: ink, fontFamily: typography.headingFont }}
            >
              REGALO
            </h3>
            <p
              className="whitespace-pre-wrap text-lg leading-7"
              style={{ color: muted }}
            >
              {invitation.giftAlias}
            </p>
          </section>
        ) : null}

        {invitation.closingText ? (
          <p
            className="mt-20 whitespace-pre-wrap text-center text-base leading-7"
            style={{ color: muted }}
          >
            {invitation.closingText}
          </p>
        ) : null}

        <div className="mt-16">
          {guest && respondAction && token ? (
            <InvitationResponse
              guest={guest}
              respondAction={respondAction}
              token={token}
            />
          ) : (
            <InvitationActions eventId={event.id} palette={palette} />
          )}
        </div>

        <p className="mt-10 text-center text-xs" style={{ color: secondary }}>
          {event.title}
        </p>
      </article>
    </main>
  );
}
