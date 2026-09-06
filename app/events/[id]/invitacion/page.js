import { notFound } from "next/navigation";
import { Calendar, Clock, Gift, MapPin, Shirt } from "lucide-react";
import Countdown from "@/components/invitation/Countdown";
import InvitationActions from "@/components/invitation/InvitationActions";
import { getPublishedEvent } from "@/lib/events/events";
import { getPalette } from "@/lib/invitation/palettes";
import { getTypography } from "@/lib/invitation/typographies";

export const dynamic = "force-dynamic";

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

export default async function PublicInvitationPage({ params }) {
  const { id } = await params;
  const event = await getPublishedEvent(id);
  if (!event) notFound();

  const invitation = event.invitation;
  if (!invitation) notFound();

  const palette = getPalette(invitation.palette);
  const typography = getTypography(invitation.typography);
  const { bg, ink, muted, primary, secondary, accent, cta } = palette.colors;

  const target = invitation.date
    ? new Date(`${invitation.date}T${invitation.time || "12:00"}`).getTime()
    : 0;

  const formattedDate = formatInvitationDate(invitation.date, invitation.time);

  return (
    <main style={{ backgroundColor: bg, color: ink, fontFamily: typography.bodyFont }} className="min-h-screen">
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

      <article className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8">
        <header className="text-center">
          {invitation.message ? (
            <p style={{ color: primary, fontFamily: typography.headingFont }} className="text-lg font-medium sm:text-xl">
              {invitation.message}
            </p>
          ) : null}
          {invitation.names ? (
            <h1
              style={{ color: ink, fontFamily: typography.headingFont }}
              className="mt-4 overflow-wrap-anywhere text-4xl font-serif font-semibold sm:text-6xl"
            >
              {invitation.names}
            </h1>
          ) : null}
        </header>

        {invitation.personalText ? (
          <p
            style={{ color: muted, borderColor: accent }}
            className="mx-auto mt-12 max-w-md whitespace-pre-wrap border-t border-b py-6 text-center text-base leading-7"
          >
            {invitation.personalText}
          </p>
        ) : null}

        <div className="mt-14 flex items-start justify-center gap-10">
          {formattedDate ? (
            <div className="flex flex-col items-center gap-2">
              <Calendar color={muted} {...iconProps} />
              <span style={{ color: ink }} className="text-xl font-semibold">{formattedDate}</span>
            </div>
          ) : null}
          {invitation.time ? (
            <div className="flex flex-col items-center gap-2">
              <Clock color={muted} {...iconProps} />
              <span style={{ color: ink }} className="text-xl font-semibold">{invitation.time}</span>
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
            <h3 style={{ color: ink, fontFamily: typography.headingFont }} className="text-xl font-bold tracking-widest">UBICACIÓN</h3>
            <p style={{ color: muted }} className="text-lg font-semibold">{invitation.venue}</p>
            {invitation.mapUrl ? (
              <a
                className="rounded-md border px-5 py-2.5 text-base font-semibold transition hover:opacity-90"
                style={{ borderColor: cta, color: cta }}
                href={invitation.mapUrl}
                target="_blank"
                rel="noreferrer"
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
            <h3 style={{ color: ink, fontFamily: typography.headingFont }} className="text-xl font-bold tracking-widest">VESTIMENTA</h3>
            <p style={{ color: muted }} className="text-lg font-semibold">{invitation.dressCode}</p>
          </section>
        ) : null}

        {invitation.giftEnabled && invitation.giftAlias ? (
          <section
            className="mt-20 flex flex-col items-center gap-3 border-t pt-12 text-center"
            style={{ borderColor: accent }}
          >
            <Gift color={cta} {...iconProps} />
            <h3 style={{ color: ink, fontFamily: typography.headingFont }} className="text-xl font-bold tracking-widest">REGALO</h3>
            <p style={{ color: muted }} className="whitespace-pre-wrap text-lg leading-7">{invitation.giftAlias}</p>
          </section>
        ) : null}

        {invitation.closingText ? (
          <p style={{ color: muted }} className="mt-20 whitespace-pre-wrap text-center text-base leading-7">
            {invitation.closingText}
          </p>
        ) : null}

        <div className="mt-16">
          <InvitationActions eventId={event.id} palette={palette} />
        </div>

        <p style={{ color: secondary }} className="mt-10 text-center text-xs">
          {event.title}
        </p>
      </article>
    </main>
  );
}