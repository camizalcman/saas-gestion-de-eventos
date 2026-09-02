import Link from "next/link";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/firebase/session";
import { listPublishedEvents } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentUserProfile(user) : null;
  const publishedEvents = await listPublishedEvents();

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar user={user} profile={profile} />
      <Hero user={user} />

      <section className="mx-auto w-full max-w-6xl border-t border-accent px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Publicados
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-ink">
               Eventos disponibles
            </h2>
          </div>
          <span className="text-sm text-brand">
             {publishedEvents.length} total
          </span>
        </div>

        {publishedEvents.length === 0 ? (
          <div className="border border-accent p-6 text-sm leading-6 text-brand">
             No hay eventos publicados.
          </div>
        ) : (
          <div className="grid gap-px overflow-hidden border border-accent bg-accent sm:grid-cols-2 lg:grid-cols-3">
             {publishedEvents.map((event) => (
              <article className="min-w-0 bg-surface p-5" key={event.id}>
                {event.imageUrl ? (
                  <div className="-m-5 mb-5 border-b border-accent bg-accent">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                       alt={event.title}
                      className="h-44 w-full object-cover"
                       src={event.imageUrl}
                    />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="border border-accent px-2 py-1 text-xs uppercase tracking-[0.12em] text-brand">
                     Evento
                  </span>
                  <span className="border border-secondary/40 px-2 py-1 text-xs uppercase tracking-[0.12em] text-secondary">
                    published
                  </span>
                </div>
                <h3 className="mt-4 overflow-wrap-anywhere text-lg font-semibold text-ink">
                   {event.title}
                </h3>
                 {event.description ? (
                  <p className="mt-3 line-clamp-3 overflow-wrap-anywhere text-sm leading-6 text-brand">
                     {event.description}
                  </p>
                ) : null}
                <Link
                  className="mt-5 inline-flex h-10 w-full items-center justify-center border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10 sm:w-auto"
                   href={`/events/${event.id}`}
                >
                   Ver evento
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
