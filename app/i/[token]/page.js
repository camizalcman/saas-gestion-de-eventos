import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import InvitationResponse from "@/components/invitation/InvitationResponse";
import { findEventByGuestToken } from "@/lib/events/events";
import { respondToInvitation } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invitacion personalizada | Gestion de eventos",
  description:
    "Tu invitacion personalizada para este evento. Proximamente disponible.",
};

export default async function GuestInvitationPage({ params }) {
  const { token } = await params;
  const found = await findEventByGuestToken(token);
  const guest = found?.guest || null;

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />
      <section className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Invitacion personalizada
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
          Tu invitacion esta en camino
        </h1>
        <p className="mt-5 text-sm leading-6 text-brand">
          Esta pagina mostrara la tarjeta digital personalizada para vos o tu
          grupo. Todavia estamos preparandola.
        </p>
        <p className="mt-3 break-all font-mono text-xs text-brand/60">
          Token: {token}
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
      <Footer />
    </main>
  );
}
