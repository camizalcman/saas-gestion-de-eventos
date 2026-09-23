import PublicInvitation from "@/components/invitation/PublicInvitation";
import InvitationResponse from "@/components/invitation/InvitationResponse";
import { findEventByGuestToken } from "@/lib/events/events";
import { respondToInvitation } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invitacion personalizada | Gestion de eventos",
  description: "Tu invitacion personalizada para este evento.",
};

export default async function GuestInvitationPage({ params }) {
  const { token } = await params;
  const found = await findEventByGuestToken(token);
  const event = found?.event || null;
  const guest = found?.guest || null;

  if (event?.invitation) {
    return (
      <PublicInvitation
        event={event}
        guest={guest}
        respondAction={respondToInvitation}
        token={token}
      />
    );
  }

  return (
    <main className="min-h-screen bg-surface text-ink">
      <section className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Invitacion personalizada
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
          No pudimos cargar tu invitación
        </h1>
        <p className="mt-5 text-sm leading-6 text-brand">
          El enlace existe, pero todavía no hay una invitación diseñada para
          este evento.
        </p>

        {guest ? (
          <InvitationResponse
            guest={guest}
            respondAction={respondToInvitation}
            token={token}
          />
        ) : (
          <p className="mt-8 border border-accent bg-surface p-4 text-sm text-brand">
            No encontramos ninguna invitación asociada a este link.
          </p>
        )}
      </section>
    </main>
  );
}
