"use client";

import { Calendar, Clock, Gift, MapPin, Shirt } from "lucide-react";
import Countdown from "@/components/invitation/Countdown";
import { getPalette } from "@/lib/invitation/palettes";
import { getTypography } from "@/lib/invitation/typographies";

const iconProps = { size: 18, strokeWidth: 1.8, "aria-hidden": true };

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

export default function InvitationPreview({ values, eventTitle }) {
  const palette = getPalette(values.palette);
  const typography = getTypography(values.typography);
  const { bg, ink, muted, primary, secondary, accent, cta } = palette.colors;

  const heroUrl = values.heroImageUrl;
  const target = values.date
    ? new Date(`${values.date}T${values.time || "12:00"}`).getTime()
    : 0;
  const formattedDate = formatInvitationDate(values.date, values.time);

  return (
    <div className="mx-auto w-[340px] max-w-full overflow-hidden rounded-2xl border border-accent shadow-lg">
      <div
        style={{ backgroundColor: bg, color: ink, fontFamily: typography.bodyFont }}
        className="min-h-[640px]"
      >
        {heroUrl ? (
          <div className="relative h-56 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Portada" className="h-full w-full object-cover" src={heroUrl} />
            <div
              className="absolute inset-x-0 bottom-0 h-24"
              style={{ background: `linear-gradient(to top, ${bg}, transparent)` }}
            />
          </div>
        ) : null}

        <div className="px-5 py-6">
          <header className="text-center">
            {values.message ? (
              <p style={{ color: primary, fontFamily: typography.headingFont }} className="text-base font-medium">
                {values.message}
              </p>
            ) : null}
            {values.names ? (
              <h1
                style={{ color: ink, fontFamily: typography.headingFont }}
                className="mt-3 overflow-wrap-anywhere text-3xl font-serif font-semibold"
              >
                {values.names}
              </h1>
            ) : null}
          </header>

          {values.personalText ? (
            <p
              style={{ color: muted, borderColor: accent }}
              className="mx-auto mt-8 max-w-xs whitespace-pre-wrap border-t border-b py-5 text-center text-sm leading-6"
            >
              {values.personalText}
            </p>
          ) : null}

          {(formattedDate || values.time) ? (
            <div className="mt-10 flex items-start justify-center gap-8">
              {formattedDate ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Calendar color={muted} {...iconProps} />
                  <span style={{ color: ink }} className="text-lg font-semibold">{formattedDate}</span>
                </div>
              ) : null}
              {values.time ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Clock color={muted} {...iconProps} />
                  <span style={{ color: ink }} className="text-lg font-semibold">{values.time}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {target > 0 ? (
            <div className="mt-8">
              <Countdown target={target} palette={palette} />
            </div>
          ) : null}

          {values.venue ? (
            <section
              className="mt-14 flex flex-col items-center gap-2.5 border-t pt-8 text-center"
              style={{ borderColor: accent }}
            >
              <MapPin color={cta} {...iconProps} />
              <h3 style={{ color: ink, fontFamily: typography.headingFont }} className="text-base font-bold tracking-widest">
                UBICACIÓN
              </h3>
              <p style={{ color: muted }} className="text-base font-semibold">{values.venue}</p>
            </section>
          ) : null}

          {values.dressCode ? (
            <section
              className="mt-14 flex flex-col items-center gap-2.5 border-t pt-8 text-center"
              style={{ borderColor: accent }}
            >
              <Shirt color={cta} {...iconProps} />
              <h3 style={{ color: ink, fontFamily: typography.headingFont }} className="text-base font-bold tracking-widest">
                VESTIMENTA
              </h3>
              <p style={{ color: muted }} className="text-base font-semibold">{values.dressCode}</p>
            </section>
          ) : null}

          {values.giftEnabled && values.giftAlias ? (
            <section
              className="mt-14 flex flex-col items-center gap-2.5 border-t pt-8 text-center"
              style={{ borderColor: accent }}
            >
              <Gift color={cta} {...iconProps} />
              <h3 style={{ color: ink, fontFamily: typography.headingFont }} className="text-base font-bold tracking-widest">
                REGALO
              </h3>
              <p style={{ color: muted }} className="whitespace-pre-wrap text-base leading-6">{values.giftAlias}</p>
            </section>
          ) : null}

          {values.closingText ? (
            <p style={{ color: muted }} className="mt-14 whitespace-pre-wrap text-center text-sm leading-6">
              {values.closingText}
            </p>
          ) : null}

          <p style={{ color: secondary }} className="mt-8 text-center text-xs">
            {eventTitle}
          </p>
        </div>
      </div>
    </div>
  );
}
