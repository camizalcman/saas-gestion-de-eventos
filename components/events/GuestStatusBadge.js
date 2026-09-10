const STATUS_BADGES = {
  invitado: {
    label: "Sin confirmar",
    className: "border-accent bg-accent/40 text-brand",
  },
  parcial: {
    label: "Parcial",
    className: "border-accent bg-secondary/10 text-ink",
  },
  confirmado: {
    label: "Confirmado",
    className: "border-secondary bg-secondary/20 text-ink",
  },
  rechazado: {
    label: "Rechazado",
    className: "border-brand/40 bg-brand/10 text-brand",
  },
};

export default function GuestStatusBadge({ status }) {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.invitado;

  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
