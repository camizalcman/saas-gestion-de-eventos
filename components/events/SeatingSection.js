"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmModal from "@/components/app/ConfirmModal";
import { useToast } from "@/components/ToastProvider";
import GuestTableSelect from "./GuestTableSelect";

const MAX_TABLES = 60;

const inputClass =
  "h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary";

function TableNameDialog({ action, initialName, onClose, tableLabel, tableNumber }) {
  const router = useRouter();
  const showToast = useToast();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef(null);

  const closeDialog = useCallback(() => {
    setError("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !isPending) {
        closeDialog();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    inputRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDialog, isPending]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !isPending) {
      closeDialog();
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await action(formData);
        showToast("Nombre de mesa actualizado");
        closeDialog();
        router.refresh();
      } catch (submitError) {
        setError(
          submitError?.message || "No se pudo guardar el nombre de la mesa.",
        );
      }
    });
  }

  return (
    <div
      aria-labelledby="rename-table-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
    >
      <form
        className="w-full max-w-md rounded-lg border border-accent bg-surface p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-semibold text-ink" id="rename-table-title">
          Editar nombre de la mesa
        </h2>
        <p className="mt-2 text-sm leading-6 text-brand">
          {`Renombrá ${tableLabel} para identificarla más fácil en el salón.`}
        </p>

        <label className="mt-5 grid gap-2 text-sm font-medium text-ink">
          <span>Nombre de la mesa</span>
          <input
            className={inputClass}
            defaultValue={initialName}
            maxLength={60}
            name="name"
            placeholder="Ej. Mesa de la familia"
            ref={inputRef}
            required
          />
        </label>
        <input name="tableNumber" type="hidden" value={tableNumber} />

        {error ? (
          <p className="mt-4 rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="h-10 rounded-md border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={closeDialog}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="h-10 rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Guardando..." : "Guardar nombre"}
          </button>
        </div>
      </form>
    </div>
  );
}

function buildDefaultPositions(tableCount) {
  const positions = new Map();
  if (!tableCount || tableCount <= 0) {
    return positions;
  }

  const cols = Math.max(2, Math.ceil(Math.sqrt(tableCount * 1.5)));
  const rows = Math.max(1, Math.ceil(tableCount / cols));
  const stepX = 100 / cols;
  const stepY = 100 / rows;

  for (let index = 0; index < tableCount; index += 1) {
    const row = Math.floor(index / cols);
    const col = index % cols;
    positions.set(index + 1, {
      x: (col + 0.5) * stepX,
      y: (row + 0.5) * stepY,
    });
  }

  return positions;
}

function mergeTablePositions(tables, tableCount) {
  const positions = buildDefaultPositions(tableCount);

  for (const table of tables) {
    if (
      table &&
      Number.isInteger(table.number) &&
      table.number > 0 &&
      Number.isFinite(table.x) &&
      Number.isFinite(table.y)
    ) {
      positions.set(table.number, { x: table.x, y: table.y });
    }
  }

  return positions;
}

function clampPercent(value) {
  return Math.min(96, Math.max(4, value));
}

function roundPositions(positions) {
  const rounded = new Map();
  for (const [number, position] of positions.entries()) {
    rounded.set(number, {
      x: Number(position.x.toFixed(2)),
      y: Number(position.y.toFixed(2)),
    });
  }
  return rounded;
}

