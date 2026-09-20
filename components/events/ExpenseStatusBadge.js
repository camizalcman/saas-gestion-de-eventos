const STATUS_BADGES = {
  pendiente: {
    label: "Pendiente",
    className: "border-danger/50 bg-danger/15 text-danger",
  },
  parcial: {
    label: "Parcial",
    className: "border-warning/50 bg-warning/15 text-warning",
  },
  pagado: {
    label: "Pagado",
    className: "border-success bg-success text-white",
  },
};

export default function ExpenseStatusBadge({ status }) {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.pendiente;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}