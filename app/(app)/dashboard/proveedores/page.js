import Link from "next/link";
import { redirect } from "next/navigation";
import ToastProvider from "@/components/ToastProvider";
import ProviderForm from "@/components/events/ProviderForm";
import ProviderRemoveButton from "@/components/events/ProviderRemoveButton";
import { getCurrentUser } from "@/lib/firebase/session";
import { getActiveEvent } from "@/lib/events/active";
import { SUPPLIER_CATEGORIES } from "@/lib/suppliers/constants";
import { addProvider, removeProvider } from "../actions";

export const dynamic = "force-dynamic";

function categoryLabel(value) {
  return SUPPLIER_CATEGORIES.find((category) => category.value === value)?.label
    || value
    || "—";
}

function buildProviderLink(provider) {
  if (provider.whatsapp) return provider.whatsapp;
  if (provider.website) return provider.website;
  return provider.instagram;
}

export default async function ProveedoresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  const providers = event.providers || [];

  return (
    <ToastProvider>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
        Proveedores
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
        Proveedores
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
        Cargá los proveedores de “{event.title}” con su categoría y datos de
        contacto para tenerlos a mano.
      </p>

      <div className="mt-7">
        <ProviderForm action={addProvider} />
      </div>

      <div className="mt-7 grid gap-3">
        {providers.length === 0 ? (
          <div className="border border-accent bg-surface p-5 text-sm text-brand">
            Todavía no hay proveedores cargados para este evento.
          </div>
        ) : (
          providers.map((provider) => (
            <article
              className="grid min-w-0 gap-3 border border-accent bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={provider.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="overflow-wrap-anywhere text-base font-semibold text-ink">
                    {provider.name}
                  </h2>
                  <span className="border border-accent px-2 py-1 text-xs uppercase text-brand">
                    {categoryLabel(provider.category)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-brand">
                  {provider.whatsapp ? (
                    <span>WhatsApp: {provider.whatsapp}</span>
                  ) : null}
                  {provider.instagram ? (
                    <span>Instagram: {provider.instagram}</span>
                  ) : null}
                  {provider.website ? (
                    <span className="overflow-wrap-anywhere">
                      Web: {provider.website}
                    </span>
                  ) : null}
                  {!provider.whatsapp && !provider.instagram && !provider.website ? (
                    <span>Sin datos de contacto</span>
                  ) : null}
                </div>
                {buildProviderLink(provider) ? (
                  <a
                    className="mt-3 inline-block text-sm font-semibold text-secondary underline-offset-4 hover:underline"
                    href={buildProviderLink(provider)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Contactar
                  </a>
                ) : null}
              </div>
              <div className="sm:justify-self-end">
                <ProviderRemoveButton
                  action={removeProvider.bind(null, provider.id)}
                  providerName={provider.name}
                />
              </div>
            </article>
          ))
        )}
      </div>

      <Link
        className="mt-7 inline-flex h-10 items-center justify-center rounded-md border border-accent px-4 text-sm font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
        href="/dashboard"
      >
        Volver al dashboard
      </Link>
    </ToastProvider>
  );
}