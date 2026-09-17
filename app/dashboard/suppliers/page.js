import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import SupplierCard from "@/components/suppliers/SupplierCard";
import SupplierAddButton from "@/components/suppliers/SupplierAddButton";
import SupplierDeleteButton from "@/components/suppliers/SupplierDeleteButton";
import SupplierEditModal from "@/components/suppliers/SupplierEditModal";
import SupplierFiltersToggle from "@/components/suppliers/SupplierFiltersToggle";
import SupplierSearchBar from "@/components/suppliers/SupplierSearchBar";
import SupplierModal from "@/components/suppliers/SupplierModal";
import { listUserEvents } from "@/lib/events/events";
import { getCurrentUser } from "@/lib/firebase/session";
import { getSuppliers } from "@/lib/suppliers/suppliers";
import { getCurrentUserProfile } from "@/lib/users/users";
import {
  createSupplierAction,
  addSupplierToEvent,
  updateSupplierAction,
  deleteSupplierAction,
} from "./actions";

export const dynamic = "force-dynamic";

function getQueryValue(value) {
  return Array.isArray(value) ? value[0] || "" : String(value || "");
}

export default async function SuppliersPage({ searchParams }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile(user);
  const isAdmin = profile?.user_type === "admin";
  const query = await searchParams;
  const filters = {
    category: getQueryValue(query?.category),
    province: getQueryValue(query?.province),
    locality: getQueryValue(query?.locality),
    search: getQueryValue(query?.search),
  };
  const suppliers = await getSuppliers(filters);
  const events = await listUserEvents(user.uid);

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main className="min-h-screen bg-surface text-ink">
        <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between border-b border-accent pb-6">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-ink"
              href="/"
            >
              <ArrowLeft className="size-4" />
              Volver al inicio
            </Link>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary transition hover:text-ink"
              href="/dashboard"
            >
              Ir al dashboard
              <ArrowLeft className="size-4 rotate-180" />
            </Link>
          </div>

          <header className="mt-6 border-b border-accent pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Recursos para tus eventos
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
              Galeria de proveedores
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
              Explora proveedores de servicios para encontrar opciones para tus proximos eventos.
            </p>
          </header>

          {isAdmin ? (
            <section className="mt-8 flex flex-col gap-4 border-b border-accent pb-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Agregar proveedor</h2>
                <p className="mt-1 text-sm leading-6 text-brand">
                  Este proveedor quedara disponible en la galeria general.
                </p>
              </div>
              <SupplierModal
                action={createSupplierAction}
                useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"}
              />
            </section>
          ) : null}

          <section className="mt-8 border-b border-accent pb-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink">Buscar proveedores</h2>
                <p className="mt-1 text-sm leading-6 text-brand">
                  Filtra la galeria por categoria y ubicacion.
                </p>
              </div>
              <SupplierFiltersToggle filters={filters} />
            </div>
          </section>

          <SupplierSearchBar
            defaultValue={filters.search}
            category={filters.category}
            province={filters.province}
            locality={filters.locality}
          />

          {events.length === 0 ? (
            <div className="mt-8 border border-accent bg-surface p-6 text-sm leading-6 text-brand">
              Debés{" "}
              <Link className="font-semibold text-secondary underline-offset-4 hover:underline" href="/dashboard/evento/nuevo">
                crear un evento
              </Link>{" "}
              para agregar proveedores.
            </div>
          ) : null}

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-ink">Proveedores disponibles</h2>
              <span className="text-sm text-brand">{suppliers.length} total</span>
            </div>

            {suppliers.length === 0 ? (
              <div className="border border-accent bg-surface p-6 text-sm leading-6 text-brand">
                {Object.values(filters).some(Boolean)
                  ? "No encontramos proveedores con esos filtros."
                  : "Todavia no hay proveedores cargados."}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {suppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    addButton={
                      <SupplierAddButton
                        action={addSupplierToEvent.bind(null, supplier.id)}
                        supplierName={supplier.name}
                        events={events}
                      />
                    }
                    editButton={
                      isAdmin ? (
                        <SupplierEditModal
                          action={updateSupplierAction}
                          supplier={supplier}
                          useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"}
                        />
                      ) : null
                    }
                    deleteButton={
                      isAdmin ? (
                        <SupplierDeleteButton
                          action={deleteSupplierAction.bind(null, supplier.id)}
                          supplierName={supplier.name}
                        />
                      ) : null
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
