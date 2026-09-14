"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import GuestTableSelect from "./GuestTableSelect";

function TableLabel({ count }) {
  return count === 1 ? "mesa" : "mesas";
}

export default function SeatingSection({
  confirmedGuests,
  tableCount,
  tableCountAction,
  assignAction,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tablesError, setTablesError] = useState("");
  const people = confirmedGuests;

  const byTable = new Map();
  for (let number = 1; number <= tableCount; number += 1) {
    byTable.set(number, []);
  }
  for (const person of people) {
    const seats = byTable.get(person.tableNumber);
    if (seats) seats.push(person);
  }

  const unassignedCount = people.filter(
    (person) => !byTable.has(person.tableNumber),
  ).length;

  function handleTablesSubmit(event) {
    event.preventDefault();
    setTablesError("");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await tableCountAction(formData);
        router.refresh();
      } catch (submitError) {
        setTablesError(
          submitError?.message || "No se pudo definir la cantidad de mesas.",
        );
      }
    });
  }

  return (
    <section className="mt-7" id="mesas">
      <div className="grid gap-1">
        <h2 className="text-2xl font-semibold tracking-normal text-ink">
          Armado de mesas
        </h2>
        <p className="text-sm leading-6 text-brand">
          Asigná un número de mesa a cada invitado confirmado. Se refleja al
          instante en el salón de la derecha.
        </p>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-ink">
              Invitados confirmados
            </h3>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              {people.length} {people.length === 1 ? "persona" : "personas"}
            </span>
          </div>
          <p className="mt-2 text-sm text-brand">
            Elegí la mesa desde el listado.
          </p>

          {people.length === 0 ? (
            <div className="mt-4 border border-dashed border-accent px-4 py-6 text-center text-sm text-brand">
              Todavía no hay confirmaciones. Cuando un invitado confirme desde
              su link, aparece acá para asignarle una mesa.
            </div>
          ) : (
            <ul className="mt-4 grid gap-2">
              {people.map((person) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 border border-accent/60 bg-accent/10 px-4 py-3 text-sm"
                  key={person.id}
                >
                  <div className="min-w-0">
                    <p className="overflow-wrap-anywhere font-semibold text-ink">
                      {person.name}
                    </p>
                    {person.groupName ? (
                      <p className="text-[11px] text-brand/70">
                        {person.groupName}
                      </p>
                    ) : null}
                  </div>
                  <GuestTableSelect
                    action={assignAction.bind(null, person.guestId, person.memberId)}
                    person={person}
                    tableCount={tableCount}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-lg font-semibold text-ink">Salón</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              {tableCount === 0
                ? "Sin mesas"
                : `${tableCount} ${TableLabel({ count: tableCount })}`}
            </span>
          </div>
          <p className="mt-2 text-sm text-brand">
            Definí la cantidad de mesas del evento. Al cambiarla se
            reconfiguran las mesas y se limpian las asignaciones fuera de
            rango.
          </p>

          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={handleTablesSubmit}
          >
            <label className="grid gap-1" htmlFor="tableCount">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                Mesas
              </span>
              <input
                className="h-10 w-24 rounded-md border border-accent bg-surface px-3 text-sm text-ink"
                defaultValue={tableCount || ""}
                id="tableCount"
                max="60"
                min="0"
                name="tableCount"
                type="number"
              />
            </label>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? "Guardando..."
                : tableCount === 0
                  ? "Crear mesas"
                  : "Aplicar cambios"}
            </button>
          </form>
          {tablesError ? (
            <p className="mt-3 rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-brand" role="alert">
              {tablesError}
            </p>
          ) : null}

          {tableCount === 0 ? (
            <div className="mt-4 border border-dashed border-accent px-4 py-6 text-center text-sm text-brand">
              Todavía no hay mesas definidas. {unassignedCount > 0
                ? `Hay ${unassignedCount} confirmado${unassignedCount === 1 ? "" : "s"} sin mesa.`
                : ""}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from(byTable.entries()).map(([number, seats]) => (
                <article
                  className="rounded-lg border border-accent bg-surface p-4"
                  key={number}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-ink">
                      Mesa {number}
                    </h4>
                    <span className="text-xs font-semibold tabular-nums text-secondary">
                      {seats.length}
                    </span>
                  </div>
                  {seats.length === 0 ? (
                    <p className="mt-2 text-xs text-brand/70">Sin asignados</p>
                  ) : (
                    <ul className="mt-2 grid gap-1">
                      {seats.map((person) => (
                        <li
                          className="overflow-wrap-anywhere text-xs text-brand"
                          key={person.id}
                        >
                          {person.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}