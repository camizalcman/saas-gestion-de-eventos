import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Invitacion personalizada | Gestion de eventos",
  description:
    "Tu invitacion personalizada para este evento. Proximamente disponible.",
};

export default async function GuestInvitationPage({ params }) {
  const { token } = await params;

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

        <div className="mt-10">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-md border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition hover:bg-secondary/90"
            href="/"
          >
            Volver al inicio
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
