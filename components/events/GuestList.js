import CopyLinkButton from "./CopyLinkButton";
import GuestConfirmedCountInput from "./GuestConfirmedCountInput";
import GuestRemoveButton from "./GuestRemoveButton";

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

function StatusBadge({ status }) {
  const badge = STATUS_BADGES[status] || STATUS_BADGES.invitado;
  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

export default function GuestList({
  guests,
  removeAction,
  updateConfirmedCountAction,
  buildGuestLink,
}) {
  const totalQuantity = guests.reduce((sum, guest) => sum + guest.quantity, 0);
  const totalConfirmed = guests.reduce(
    (sum, guest) => sum + guest.confirmedCount,
    0,
  );

  return (
    <div className="overflow-x-auto border border-accent">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-accent/60 text-xs uppercase tracking-[0.12em] text-brand">
          <tr>
            <th className="px-4 py-3 font-semibold" scope="col">
              Nombre
            </th>
            <th className="px-4 py-3 text-right font-semibold" scope="col">
              Cant.
            </th>
            <th className="px-4 py-3 text-right font-semibold" scope="col">
              Confirmados
            </th>
            <th className="px-4 py-3 font-semibold" scope="col">
              Estado
            </th>
            <th className="px-4 py-3 font-semibold" scope="col">
              Link
            </th>
            <th className="px-4 py-3 text-right font-semibold" scope="col">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-surface">
          {guests.length === 0 ? (
            <tr>
              <td
                className="px-4 py-6 text-center text-sm text-brand"
                colSpan={6}
              >
                Todavia no hay invitados cargados.
              </td>
            </tr>
          ) : (
            guests.map((guest, index) => {
              const link = guest.token ? buildGuestLink?.(guest.token) : null;
              const rowClass =
                index === guests.length - 1
                  ? ""
                  : "border-b border-accent/60";

              return (
                <tr className={rowClass} key={guest.id}>
                  <td className="min-w-0 px-4 py-3 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="overflow-wrap-anywhere font-semibold text-ink">
                        {guest.name}
                      </span>
                      <span className="font-mono text-[10px] text-brand/60">
                        {guest.token ? `/i/${guest.token}` : "sin token"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right align-middle font-semibold text-ink">
                    {guest.quantity}
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <div className="inline-flex items-center gap-2">
                      <GuestConfirmedCountInput
                        action={updateConfirmedCountAction.bind(
                          null,
                          guest.id,
                        )}
                        guestId={guest.id}
                        max={guest.quantity}
                        value={guest.confirmedCount}
                      />
                      <span className="text-xs text-brand/70">
                        / {guest.quantity}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <StatusBadge status={guest.status} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {link ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded border border-accent bg-accent/30 px-2 py-1 font-mono text-xs text-brand">
                          /i/{guest.token.slice(0, 8)}…
                        </code>
                        <CopyLinkButton value={link} />
                      </div>
                    ) : (
                      <span className="text-xs text-brand/60">
                        Sin link generado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <GuestRemoveButton
                      action={removeAction.bind(null, guest.id)}
                      guestName={guest.name}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        <tfoot className="bg-accent/40 text-sm">
          <tr className="border-t border-accent">
            <th
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-brand"
              scope="row"
            >
              Totales
            </th>
            <td className="px-4 py-3 text-right font-semibold text-ink">
              {totalQuantity}
            </td>
            <td className="px-4 py-3 text-right font-semibold text-ink">
              {totalConfirmed} / {totalQuantity}
            </td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
