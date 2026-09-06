"use client";

import { useState } from "react";
import RsvpModal from "./RsvpModal";

export default function InvitationActions({ eventId, palette, date, time, venue }) {
  const [openRsvp, setOpenRsvp] = useState(false);
  const accent = palette.colors.cta;
  const ctaText = palette.colors.ctaText;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          className="h-12 rounded-md border text-sm font-semibold opacity-70 disabled:cursor-not-allowed"
          style={{ borderColor: palette.colors.accent, color: palette.colors.muted }}
          type="button"
          disabled
          title="Próximamente: agendar en Google Calendar"
        >
          Agendar al evento
        </button>
        <button
          className="h-12 rounded-md px-5 text-sm font-semibold"
          style={{ backgroundColor: accent, color: ctaText }}
          type="button"
          onClick={() => setOpenRsvp(true)}
        >
          Confirmar asistencia
        </button>
      </div>
      <RsvpModal
        eventId={eventId}
        palette={palette}
        open={openRsvp}
        onClose={() => setOpenRsvp(false)}
      />
    </>
  );
}