export default function SeatingSection({
  confirmedGuests,
  removeTableAction,
  renameTableAction,
  savePositionsAction,
  tableCount,
  tableCountAction,
  tables = [],
  assignAction,
}) {
  const router = useRouter();
  const showToast = useToast();
  const [isPending, startTransition] = useTransition();
  const [isPositionsPending, startPositionsTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();
  const [tablesError, setTablesError] = useState("");
  const [assignError, setAssignError] = useState("");
  const [editingTable, setEditingTable] = useState(null);
  const [removingTable, setRemovingTable] = useState(null);
  const closeTableDialog = useCallback(() => setEditingTable(null), []);
  const closeRemoveModal = useCallback(() => setRemovingTable(null), []);

  const salonRef = useRef(null);
  const dragOffset = useRef({});

  const [positions, setPositions] = useState(() =>
    mergeTablePositions(tables, tableCount),
  );
  const [propsSnapshot, setPropsSnapshot] = useState({ tables, tableCount });
  const [optimisticCount, setOptimisticCount] = useState(null);

  if (propsSnapshot.tables !== tables || propsSnapshot.tableCount !== tableCount) {
    setPropsSnapshot({ tables, tableCount });
    setPositions(mergeTablePositions(tables, tableCount));
    setOptimisticCount(null);
  }

  const mesaCount = optimisticCount ?? tableCount;

  const [draft, setDraft] = useState(null);
  const positionsRef = useRef();
  const basePositions =
    mesaCount > tableCount ? mergeTablePositions(tables, mesaCount) : positions;
  const renderedPositions =
    draft !== null
      ? new Map(basePositions).set(draft.number, { x: draft.x, y: draft.y })
      : basePositions;

  useEffect(() => {
    positionsRef.current = renderedPositions;
  }, [renderedPositions]);

  const [dragOverrides, setDragOverrides] = useState(() => new Map());
  const [guestsSnapshot, setGuestsSnapshot] = useState(confirmedGuests);

  if (guestsSnapshot !== confirmedGuests) {
    setGuestsSnapshot(confirmedGuests);
    setDragOverrides(new Map());
  }

  const people = confirmedGuests.map((person) => {
    const override = dragOverrides.get(person.id);
    return override === undefined ? person : { ...person, tableNumber: override };
  });

  const [draggingTable, setDraggingTable] = useState(null);
  const [draggingGuestId, setDraggingGuestId] = useState(null);
  const [dropTargetTable, setDropTargetTable] = useState(null);

  useEffect(() => {
    if (draggingTable === null) {
      return undefined;
    }

    function handlePointerMove(event) {
      const drag = dragOffset.current;
      if (!drag || drag.number !== draggingTable) {
        return;
      }

      const bounds = salonRef.current?.getBoundingClientRect();
      const width = bounds && bounds.width > 0 ? bounds.width : 1;
      const height = bounds && bounds.height > 0 ? bounds.height : 1;

      const nextX = clampPercent(
        drag.originX + ((event.clientX - drag.startX) / width) * 100,
      );
      const nextY = clampPercent(
        drag.originY + ((event.clientY - drag.startY) / height) * 100,
      );

      setDraft({ number: draggingTable, x: nextX, y: nextY });
    }

    function handlePointerUp() {
      const committed = roundPositions(positionsRef.current);

      setPositions(committed);
      setDraggingTable(null);
      setDraft(null);
      dragOffset.current = {};

      const entries = Array.from(committed.entries()).map(
        ([number, position]) => ({ number, ...position }),
      );

      const formData = new FormData();
      formData.set("positions", JSON.stringify(entries));

      startPositionsTransition(async () => {
        try {
          await savePositionsAction(formData);
          router.refresh();
        } catch (submitError) {
          setTablesError(
            submitError?.message || "No se pudieron guardar las posiciones.",
          );
        }
      });
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggingTable, savePositionsAction, router]);

  const byTable = new Map();
  for (let number = 1; number <= mesaCount; number += 1) {
    byTable.set(number, []);
  }
  for (const person of people) {
    const seats = byTable.get(person.tableNumber);
    if (seats) seats.push(person);
  }

  const tableNames = new Map();
  for (const table of tables) {
    if (table && Number.isInteger(table.number) && table.number > 0) {
      tableNames.set(table.number, table.name || "");
    }
  }

  const tableLabels = Array.from({ length: mesaCount }, (_, index) => {
    const number = index + 1;
    return tableNames.get(number) || `Mesa ${number}`;
  });

  const removingSeats =
    removingTable === null ? [] : byTable.get(removingTable) || [];
  const removingLabel =
    removingTable === null
      ? ""
      : tableLabels[removingTable - 1] || `Mesa ${removingTable}`;
  const removingNames = removingSeats
    .slice(0, 3)
    .map((person) => person.name)
    .join(", ");
  const removeMessage =
    removingSeats.length > 0
      ? `Vas a eliminar "${removingLabel}". ${removingNames}${removingSeats.length > 3 ? ` y ${removingSeats.length - 3} más` : ""} ${removingSeats.length === 1 ? "queda" : "quedan"} sin mesa y las mesas siguientes se renumeran.`
      : `Vas a eliminar "${removingLabel}". No tiene invitados asignados, pero las mesas siguientes se renumeran.`;

  const unassignedCount = people.filter(
    (person) => !byTable.has(person.tableNumber),
  ).length;

  function handleTablesSubmit(event) {
    event.preventDefault();
    setTablesError("");
    setAssignError("");

    const formData = new FormData(event.currentTarget);

    if (mesaCount > 0) {
      if (mesaCount >= MAX_TABLES) {
        setTablesError(`El evento no puede tener más de ${MAX_TABLES} mesas.`);
        return;
      }

      formData.set("tableCount", String(mesaCount + 1));
      setOptimisticCount(mesaCount + 1);
    } else {
      const rawCount = String(formData.get("tableCount") ?? "").trim();

      if (!/^\d+$/.test(rawCount) || Number(rawCount) < 1) {
        setTablesError("Ingresá la cantidad de mesas con un número mayor a 0.");
        return;
      }

      setOptimisticCount(Number(rawCount));
    }

    startTransition(async () => {
      try {
        await tableCountAction(formData);
        router.refresh();
      } catch (submitError) {
        setOptimisticCount(null);
        setTablesError(
          submitError?.message || "No se pudo definir la cantidad de mesas.",
        );
      }
    });
  }

  function handleConfirmRemoveTable() {
    if (removingTable === null) {
      return;
    }

    const number = removingTable;
    setTablesError("");

    startRemoveTransition(async () => {
      try {
        await removeTableAction(number);
        setRemovingTable(null);
        showToast("Mesa eliminada");
        router.refresh();
      } catch (submitError) {
        setRemovingTable(null);
        setTablesError(submitError?.message || "No se pudo eliminar la mesa.");
      }
    });
  }

  function handleGuestDragStart(event, person) {
    setDraggingGuestId(person.id);
    setAssignError("");
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ guestId: person.guestId, memberId: person.memberId }),
    );
  }

  function handleGuestDragEnd() {
    setDraggingGuestId(null);
    setDropTargetTable(null);
  }

  function handleTableDragOver(event, number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    if (draggingGuestId !== null && dropTargetTable !== number) {
      setDropTargetTable(number);
    }
  }

  function handleTableDragLeave(event, number) {
    if (
      dropTargetTable === number &&
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setDropTargetTable(null);
    }
  }

  function handleTableDrop(event, number) {
    event.preventDefault();
    setDraggingGuestId(null);

    const payload = event.dataTransfer.getData("text/plain");
    if (!payload) {
      setDropTargetTable(null);
      return;
    }

    let guest;
    try {
      guest = JSON.parse(payload);
    } catch {
      setDropTargetTable(null);
      return;
    }

    if (!guest?.guestId) {
      setDropTargetTable(null);
      return;
    }

    const target = people.find(
      (person) =>
        person.guestId === guest.guestId &&
        (person.memberId ?? null) === (guest.memberId ?? null),
    );

    if (target) {
      setDragOverrides((prev) => new Map(prev).set(target.id, number));
    }

    const formData = new FormData();
    formData.set("tableNumber", String(number));
    setDropTargetTable(number);

    startTransition(async () => {
      try {
        await assignAction(guest.guestId, guest.memberId || null, formData);
        router.refresh();
      } catch (submitError) {
        if (target) {
          setDragOverrides((prev) => {
            const next = new Map(prev);
            next.delete(target.id);
            return next;
          });
        }
        setAssignError(
          submitError?.message || "No se pudo asignar la mesa.",
        );
      } finally {
        setDropTargetTable(null);
      }
    });
  }

  function handleTablePointerDown(event, number) {
    event.preventDefault();

    const current = renderedPositions.get(number);
    if (!current) {
      return;
    }

    dragOffset.current = {
      number,
      startX: event.clientX,
      startY: event.clientY,
      originX: current.x,
      originY: current.y,
    };
    setDraggingTable(number);
  }

  function handleSalonDragLeave(event) {
    if (
      event.currentTarget.contains(event.relatedTarget) ||
      draggingGuestId === null
    ) {
      return;
    }
    setDropTargetTable(null);
  }

  return (
    <section className="mt-12" id="mesas">
      <div className="grid gap-1">
        <h2 className="text-2xl font-semibold tracking-normal text-ink">
          Armado de mesas
        </h2>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[3fr_7fr]">
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
            Arrastrá un invitado sobre una mesa del salón, o asignala con el
            desplegable.
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
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg bg-accent/30 px-4 py-3 text-sm transition ${
                    draggingGuestId === person.id ? "opacity-40" : ""
                  }`}
                  draggable
                  key={person.id}
                  onDragEnd={handleGuestDragEnd}
                  onDragStart={(event) => handleGuestDragStart(event, person)}
                >
                  <p className="min-w-0 select-none overflow-wrap-anywhere font-semibold text-ink">
                    {person.name}
                  </p>
                  <div className="shrink-0" draggable={false}>
                    <GuestTableSelect
                      action={assignAction.bind(null, person.guestId, person.memberId)}
                      person={person}
                      tableLabels={tableLabels}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div>
              <h3 className="text-lg font-semibold text-ink">Salón</h3>
              <p className="text-sm text-brand">
                {mesaCount === 0
                  ? "Definí cuántas mesas tiene el evento para empezar a armarlas."
                  : "Agregá las mesas que falten de a una y quitá las que sobren con el ícono de eliminar."}
              </p>
            </div>
            

            <form
              className="ml-auto flex flex-wrap items-end gap-3"
              onSubmit={handleTablesSubmit}
            >
              {mesaCount === 0 ? (
                <label
                  className="flex items-center gap-3"
                  htmlFor="tableCount"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                    Cantidad de mesas
                  </span>
                  <input
                    className="h-10 w-24 rounded-md border border-accent bg-surface px-3 text-sm text-ink"
                    defaultValue=""
                    id="tableCount"
                    max="60"
                    min="1"
                    name="tableCount"
                    type="number"
                  />
                </label>
              ) : null}
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending || mesaCount >= MAX_TABLES}
                title={
                  mesaCount >= MAX_TABLES
                    ? `El evento no puede tener más de ${MAX_TABLES} mesas`
                    : undefined
                }
                type="submit"
              >
                {mesaCount === 0 ? (
                  isPending ? "Guardando..." : "Crear mesas"
                ) : (
                  <>
                    <Plus aria-hidden="true" className="size-4" />
                    {isPending ? "Agregando..." : "Agregar mesa"}
                  </>
                )}
              </button>
            </form>
          </div>

          {tablesError ? (
            <p
              className="mt-3 rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-brand"
              role="alert"
            >
              {tablesError}
            </p>
          ) : null}
          {assignError ? (
            <p
              className="mt-3 rounded-md border border-brand/40 bg-brand/10 p-3 text-sm text-brand"
              role="alert"
            >
              {assignError}
            </p>
          ) : null}

          {mesaCount === 0 ? (
            <div className="mt-4 border border-dashed border-accent px-4 py-6 text-center text-sm text-brand">
              Todavía no hay mesas definidas.{" "}
              {unassignedCount > 0
                ? `Hay ${unassignedCount} confirmado${unassignedCount === 1 ? "" : "s"} sin mesa.`
                : ""}
            </div>
          ) : (
            <div
              className="relative mt-4 h-[440px] overflow-hidden rounded-xl border border-dashed border-accent bg-accent/15 lg:h-[520px]"
              onDragLeave={handleSalonDragLeave}
              ref={salonRef}
            >
              {Array.from(renderedPositions.entries()).map(
                ([number, position]) => {
                  const seats = byTable.get(number) || [];
                  const isDropTarget = dropTargetTable === number;
                  const isMoving = draggingTable === number;
                  const label = tableLabels[number - 1] || `Mesa ${number}`;

                  return (
                    <article
                      className={`absolute w-36 -translate-x-1/2 -translate-y-1/2 select-none ${
                        isMoving ? "opacity-90" : ""
                      }`}
                      key={number}
                      onDragLeave={(event) =>
                        handleTableDragLeave(event, number)
                      }
                      onDragOver={(event) => handleTableDragOver(event, number)}
                      onDrop={(event) => handleTableDrop(event, number)}
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                      }}
                    >
                      <div
                        className={`rounded-lg border bg-surface p-2 shadow-sm transition ${
                          isDropTarget
                            ? "border-secondary ring-2 ring-secondary/50"
                            : isMoving
                              ? "border-secondary"
                              : "border-accent"
                        }`}
                      >
                        <div
                          className="flex cursor-grab touch-none select-none items-center gap-1.5 rounded px-1 py-0.5 transition hover:bg-accent/40 active:cursor-grabbing"
                          onPointerDown={(event) =>
                            handleTablePointerDown(event, number)
                          }
                          title="Arrastrá para reubicar la mesa"
                        >
                          <span
                            aria-hidden="true"
                            className="grid shrink-0 gap-[2px] text-secondary/60"
                          >
                            <span className="block h-px w-3 bg-current" />
                            <span className="block h-px w-3 bg-current" />
                            <span className="block h-px w-3 bg-current" />
                          </span>
                          <h4
                            className="min-w-0 flex-1 truncate text-sm font-semibold text-ink"
                            title={label}
                          >
                            {label}
                          </h4>
                          <div className="ml-auto flex shrink-0 items-center gap-0.5">
                            <button
                              aria-label={`Editar el nombre de ${label}`}
                              className="shrink-0 cursor-pointer rounded p-0.5 text-brand/70 transition hover:bg-accent hover:text-ink"
                              onClick={() => setEditingTable(number)}
                              onPointerDown={(event) => event.stopPropagation()}
                              title="Editar el nombre de la mesa"
                              type="button"
                            >
                              <Pencil aria-hidden="true" className="size-3.5" />
                            </button>
                            <button
                              aria-label={`Eliminar ${label}`}
                              className="shrink-0 cursor-pointer rounded p-0.5 text-brand/70 transition hover:bg-brand/10 hover:text-brand"
                              onClick={() => setRemovingTable(number)}
                              onPointerDown={(event) => event.stopPropagation()}
                              title="Eliminar la mesa"
                              type="button"
                            >
                              <Trash2 aria-hidden="true" className="size-3.5" />
                            </button>
                          </div>
                        </div>
                        {seats.length > 0 ? (
                          <ul className="mt-1 grid gap-0.5">
                            {seats.map((person) => (
                              <li
                                className="truncate rounded bg-accent/30 px-1 py-0.5 text-[10px] text-brand"
                                key={person.id}
                              >
                                {person.name}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <hr className="my-1 border-accent/70" />
                        <p className="px-1 text-[10px] font-semibold text-brand">
                          Total: {seats.length}
                        </p>
                      </div>
                    </article>
                  );
                },
              )}

              {draggingGuestId ? (
                <p className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-surface shadow">
                  Soltá sobre una mesa
                </p>
              ) : null}

              <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-brand/80">
                Arrastrá el encabezado de cada mesa para ubicarla según el salón
                real
              </p>

              {isPositionsPending ? (
                <p className="pointer-events-none absolute bottom-2 right-3 text-[11px] font-semibold text-secondary">
                  Guardando...
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {editingTable !== null ? (
        <TableNameDialog
          action={renameTableAction}
          initialName={tableNames.get(editingTable) || ""}
          onClose={closeTableDialog}
          tableLabel={tableNames.get(editingTable) || `la mesa ${editingTable}`}
          tableNumber={editingTable}
        />
      ) : null}

      <ConfirmModal
        cancelLabel="Cancelar"
        confirmLabel="Sí, eliminar"
        message={removeMessage}
        onClose={closeRemoveModal}
        onConfirm={handleConfirmRemoveTable}
        open={removingTable !== null}
        pending={isRemovePending}
        title="Eliminar mesa"
      />
    </section>
  );
}