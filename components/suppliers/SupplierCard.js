import { AtSign, Globe2, MapPin, MessageCircle } from "lucide-react";
import {
  SUPPLIER_CATEGORIES,
  SUPPLIER_PROVINCES,
} from "@/lib/suppliers/constants";

function getCategoryLabel(value) {
  return SUPPLIER_CATEGORIES.find((category) => category.value === value)?.label || value;
}

function getProvinceLabel(value) {
  return SUPPLIER_PROVINCES.find((province) => province.value === value)?.label || value;
}

function getWhatsappUrl(value) {
  const digits = String(value || "").replace(/\D/g, "");

  return digits.length >= 7 ? `https://wa.me/${digits}` : "";
}

function ContactLink({ href, label, icon: Icon }) {
  if (!href) {
    return null;
  }

  return (
    <a
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-full border border-accent text-ink transition hover:border-secondary hover:bg-secondary/10"
      href={href}
      rel="noreferrer"
      target="_blank"
      title={label}
    >
      <Icon aria-hidden="true" className="size-4" />
    </a>
  );
}

export default function SupplierCard({ supplier, addButton, editButton, deleteButton }) {
  const location = [supplier.locality, getProvinceLabel(supplier.province)]
    .filter(Boolean)
    .join(", ");
  const whatsappUrl = getWhatsappUrl(supplier.whatsapp);

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-accent bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary/20">
        {supplier.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            alt={`Imagen de ${supplier.name}`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={supplier.imageUrl}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold uppercase tracking-[0.14em] text-secondary">
            {supplier.name}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand backdrop-blur-sm">
          {getCategoryLabel(supplier.category)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="min-w-0 overflow-wrap-anywhere text-lg font-semibold text-ink">
          {supplier.name}
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-secondary">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="min-w-0 truncate">{location || "Ubicacion no informada"}</span>
        </p>

        <p className="mt-3 line-clamp-2 min-h-10 flex-1 text-sm leading-5 text-brand">
          {supplier.description || "Proveedor de servicios para eventos."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-accent pt-3">
          <ContactLink href={whatsappUrl} icon={MessageCircle} label="WhatsApp" />
          <ContactLink href={supplier.instagram} icon={AtSign} label="Instagram" />
          <ContactLink href={supplier.website} icon={Globe2} label="Sitio web" />
          {addButton}
        </div>

        {editButton || deleteButton ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {editButton}
            {deleteButton}
          </div>
        ) : null}
      </div>
    </article>
  );
}
