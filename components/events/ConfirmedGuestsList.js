export default function ConfirmedGuestsList({ confirmedGuests }) {
  const total = confirmedGuests.length;

  return (
    <section className="border border-accent bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">Invitados confirmados</h2>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
          {total} {total === 1 ? "persona" : "personas"}
        </span>
      </div>
      <p className="mt-2 text-sm text-brand">
        Se van sumando a medida que cada invitado responde desde su link.
      </p>

      {total === 0 ? (
        <p className="mt-4 border border-dashed border-accent px-4 py-6 text-center text-sm text-brand">
          Todavia no hay confirmaciones.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2">
          {confirmedGuests.map((entry) => (
            <li
              className="flex flex-wrap items-center justify-between gap-2 border border-accent/60 bg-accent/10 px-4 py-3 text-sm"
              key={entry.id}
            >
              <span className="font-semibold text-ink">{entry.name}</span>
              <span className="text-xs uppercase tracking-[0.12em] text-brand/60">
                {entry.memberId ? entry.groupName || "Integrante de grupo" : "Invitado"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
