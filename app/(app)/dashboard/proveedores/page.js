import Link from "next/link";
import { redirect } from "next/navigation";
import ToastProvider from "@/components/ToastProvider";
import EventProvidersPanel from "@/components/events/EventProvidersPanel";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import { addProvider, removeProvider, updateProvider } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  const providers = event.providers || [];

  return (
    <ToastProvider>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-normal text-ink font-serif sm:text-3xl">
          Proveedores
        </h1>
        <Link
          className="inline-flex h-11 items-center rounded-xl border border-secondary bg-secondary px-5 text-sm font-semibold text-surface transition hover:bg-secondary/90"
          href="/dashboard/suppliers"
        >
          Buscar más proveedores
        </Link>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
        Cargá los proveedores de “{event.title}” con su categoría y datos de
        contacto para tenerlos a mano.
      </p>

      <EventProvidersPanel
        addAction={addProvider}
        providers={providers}
        removeAction={removeProvider}
        updateAction={updateProvider}
      />


    </ToastProvider>
  );
}
