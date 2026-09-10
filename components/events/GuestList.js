import GuestTableRows from "./GuestTableRows";

export default function GuestList({
  guests,
  removeAction,
  removeMemberAction,
  buildGuestLink,
}) {
  const rows = guests.map((guest) => ({
    ...guest,
    link: guest.token ? buildGuestLink?.(guest.token) : null,
  }));

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
              Nombre / grupo
            </th>
            <th className="px-4 py-3 text-right font-semibold" scope="col">
              Cantidad
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
        <GuestTableRows
          guests={rows}
          removeAction={removeAction}
          removeMemberAction={removeMemberAction}
        />
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
            <td className="px-4 py-3 font-semibold text-brand">
              {totalConfirmed} confirmados
            </td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
