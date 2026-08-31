import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import EventForm from "@/components/events/EventForm";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserEvent } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";
import { updateEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  const event = await getUserEvent(user.uid, id);
  if (!event) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar user={user} profile={profile} />
      <section className="mx-auto w-full max-w-2xl px-4 py-7 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Firestore</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-50 sm:text-4xl">Editar evento</h1>
        <div className="mt-7"><EventForm action={updateEvent.bind(null, event.id)} event={event} submitLabel="Guardar cambios" useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"} /></div>
        <Link className="mt-4 inline-flex h-10 items-center justify-center border border-zinc-700 px-4 text-sm font-semibold hover:bg-zinc-900" href="/dashboard/events">Volver a eventos</Link>
      </section>
      <Footer />
    </main>
  );
}
