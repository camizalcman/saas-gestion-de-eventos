"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import ExpenseRemoveButton from "./ExpenseRemoveButton";
import ExpenseStatusBadge from "./ExpenseStatusBadge";

function toAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function deriveStatus(cost, paidAmount) {
  const total = toAmount(cost);
  const paid = toAmount(paidAmount);

  if (paid <= 0) return "pendiente";
  if (paid >= total) return "pagado";
  return "parcial";
}

function formatMoney(value) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(toAmount(value));
  } catch {
    return `$${toAmount(value).toLocaleString("es-AR")}`;
  }
}

const thClass =
  "whitespace-nowrap px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand";

const cellInputClass =
  "w-full min-w-0 bg-transparent px-1.5 py-1 text-sm text-ink outline-none transition placeholder:text-brand/60 focus:bg-surface focus:ring-2 focus:ring-secondary/50";

const cellSelectClass =
  "w-full min-w-0 cursor-pointer bg-transparent px-1.5 py-1 text-sm text-ink outline-none transition focus:bg-surface focus:ring-2 focus:ring-secondary/50";

const DEFAULT_COLUMN_WIDTHS = {
  title: 190,
  provider: 150,
  cost: 115,
  status: 115,
  paid: 115,
  responsible: 180,
  notes: 180,
  actions: 130,
};

const COLUMN_DEFS = [
  { key: "title", label: "Título" },
  { key: "provider", label: "Proveedor" },
  { key: "cost", label: "Costo" },
  { key: "status", label: "Estado" },
  { key: "paid", label: "Pagado" },
  { key: "responsible", label: "Responsable" },
  { key: "notes", label: "Observaciones" },
  { key: "actions", label: null },
];

const MIN_COLUMN_WIDTH = 90;
const MAX_COLUMN_WIDTH = 480;

function readStoredWidths(storageKey) {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const widths = { ...DEFAULT_COLUMN_WIDTHS };
    for (const [key, value] of Object.entries(parsed)) {
      const numeric = Number(value);
      if (
        DEFAULT_COLUMN_WIDTHS[key] != null &&
        Number.isFinite(numeric) &&
        numeric >= MIN_COLUMN_WIDTH &&
        numeric <= MAX_COLUMN_WIDTH
      ) {
        widths[key] = Math.round(numeric);
      }
    }
    return widths;
  } catch {
    return null;
  }
}

function writeStoredWidths(storageKey, widths) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(widths));
  } catch {
    // almacenamiento no disponible: se ignora
  }
}

