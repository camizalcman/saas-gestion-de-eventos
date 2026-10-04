import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SupplierCard from "@/components/suppliers/SupplierCard";
import SupplierAddButton from "@/components/suppliers/SupplierAddButton";
import SupplierDeleteButton from "@/components/suppliers/SupplierDeleteButton";
import SupplierEditModal from "@/components/suppliers/SupplierEditModal";
import SupplierFilters from "@/components/suppliers/SupplierFilters";
import SupplierSearchBar from "@/components/suppliers/SupplierSearchBar";
import SupplierModal from "@/components/suppliers/SupplierModal";
import { getActiveEvent } from "@/lib/events/active";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  getSupplierEventCounts,
  getSuppliers,
} from "@/lib/suppliers/suppliers";
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
  const supplierEventCounts = await getSupplierEventCounts(
    suppliers.map((supplier) => supplier.id),
  );
  const activeEvent = await getActiveEvent(user);

  return (
    <div>
      <div className="pb-6">
        <Link
          aria-label="Volver a proveedores"
          className="inline-flex size-10 items-center justify-center rounded-full border border-secondary text-secondary transition hover:bg-secondary hover:text-surface"
          href="/dashboard/proveedores"
          title="Volver a proveedores"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
      </div>

      <header className="pb-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
                  Galeria de proveedores
                </h1>
                <p className="mt-3 max-w-2xl text-md leading-6 text-brand">
                  Explora proveedores de servicios para encontrar opciones para tus proximos eventos.
                </p>
              </div>

              {isAdmin ? (
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-56 sm:items-end">
                  <SupplierModal
                    action={createSupplierAction}
                    useFirebaseStorage={process.env.FIREBASE_STORAGE === "true"}
                  />
                  <p className="text-sm leading-6 text-brand sm:text-right">
                    Este proveedor quedara disponible en la galeria general.
                  </p>
                </div>
              ) : null}

            </div>

      </header>

      <section className="mt-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <SupplierFilters filters={filters} key={JSON.stringify(filters)} />
              </div>
              <SupplierSearchBar
                key={JSON.stringify(filters)}
                defaultValue={filters.search}
                category={filters.category}
                province={filters.province}
                locality={filters.locality}
              />
            </div>
      </section>

      {!activeEvent ? (
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
                    contractingCount={supplierEventCounts[supplier.id] || 0}
                    addButton={
                      <SupplierAddButton
                        action={addSupplierToEvent.bind(null, supplier.id)}
                        supplierName={supplier.name}
                        event={activeEvent}
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
  );
}
