import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import InvitationForm from "@/components/invitation/InvitationForm";
import { getCurrentUser } from "@/lib/firebase/session";
import { getUserEvent } from "@/lib/events/events";
import { getCurrentUserProfile } from "@/lib/users/users";
import { saveInvitation } from "../../actions";

export const dynamic = "force-dynamic";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function listLocalEventImages() {
  const dir = path.join(process.cwd(), "public", "events");

  try {
    return fs
      .readdirSync(dir)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .map((file) => `/events/${file}`)
      .sort();
  } catch {
    return [];
  }
}

const AUDIO_EXTENSIONS = new Set([".mp3", ".ogg", ".wav", ".m4a"]);

function listLocalEventAudio() {
  const dir = path.join(process.cwd(), "public", "audio");

  try {
    return fs
      .readdirSync(dir)
      .filter((file) => AUDIO_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .map((file) => `/audio/${file}`)
      .sort();
  } catch {
    return [];
  }
}

export default async function InvitationPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const profile = await getCurrentUserProfile(user);
  if (profile?.user_type !== "admin") redirect("/dashboard");

  const event = await getUserEvent(user.uid, id);
  if (!event) notFound();

  const invitation = event.invitation;
  const availableImages = listLocalEventImages();
  const availableAudio = listLocalEventAudio();

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar user={user} profile={profile} />
      <section className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">Invitación digital</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">
          {invitation ? "Editar invitación" : "Crear invitación"}
        </h1>
        <p className="mt-2 text-sm text-brand">Personalizá la invitación de “{event.title}” con textos, fotos y colores.</p>

        <div className="mt-7">
          <InvitationForm
            action={saveInvitation.bind(null, event.id)}
            event={event}
            invitation={invitation}
            submitLabel={invitation ? "Guardar cambios" : "Crear invitación"}
            useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"}
            availableImages={availableImages}
            availableAudio={availableAudio}
          />
        </div>

        <Link
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
          href={`/dashboard/events/${event.id}`}
        >
          Volver al evento
        </Link>
      </section>
      <Footer />
    </main>
  );
}