export default function ExpensesSheet({
  expenses,
  providers,
  responsibles,
  addAction,
  addResponsibleAction,
  updateAction,
  removeAction,
  storageKey,
}) {
  const router = useRouter();
  const showToast = useToast();

  const [drafts, setDrafts] = useState({});
  const [newDraft, setNewDraft] = useState(() => ({
    title: "",
    providerId: providers.filter((provider) => !provider.deleted)[0]?.id || "",
    cost: "",
    paidAmount: "0",
    responsibleId: responsibles[0]?.id || "",
    notes: "",
  }));
  const [newResponsibles, setNewResponsibles] = useState([]);
  const [creatingFor, setCreatingFor] = useState(null);
  const [savingRow, setSavingRow] = useState(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [draggingColumn, setDraggingColumn] = useState(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const timeout = window.setTimeout(() => {
      const saved = readStoredWidths(storageKey);
      if (saved) setColumnWidths(saved);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [storageKey]);

  function clampColumnWidth(value) {
    return Math.min(
      MAX_COLUMN_WIDTH,
      Math.max(MIN_COLUMN_WIDTH, Math.round(value)),
    );
  }

  function handlePointerDown(key, event) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      key,
      startX: event.clientX,
      startWidth: columnWidths[key],
    };
    setDraggingColumn(key);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;

    const next = clampColumnWidth(drag.startWidth + (event.clientX - drag.startX));
    setColumnWidths((prev) =>
      prev[drag.key] === next ? prev : { ...prev, [drag.key]: next },
    );
  }

  function handlePointerUp(event) {
    const drag = dragRef.current;
    if (!drag) return;

    const next = clampColumnWidth(drag.startWidth + (event.clientX - drag.startX));
    dragRef.current = null;
    setDraggingColumn(null);

    const nextWidths = { ...columnWidths, [drag.key]: next };
    setColumnWidths(nextWidths);
    writeStoredWidths(storageKey, nextWidths);
  }

  const totalWidth = COLUMN_DEFS.reduce(
    (sum, def) => sum + columnWidths[def.key],
    0,
  );
  const tableWidth = Math.max(totalWidth, 760);

  const activeProviders = providers.filter((provider) => !provider.deleted);
  const responsibleOptions = responsibles.concat(
    newResponsibles.filter(
      (entry) => !responsibles.some((existing) => existing.id === entry.id),
    ),
  );

  function setDraftField(id, field, value, original) {
    setDrafts((prev) => {
      const next = { ...prev };
      const current = { ...(next[id] || {}) };

      if (String(value) === String(original)) {
        delete current[field];
        if (Object.keys(current).length === 0) {
          delete next[id];
        } else {
          next[id] = current;
        }
      } else {
        current[field] = value;
        next[id] = current;
      }

      return next;
    });
  }

  function resetNewDraft() {
    const stillExists = responsibleOptions.some(
      (entry) => entry.id === newDraft.responsibleId,
    );
    setNewDraft({
      title: "",
      providerId: activeProviders[0]?.id || "",
      cost: "",
      paidAmount: "0",
      responsibleId: stillExists
        ? newDraft.responsibleId
        : responsibleOptions[0]?.id || "",
      notes: "",
    });
  }

  function saveRow(expense) {
    if (savingRow) return;
    setError("");
    const draft = drafts[expense.id] || {};
    const formData = new FormData();
    formData.set("title", draft.title ?? expense.title);
    formData.set("providerId", draft.providerId ?? expense.providerId);
    formData.set("cost", draft.cost ?? String(expense.cost));
    formData.set("paidAmount", draft.paidAmount ?? String(expense.paidAmount));
    formData.set("responsibleId", draft.responsibleId ?? expense.responsibleId);
    formData.set("notes", draft.notes ?? expense.notes ?? "");

    setSavingRow(expense.id);
    startTransition(async () => {
      try {
        await updateAction(expense.id, formData);
        setSavingRow(null);
        setDrafts((prev) => {
          const next = { ...prev };
          delete next[expense.id];
          return next;
        });
        showToast("Gasto actualizado");
        router.refresh();
      } catch (saveError) {
        setSavingRow(null);
        setError(saveError?.message || "No se pudo guardar el gasto.");
      }
    });
  }

  function saveNew() {
    if (savingRow) return;
    setError("");
    const formData = new FormData();
    formData.set("title", newDraft.title);
    formData.set("providerId", newDraft.providerId);
    formData.set("cost", newDraft.cost);
    formData.set("paidAmount", newDraft.paidAmount || "0");
    formData.set("responsibleId", newDraft.responsibleId);
    formData.set("notes", newDraft.notes || "");

    setSavingRow("new");
    startTransition(async () => {
      try {
        await addAction(formData);
        setSavingRow(null);
        setCreatingFor(null);
        resetNewDraft();
        showToast("Gasto agregado");
        router.refresh();
      } catch (saveError) {
        setSavingRow(null);
        setError(saveError?.message || "No se pudo agregar el gasto.");
      }
    });
  }

  function discardRow(id) {
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function newRowKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveNew();
    } else if (event.key === "Escape") {
      setCreatingFor(null);
      resetNewDraft();
    }
  }

  function newRowEscape(event) {
    if (event.key === "Escape") {
      setCreatingFor(null);
      resetNewDraft();
    }
  }

  function handleCreateResponsible(name, target) {
    const formData = new FormData();
    formData.set("name", name);

    return new Promise((resolve, reject) => {
      startTransition(async () => {
        try {
          const id = await addResponsibleAction(formData);
          setNewResponsibles((prev) =>
            prev.some((entry) => entry.id === id)
              ? prev
              : [...prev, { id, name }],
          );
          if (target === "new") {
            setNewDraft((prev) => ({ ...prev, responsibleId: id }));
          } else {
            setDrafts((prev) => ({
              ...prev,
              [target]: { ...(prev[target] || {}), responsibleId: id },
            }));
          }
          setCreatingFor(null);
          showToast("Responsable creado y seleccionado");
          router.refresh();
          resolve();
        } catch (createError) {
          reject(createError);
        }
      });
    });
  }

  const totals = expenses.reduce(
    (acc, expense) => {
      const draft = drafts[expense.id] || {};
      acc.cost += toAmount(draft.cost ?? String(expense.cost));
      acc.paid += toAmount(draft.paidAmount ?? String(expense.paidAmount));
      return acc;
    },
    { cost: 0, paid: 0 },
  );

  const newRowDisabled =
    savingRow === "new" ||
    !newDraft.title.trim() ||
    newDraft.cost === "" ||
    !newDraft.providerId ||
    !newDraft.responsibleId;

  return (
    <div className="grid min-w-0 gap-3">
      {error ? (
        <p className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          {error}
        </p>
      ) : null}

      {activeProviders.length === 0 ? (
        <p className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
          Cargá proveedores en la sección{" "}
          <a
            className="font-semibold underline-offset-4 hover:underline"
            href="/dashboard/proveedores"
          >
            Proveedores
          </a>{" "}
          para poder registrar gastos.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-accent">
        <table
          className="w-full table-fixed text-left text-sm"
          style={{ width: tableWidth }}
        >
          <thead className="bg-accent/60">
            <tr>
              {COLUMN_DEFS.map((def) => (
                <th
                  className={`${thClass} relative`}
                  key={def.key}
                  scope="col"
                  style={{ width: columnWidths[def.key] }}
                >
                  <span className="block min-w-0 truncate">
                    {def.label ?? (
                      <span className="sr-only">Acciones</span>
                    )}
                  </span>
                  <ResizeHandle
                    columnKey={def.key}
                    isDragging={draggingColumn === def.key}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-accent/50">
            {expenses.map((expense, index) => {
              const draft = drafts[expense.id] || {};
              const title = draft.title ?? expense.title;
              const providerId = draft.providerId ?? expense.providerId;
              const cost = draft.cost ?? String(expense.cost);
              const paid = draft.paidAmount ?? String(expense.paidAmount);
              const responsibleId = draft.responsibleId ?? expense.responsibleId;
              const notes = draft.notes ?? expense.notes ?? "";
              const dirty = Object.keys(draft).length > 0;
              const status = deriveStatus(cost, paid);
              const overpaid = toAmount(paid) > toAmount(cost);
              const rowDisabled = savingRow === expense.id;

              const rowClass =
                index % 2 === 0
                  ? "bg-surface"
                  : "bg-white/70";

              return (
                <tr
                  className={`${rowClass} ${
                    dirty ? "bg-secondary/20" : ""
                  } transition hover:bg-accent/20`}
                  key={expense.id}
                >
                  <td className="px-1 py-1">
                    <input
                      className={cellInputClass}
                      disabled={rowDisabled}
                      maxLength={120}
                      name="title"
                      onChange={(event) =>
                        setDraftField(
                          expense.id,
                          "title",
                          event.target.value,
                          expense.title,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveRow(expense);
                        } else if (event.key === "Escape") {
                          discardRow(expense.id);
                        }
                      }}
                      placeholder="Concepto"
                      type="text"
                      value={title}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <select
                      className={cellSelectClass}
                      disabled={rowDisabled}
                      onChange={(event) =>
                        setDraftField(
                          expense.id,
                          "providerId",
                          event.target.value,
                          expense.providerId,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          discardRow(expense.id);
                        }
                      }}
                      value={providerId}
                    >
                      {activeProviders.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-1 py-1">
                    <input
                      className={`${cellInputClass} text-right`}
                      disabled={rowDisabled}
                      max={10000000000}
                      min={0}
                      name="cost"
                      onChange={(event) =>
                        setDraftField(
                          expense.id,
                          "cost",
                          event.target.value,
                          String(expense.cost),
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveRow(expense);
                        } else if (event.key === "Escape") {
                          discardRow(expense.id);
                        }
                      }}
                      step={1}
                      type="number"
                      value={cost}
                    />
                  </td>
                  <td className="px-2 py-1.5 align-middle">
                    <ExpenseStatusBadge status={status} />
                    {overpaid ? (
                      <p className="mt-1 text-[10px] font-semibold text-danger">
                        Sobrepagado
                      </p>
                    ) : null}
                  </td>
                  <td className="px-1 py-1">
                    <input
                      className={`${cellInputClass} text-right`}
                      disabled={rowDisabled}
                      max={10000000000}
                      min={0}
                      name="paidAmount"
                      onChange={(event) =>
                        setDraftField(
                          expense.id,
                          "paidAmount",
                          event.target.value,
                          String(expense.paidAmount),
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveRow(expense);
                        } else if (event.key === "Escape") {
                          discardRow(expense.id);
                        }
                      }}
                      step={1}
                      type="number"
                      value={paid}
                    />
                  </td>
                  <td className="px-1 py-1">
                    {creatingFor === expense.id ? (
                      <ResponsibleCreateInline
                        onCancel={() => setCreatingFor(null)}
                        onSubmit={(name) =>
                          handleCreateResponsible(name, expense.id)
                        }
                      />
                    ) : (
                      <select
                        className={cellSelectClass}
                        disabled={rowDisabled}
                        onChange={(event) => {
                          if (event.target.value === "__create__") {
                            setCreatingFor(expense.id);
                          } else {
                            setDraftField(
                              expense.id,
                              "responsibleId",
                              event.target.value,
                              expense.responsibleId,
                            );
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            discardRow(expense.id);
                          }
                        }}
                        value={responsibleId}
                      >
                        {responsibleOptions.map((responsible) => (
                          <option key={responsible.id} value={responsible.id}>
                            {responsible.name}
                          </option>
                        ))}
                        <option value="__create__">+ Crear nuevo</option>
                      </select>
                    )}
                  </td>
                  <td className="px-1 py-1">
                    <input
                      className={cellInputClass}
                      disabled={rowDisabled}
                      maxLength={500}
                      name="notes"
                      onChange={(event) =>
                        setDraftField(
                          expense.id,
                          "notes",
                          event.target.value,
                          expense.notes ?? "",
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          saveRow(expense);
                        } else if (event.key === "Escape") {
                          discardRow(expense.id);
                        }
                      }}
                      placeholder="Opcional"
                      type="text"
                      value={notes}
                    />
                  </td>
                  <td className="px-1 py-1 text-right align-middle">
                    {dirty ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="h-8 rounded-md border border-secondary bg-secondary px-3 text-xs font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={savingRow === expense.id}
                          onClick={() => saveRow(expense)}
                          type="button"
                        >
                          {savingRow === expense.id
                            ? "Guardando..."
                            : "Guardar"}
                        </button>
                        <button
                          className="h-8 rounded-md border border-accent px-3 text-xs font-semibold text-ink transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={savingRow === expense.id}
                          onClick={() => discardRow(expense.id)}
                          type="button"
                        >
                          Descartar
                        </button>
                      </div>
                    ) : (
                      <ExpenseRemoveButton
                        action={removeAction.bind(null, expense.id)}
                        expenseTitle={expense.title}
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            <tr className="bg-secondary/15">
              <td className="px-1 py-1">
                <input
                  className={cellInputClass}
                  disabled={savingRow === "new"}
                  maxLength={120}
                  name="title"
                  onChange={(event) =>
                    setNewDraft((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  onKeyDown={newRowKeyDown}
                  placeholder="Nuevo gasto…"
                  type="text"
                  value={newDraft.title}
                />
              </td>
              <td className="px-1 py-1">
                <select
                  className={cellSelectClass}
                  disabled={savingRow === "new" || activeProviders.length === 0}
                  onChange={(event) =>
                    setNewDraft((prev) => ({
                      ...prev,
                      providerId: event.target.value,
                    }))
                  }
                  onKeyDown={newRowEscape}
                  value={newDraft.providerId}
                >
                  {activeProviders.length === 0 ? (
                    <option disabled value="">
                      Sin proveedores
                    </option>
                  ) : (
                    activeProviders.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))
                  )}
                </select>
              </td>
              <td className="px-1 py-1">
                <input
                  className={`${cellInputClass} text-right`}
                  disabled={savingRow === "new"}
                  max={10000000000}
                  min={0}
                  name="cost"
                  onChange={(event) =>
                    setNewDraft((prev) => ({
                      ...prev,
                      cost: event.target.value,
                    }))
                  }
                  onKeyDown={newRowKeyDown}
                  placeholder="0"
                  step={1}
                  type="number"
                  value={newDraft.cost}
                />
              </td>
              <td className="px-2 py-1.5 align-middle">
                {newDraft.cost === "" ? (
                  <span className="text-xs text-brand">—</span>
                ) : (
                  <ExpenseStatusBadge
                    status={deriveStatus(newDraft.cost, newDraft.paidAmount)}
                  />
                )}
              </td>
              <td className="px-1 py-1">
                <input
                  className={`${cellInputClass} text-right`}
                  disabled={savingRow === "new"}
                  max={10000000000}
                  min={0}
                  name="paidAmount"
                  onChange={(event) =>
                    setNewDraft((prev) => ({
                      ...prev,
                      paidAmount: event.target.value,
                    }))
                  }
                  onKeyDown={newRowKeyDown}
                  placeholder="0"
                  step={1}
                  type="number"
                  value={newDraft.paidAmount}
                />
              </td>
              <td className="px-1 py-1">
                {creatingFor === "new" ? (
                  <ResponsibleCreateInline
                    onCancel={() => setCreatingFor(null)}
                    onSubmit={(name) => handleCreateResponsible(name, "new")}
                  />
                ) : (
                  <select
                    className={cellSelectClass}
                    disabled={savingRow === "new"}
                    onChange={(event) => {
                      if (event.target.value === "__create__") {
                        setCreatingFor("new");
                      } else {
                        setNewDraft((prev) => ({
                          ...prev,
                          responsibleId: event.target.value,
                        }));
                      }
                    }}
                    onKeyDown={newRowEscape}
                    value={newDraft.responsibleId}
                  >
                    {responsibleOptions.length === 0 ? (
                      <option disabled value="">
                        Creá un responsable
                      </option>
                    ) : (
                      responsibleOptions.map((responsible) => (
                        <option key={responsible.id} value={responsible.id}>
                          {responsible.name}
                        </option>
                      ))
                    )}
                    <option value="__create__">+ Crear nuevo</option>
                  </select>
                )}
              </td>
              <td className="px-1 py-1">
                <input
                  className={cellInputClass}
                  disabled={savingRow === "new"}
                  maxLength={500}
                  name="notes"
                  onChange={(event) =>
                    setNewDraft((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  onKeyDown={newRowKeyDown}
                  placeholder="Opcional"
                  type="text"
                  value={newDraft.notes}
                />
              </td>
              <td className="px-1 py-1 text-right align-middle">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    className="h-8 rounded-md border border-secondary bg-secondary px-3 text-xs font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={newRowDisabled}
                    onClick={saveNew}
                    title={
                      newDraft.responsibleId
                        ? "Agregar gasto"
                        : "Primero creá un responsable de pago"
                    }
                    type="button"
                  >
                    {savingRow === "new" ? "Guardando..." : "Agregar"}
                  </button>
                  <button
                    aria-label="Limpiar fila nueva"
                    className="grid size-8 place-items-center rounded-md border border-accent text-brand transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={savingRow === "new"}
                    onClick={() => {
                      setCreatingFor(null);
                      resetNewDraft();
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" className="text-lg leading-none">
                      ×
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-accent/40 text-sm">
            <tr className="border-t border-accent">
              <th
                className="px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand"
                scope="row"
              >
                Totales
              </th>
              <td className="px-2 py-2.5" />
              <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-ink">
                {formatMoney(totals.cost)}
              </td>
              <td className="px-2 py-2.5" />
              <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-ink">
                {formatMoney(totals.paid)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs leading-5 text-brand sm:hidden">
        Deslizá horizontalmente para ver todas las columnas.
      </p>
    </div>
  );
}

function ResponsibleCreateInline({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(name);
    } catch (submitError) {
      setError(
        submitError?.message || "No se pudo crear el responsable.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-w-0 gap-1">
      <form
        className="flex min-w-0 items-center gap-1"
        onSubmit={handleSubmit}
      >
        <input
          autoFocus
          className={cellInputClass}
          disabled={isSubmitting}
          maxLength={60}
          minLength={2}
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre"
          required
          type="text"
          value={name}
        />
        <button
          className="h-8 shrink-0 rounded-md border border-secondary bg-secondary px-2 text-xs font-semibold text-surface transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting || name.trim().length < 2}
          type="submit"
        >
          {isSubmitting ? "…" : "Agregar"}
        </button>
        <button
          aria-label="Cancelar creación"
          className="grid size-8 shrink-0 place-items-center rounded-md border border-accent text-brand transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            ×
          </span>
        </button>
      </form>
      {error ? (
        <p className="text-[10px] leading-4 text-danger">{error}</p>
      ) : null}
    </div>
  );
}

function ResizeHandle({
  columnKey,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-y-0 -right-px w-0.5 cursor-col-resize touch-none transition ${
        isDragging ? "bg-ink" : "bg-brand/70 hover:bg-brand"
      }`}
      onPointerCancel={onPointerUp}
      onPointerDown={(event) => onPointerDown(columnKey, event)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}