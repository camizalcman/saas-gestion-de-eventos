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

function ContactLink({ href, label }) {
  if (!href) {
    return null;
  }

  return (
    <a
      className="inline-flex min-h-9 items-center border border-accent px-3 py-2 text-xs font-semibold text-ink transition hover:border-secondary hover:bg-secondary/10"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

export default function SupplierCard({ supplier, addButton }) {
  const location = [supplier.locality, getProvinceLabel(supplier.province)]
    .filter(Boolean)
    .join(", ");
  const whatsappUrl = getWhatsappUrl(supplier.whatsapp);

  return (
    <article className="group flex min-w-0 flex-col bg-surface">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-accent bg-secondary/20">
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
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="min-w-0 flex-1 overflow-wrap-anywhere text-xl font-semibold text-ink">
            {supplier.name}
          </h3>
          <span className="border border-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand">
            {getCategoryLabel(supplier.category)}
          </span>
        </div>

        <p className="mt-3 text-sm font-semibold text-secondary">
          {location || "Ubicacion no informada"}
        </p>

        <p className="mt-4 min-h-12 flex-1 text-sm leading-6 text-brand">
          {supplier.description || "Proveedor de servicios para eventos."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-accent pt-4">
          <ContactLink href={whatsappUrl} label="WhatsApp" />
          <ContactLink href={supplier.instagram} label="Instagram" />
          <ContactLink href={supplier.website} label="Sitio web" />
          {addButton}
        </div>
      </div>
    </article>
  );
}
