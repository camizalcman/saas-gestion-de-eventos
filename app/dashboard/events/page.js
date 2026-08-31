import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import EventForm from "@/components/events/EventForm";
import { getCurrentUser } from "@/lib/firebase/session";
import { listUserEvents } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";
import { createEvent, deleteEvent } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default async function EventsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  const events = await listUserEvents(user.uid);
  const useFirebaseStorage = process.env.FIREBASE_STORAGE === "true";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar user={user} profile={profile} />
      <header className="mx-auto w-full max-w-6xl border-b border-zinc-800 px-4 py-7 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Firestore</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-50 sm:text-5xl">Eventos</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">Creá y administrá tus eventos publicados.</p>
      </header>

      <section className="mx-auto mt-7 grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:px-8 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div>
          <h2 className="mb-3 text-lg font-semibold">Crear evento</h2>
          <EventForm action={createEvent} useFirebaseStorage={useFirebaseStorage} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Mis eventos</h2>
            <span className="text-sm text-zinc-500">{events.length} total</span>
          </div>
          {events.length === 0 ? (
            <div className="border border-zinc-800 p-6 text-sm text-zinc-400">Todavia no hay eventos cargados.</div>
          ) : (
            <div className="grid gap-px overflow-hidden border border-zinc-800 bg-zinc-800">
              {events.map((event) => (
                <article className="grid min-w-0 gap-4 bg-zinc-950 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto]" key={event.id}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="overflow-wrap-anywhere text-base font-semibold">{event.title}</h3>
                      <span className="border border-zinc-800 px-2 py-1 text-xs uppercase text-zinc-400">{event.published ? "published" : "draft"}</span>
                    </div>
                    <p className="mt-3 text-sm text-cyan-300">{formatDate(event.date)}</p>
                    <p className="mt-2 text-sm text-zinc-400">{event.location}</p>
                    {event.description ? <p className="mt-3 overflow-wrap-anywhere text-sm leading-6 text-zinc-400">{event.description}</p> : null}
                  </div>
                  <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-start lg:justify-end">
                    {event.published ? <Link className="inline-flex h-9 items-center justify-center border border-zinc-700 px-3 text-sm font-semibold hover:bg-zinc-900" href={`/events/${event.id}`}>Ver</Link> : null}
                    <Link className="inline-flex h-9 items-center justify-center border border-zinc-700 px-3 text-sm font-semibold hover:bg-zinc-900" href={`/dashboard/events/${event.id}/edit`}>Editar</Link>
                    <form action={deleteEvent.bind(null, event.id)}><button className="h-9 border border-red-900/80 px-3 text-sm font-semibold text-red-300 hover:bg-red-950/50" type="submit">Eliminar</button></form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
