import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/firebase/session";
import { getPublishedEvent } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";

export const dynamic = "force-dynamic";

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("es-AR", { dateStyle: "full", timeStyle: "short" }).format(new Date(value)) : "Sin fecha";
}

export default async function PublicEventPage({ params }) {
  const { id } = await params;
  const [event, user] = await Promise.all([getPublishedEvent(id), getCurrentUser()]);
  if (!event) notFound();
  const profile = user ? await getCurrentUserProfile(user) : null;
  const isOwner = user?.uid === event.userId;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar user={user} profile={profile} actions={isOwner && profile?.user_type === "admin" ? <Link className="inline-flex h-10 items-center justify-center border border-cyan-400 bg-cyan-400 px-4 text-sm font-semibold text-zinc-950" href={`/dashboard/events/${event.id}/edit`}>Editar</Link> : null} />
      <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <span className="border border-cyan-900/70 px-2 py-1 text-xs uppercase tracking-[0.12em] text-cyan-300">Evento publicado</span>
        <h1 className="mt-5 overflow-wrap-anywhere text-3xl font-semibold text-zinc-50 sm:text-5xl">{event.title}</h1>
        <div className="mt-6 grid gap-3 border-y border-zinc-800 py-5 text-sm text-zinc-300 sm:grid-cols-2">
          <p><span className="text-zinc-500">Fecha:</span> {formatDate(event.date)}</p>
          <p><span className="text-zinc-500">Ubicacion:</span> {event.location}</p>
        </div>
        {event.imageUrl ? (
          <div className="mt-8 border border-zinc-800 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={event.title} className="max-h-[520px] w-full object-cover" src={event.imageUrl} />
          </div>
        ) : null}
        {event.description ? <p className="mt-6 whitespace-pre-wrap overflow-wrap-anywhere text-base leading-8 text-zinc-300">{event.description}</p> : null}
      </article>
      <Footer />
    </main>
  );
}
