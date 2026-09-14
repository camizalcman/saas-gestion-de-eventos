import Link from "next/link";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import InvitationForm from "@/components/invitation/InvitationForm";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import { saveInvitation } from "../actions";

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

export default async function InvitacionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  const invitation = event.invitation;
  const availableImages = listLocalEventImages();
  const availableAudio = listLocalEventAudio();

  return (
    <>
      <h1 className="mt-3 text-3xl font-semibold text-ink sm:text-3xl font-serif">
        Invitación digital
      </h1>
      <p className="mt-2 text-sm text-brand">
        Personalizá la invitación de “{event.title}” con textos, fotos y colores.
      </p>

      <div className="mt-7">
        <InvitationForm
          action={saveInvitation}
          event={event}
          invitation={invitation}
          submitLabel={invitation ? "Guardar cambios" : "Crear invitación"}
          useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"}
          availableImages={availableImages}
          availableAudio={availableAudio}
        />
      </div>

    </>
  );
}