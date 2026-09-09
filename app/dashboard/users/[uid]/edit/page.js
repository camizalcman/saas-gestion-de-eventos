import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import UserForm from "@/components/users/UserForm";
import { getCurrentUser } from "@/lib/firebase/session";
import { getCurrentUserProfile, getUserProfile } from "@/lib/users/users";
import { updateUser } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const currentProfile = await getCurrentUserProfile(currentUser);

  if (currentProfile?.user_type !== "admin") {
    redirect("/dashboard/panel");
  }

  const { uid } = await params;
  const managedUser = await getUserProfile(uid);

  if (!managedUser) {
    notFound();
  }

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
        Administracion
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
        Editar usuario
      </h1>
      <p className="mt-4 overflow-wrap-anywhere font-mono text-xs leading-6 text-brand/60">
        {managedUser.uid}
      </p>

      <div className="mt-7">
        <UserForm
          action={updateUser.bind(null, managedUser.uid)}
          user={managedUser}
          submitLabel="Guardar cambios"
        />
      </div>

      <Link
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-accent bg-transparent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10 sm:w-auto"
        href="/dashboard/users"
      >
        Volver a usuarios
      </Link>
    </>
  );
}
