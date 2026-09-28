"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import {
  Search,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
} from "lucide-react";
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

function formatAmount(value) {
  try {
    return new Intl.NumberFormat("es-AR", {
      maximumFractionDigits: 0,
    }).format(toAmount(value));
  } catch {
    return toAmount(value).toLocaleString("es-AR");
  }
}

function formatPaymentDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));

  if (!match) {
    return "";
  }

  return `${match[3]}/${match[2]}`;
}

function todayIsoDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

const thClass =
  "whitespace-nowrap px-2 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand";

const cellInputClass =
  "w-full min-w-0 bg-transparent px-1.5 py-1 text-sm text-ink outline-none transition placeholder:text-brand/60 focus:bg-surface";

function PesoSign({ className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 text-sm tabular-nums ${className}`}
    >
      $
    </span>
  );
}

const moneyInputClass =
  "h-10 w-full min-w-0 rounded-md border border-accent bg-surface pl-7 pr-2 text-right text-sm tabular-nums text-ink outline-none transition placeholder:text-brand/60 focus:border-secondary focus:ring-2 focus:ring-secondary/50";

const moneyInputWrapperClass = "relative block";

function MoneyInput({ className = "", ...props }) {
  return (
    <span className={moneyInputWrapperClass}>
      <PesoSign className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand/80" />
      <input className={`${moneyInputClass} ${className}`} {...props} />
    </span>
  );
}

function ExpensePaymentModal({
  addAction,
  expense,
  onClose,
  removeAction,
  updateAction,
}) {
  const router = useRouter();
  const showToast = useToast();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => todayIsoDate());
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState(() => todayIsoDate());
  const [isEditing, startEditingTransition] = useTransition();
  const [payments, setPayments] = useState(() =>
    Array.isArray(expense.payments) ? expense.payments : [],
  );
  const amountRef = useRef(null);
  const optimisticIdRef = useRef(0);
  const removedIdsRef = useRef(new Set());

  const serverPayments = useMemo(
    () => (Array.isArray(expense.payments) ? expense.payments : []),
    [expense.payments],
  );
  const serverKey = serverPayments
    .map((payment) => `${payment?.id}:${payment?.amount}:${payment?.date}`)
    .join("|");

  useEffect(() => {
    setPayments((prev) => {
      const known = new Set(prev.map((payment) => payment?.id));
      const incoming = serverPayments.filter(
        (payment) =>
          !known.has(payment?.id) && !removedIdsRef.current.has(payment?.id),
      );

      return incoming.length > 0 ? [...prev, ...incoming] : prev;
    });
  }, [serverKey, serverPayments]);

  const paid = payments.reduce(
    (sum, payment) => sum + toAmount(payment?.amount),
    0,
  );
  const cost = toAmount(expense.cost);
  const remaining = Math.max(cost - paid, 0);
  const busy = isPending || isEditing;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape" && !busy) {
        setError("");
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    amountRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [busy, onClose]);

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget && !busy) {
      setError("");
      onClose();
    }
  }

  function startEditing(payment) {
    setError("");
    setEditingId(payment.id);
    setEditAmount(String(payment.amount));
    setEditDate(payment.date || todayIsoDate());
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    optimisticIdRef.current += 1;
    const optimisticId = `optimistic-${optimisticIdRef.current}`;

    setPayments((prev) => [
      ...prev,
      {
        id: optimisticId,
        amount: toAmount(formData.get("amount")),
        date: String(formData.get("date") || ""),
        createdAt: null,
      },
    ]);

    startTransition(async () => {
      try {
        const created = await addAction(formData);
        setPayments((prev) => {
          const rest = prev.filter((payment) => payment.id !== optimisticId);

          if (!created) return rest;

          return rest.some((payment) => payment.id === created.id)
            ? rest
            : [...rest, created];
        });
        setAmount("");
        amountRef.current?.focus();
        showToast("Pago registrado");
        router.refresh();
      } catch (submitError) {
        setPayments((prev) =>
          prev.filter((payment) => payment.id !== optimisticId),
        );
        setError(
          submitError?.message || "No se pudo registrar el pago.",
        );
      }
    });
  }

  function handleEditSubmit(event, payment) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const nextAmount = toAmount(formData.get("amount"));
    const nextDate = String(formData.get("date") || "");

    setPayments((prev) =>
      prev.map((entry) =>
        entry.id === payment.id ? { ...entry, amount: nextAmount, date: nextDate } : entry,
      ),
    );
    setEditingId(null);

    startEditingTransition(async () => {
      try {
        const updated = await updateAction(payment.id, formData);
        if (updated) {
          setPayments((prev) =>
            prev.map((entry) => (entry.id === payment.id ? updated : entry)),
          );
        } else {
          setPayments((prev) =>
            prev.map((entry) =>
              entry.id === payment.id ? { ...payment } : entry,
            ),
          );
        }
        showToast("Pago actualizado");
        router.refresh();
      } catch (submitError) {
        setPayments((prev) =>
          prev.map((entry) =>
            entry.id === payment.id ? { ...entry, ...payment } : entry,
          ),
        );
        setEditingId(payment.id);
        setEditAmount(String(nextAmount));
        setEditDate(nextDate);
        setError(
          submitError?.message || "No se pudo actualizar el pago.",
        );
      }
    });
  }

  function handleRemove(payment) {
    if (busy) return;
    setError("");

    removedIdsRef.current.add(payment.id);
    setPayments((prev) => prev.filter((entry) => entry.id !== payment.id));

    startTransition(async () => {
      try {
        await removeAction(payment.id);
        showToast("Pago eliminado");
        router.refresh();
      } catch (submitError) {
        removedIdsRef.current.delete(payment.id);
        setPayments((prev) =>
          prev.some((entry) => entry.id === payment.id)
            ? prev
            : [...prev, payment],
        );
        setError(
          submitError?.message || "No se pudo eliminar el pago.",
        );
      }
    });
  }

  return (
    <div
      aria-labelledby="payment-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-brand/70 p-4"
      onClick={handleBackdropClick}
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-lg border border-accent bg-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2
              className="text-lg font-semibold text-ink"
              id="payment-modal-title"
            >
              Pagos de {expense.title}
            </h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5 text-brand">
                Costo
                <span className="flex items-center gap-1 font-bold tabular-nums text-ink">
                  <PesoSign />
                  {formatAmount(cost)}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-brand">
                Pagado
                <span className="flex items-center gap-1 font-semibold tabular-nums text-success">
                  <PesoSign />
                  {formatAmount(paid)}
                </span>
              </span>
              <span className="flex items-center gap-1.5 text-brand">
                Pendiente
                <span className="flex items-center gap-1 font-semibold tabular-nums text-danger">
                  <PesoSign />
                  {formatAmount(remaining)}
                </span>
              </span>
            </div>
          </div>
          <button
            aria-label="Cerrar ventana"
            className="shrink-0 text-brand transition hover:text-ink"
            disabled={busy}
            onClick={() => {
              setError("");
              onClose();
            }}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        {payments.length > 0 ? (
          <ul className="mt-4 grid gap-1.5">
            {payments.map((payment, index) => {
              const rowKey = `${payment?.id ?? "payment"}-${index}`;

              return editingId === payment.id ? (
                <li
                  className="rounded-md border border-secondary bg-accent/20 px-3 py-2"
                  key={rowKey}
                >
                  <form
                    className="grid gap-2"
                    onSubmit={(event) => handleEditSubmit(event, payment)}
                  >
                    <div className="flex flex-wrap items-end gap-2">
                      <label className="grid min-w-0 flex-1 gap-1 text-xs font-medium text-brand">
                        Monto del pago
                        <MoneyInput
                          aria-label="Monto del pago"
                          max={10000000000}
                          min={1}
                          name="amount"
                          onChange={(event) =>
                            setEditAmount(event.target.value)
                          }
                          required
                          step={1}
                          type="number"
                          value={editAmount}
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-medium text-brand">
                        Fecha del pago
                        <input
                          className="h-10 rounded-md border border-accent bg-surface px-2 text-sm text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/50"
                          max={todayIsoDate()}
                          name="date"
                          onChange={(event) => setEditDate(event.target.value)}
                          required
                          type="date"
                          value={editDate}
                        />
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        className="h-8 rounded-md border border-accent bg-surface px-3 text-xs font-semibold text-ink transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isEditing}
                        onClick={() => setEditingId(null)}
                        type="button"
                      >
                        Cancelar
                      </button>
                      <button
                        className="h-8 rounded-md border border-secondary bg-secondary px-3 text-xs font-semibold text-ink transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isEditing}
                        type="submit"
                      >
                        {isEditing ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </form>
                </li>
              ) : (
                <li
                  className="flex items-center justify-between gap-3 rounded-md border border-accent bg-accent/20 px-3 py-2 text-sm"
                  key={rowKey}
                >
                  <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-ink">
                    <span className="flex items-center gap-1 font-semibold tabular-nums">
                      <PesoSign />
                      {formatAmount(payment.amount)}
                    </span>
                    <span className="text-xs text-brand">
                      {payment.date
                        ? `el ${formatPaymentDate(payment.date)}`
                        : "sin fecha"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button
                      aria-label={`Editar el pago de ${formatAmount(payment.amount)}`}
                      className="grid size-7 place-items-center rounded-md border border-accent text-brand transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={busy}
                      onClick={() => startEditing(payment)}
                      title="Editar este pago"
                      type="button"
                    >
                      <Pencil aria-hidden="true" className="size-3.5" />
                    </button>
                    <button
                      aria-label={`Quitar el pago de ${formatAmount(payment.amount)}`}
                      className="grid size-7 place-items-center rounded-md border border-accent text-brand transition hover:bg-brand/10 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={busy}
                      onClick={() => handleRemove(payment)}
                      title="Quitar este pago"
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 border border-dashed border-accent px-3 py-4 text-center text-sm text-brand">
            Todavía no hay pagos registrados.
          </p>
        )}

        <form
          className="mt-5 grid gap-3 border-t border-accent pt-5"
          onSubmit={handleSubmit}
        >
          <p className="text-sm font-semibold text-ink">Registrar un pago</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
              Monto pagado
              <MoneyInput
                max={10000000000}
                min={1}
                name="amount"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="Ej. 20000"
                ref={amountRef}
                required
                step={1}
                type="number"
                value={amount}
              />
            </label>
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-ink">
              Fecha del pago
              <input
                className="h-10 w-full min-w-0 rounded-md border border-accent bg-surface px-2 text-sm text-ink outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/50"
                max={todayIsoDate()}
                name="date"
                onChange={(event) => setDate(event.target.value)}
                required
                type="date"
                value={date}
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-md border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand">
              {error}
            </p>
          ) : null}

          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="h-10 rounded-md border border-accent bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => {
                setError("");
                onClose();
              }}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="h-10 rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-ink transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy || amount.trim() === ""}
              type="submit"
            >
              {isPending ? "Guardando..." : "Agregar pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const cellSelectClass =
  "w-full min-w-0 cursor-pointer bg-transparent px-1.5 py-1 text-sm text-ink outline-none transition focus:bg-surface";

const filterLabelClass =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-brand";

const filterInputClass =
  "h-9 w-full min-w-0 rounded-md border border-accent bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-brand/60 focus:ring-2 focus:ring-secondary/50";

const filterChevronClass =
  "pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-brand";

const filterMultiControlClass =
  "flex min-h-9 w-full min-w-0 cursor-pointer flex-wrap items-center gap-1 rounded-md border border-accent bg-surface py-1.5 pl-2 pr-10 text-left text-sm text-ink transition hover:bg-accent/20 focus:ring-2 focus:ring-secondary/50";

const filterPillClass =
  "inline-flex items-center gap-1 rounded-full border border-secondary bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-ink";

const DEFAULT_COLUMN_WIDTHS = {
  title: 190,
  provider: 150,
  cost: 130,
  status: 115,
  paid: 150,
  pending: 115,
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
  { key: "pending", label: "Pendiente" },
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
  addPaymentAction,
  addResponsibleAction,
  updateAction,
  removeAction,
  removePaymentAction,
  updatePaymentAction,
  storageKey,
}) {
  const router = useRouter();
  const showToast = useToast();

  const [drafts, setDrafts] = useState({});
  const [newDraft, setNewDraft] = useState(() => ({
    title: "",
    providerId: "",
    cost: "",
    paidAmount: "0",
    responsibleId: "",
    notes: "",
  }));
  const [newResponsibles, setNewResponsibles] = useState([]);
  const [creatingFor, setCreatingFor] = useState(null);
  const [savingRow, setSavingRow] = useState(null);
  const [paymentForId, setPaymentForId] = useState(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [draggingColumn, setDraggingColumn] = useState(null);
  const dragRef = useRef(null);

  const draftsRef = useRef(drafts);
  const saveTimersRef = useRef({});

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    const timers = saveTimersRef.current;
    return () => {
      Object.values(timers).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [providerFilter, setProviderFilter] = useState([]);

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

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const draft = drafts[expense.id] || {};
      const title = (draft.title ?? expense.title).toLowerCase();
      if (query && !title.includes(query)) return false;
      if (
        responsibleFilter.length > 0 &&
        !responsibleFilter.includes(
          draft.responsibleId ?? expense.responsibleId,
        )
      ) {
        return false;
      }
      if (
        providerFilter.length > 0 &&
        !providerFilter.includes(draft.providerId ?? expense.providerId)
      ) {
        return false;
      }
      if (statusFilter.length > 0) {
        const cost = draft.cost ?? String(expense.cost);
        if (!statusFilter.includes(deriveStatus(cost, expense.paidAmount))) {
          return false;
        }
      }
      return true;
    });
  }, [
    expenses,
    drafts,
    search,
    responsibleFilter,
    statusFilter,
    providerFilter,
  ]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    responsibleFilter.length > 0 ||
    statusFilter.length > 0 ||
    providerFilter.length > 0;

  function clearFilters() {
    setSearch("");
    setResponsibleFilter([]);
    setStatusFilter([]);
    setProviderFilter([]);
  }

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
    setNewDraft({
      title: "",
      providerId: "",
      cost: "",
      paidAmount: "0",
      responsibleId: "",
      notes: "",
    });
  }

  function saveRow(expense) {
    if (savingRow === expense.id) return;
    setError("");
    const pendingTimer = saveTimersRef.current[expense.id];
    if (pendingTimer) {
      window.clearTimeout(pendingTimer);
      delete saveTimersRef.current[expense.id];
    }
    const draft = draftsRef.current[expense.id] || {};
    const formData = new FormData();
    formData.set("title", draft.title ?? expense.title);
    formData.set("providerId", draft.providerId ?? expense.providerId);
    formData.set("cost", draft.cost ?? String(expense.cost));
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

  function scheduleRowSave(expense) {
    if (savingRow === expense.id) return;
    const key = expense.id;
    if (saveTimersRef.current[key]) {
      window.clearTimeout(saveTimersRef.current[key]);
    }
    saveTimersRef.current[key] = window.setTimeout(() => {
      delete saveTimersRef.current[key];
      saveRow(expense);
    }, 700);
  }

  function handleFieldChange(event, expense, field, original) {
    setDraftField(expense.id, field, event.target.value, original);
    scheduleRowSave(expense);
  }

  function handleCellBlur(event, expense) {
    if (savingRow === expense.id) return;
    if (!draftsRef.current[expense.id]) return;

    const related = event.relatedTarget;
    if (related instanceof HTMLElement) {
      if (related.closest("[data-row-inline-form]")) return;
    }
    saveRow(expense);
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
            const targetId = target;
            setDrafts((prev) => ({
              ...prev,
              [targetId]: { ...(prev[targetId] || {}), responsibleId: id },
            }));
            const expense = expenses.find((entry) => entry.id === targetId);
            if (expense) scheduleRowSave(expense);
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

  const closePaymentModal = useCallback(() => {
    setPaymentForId(null);
  }, []);

  const paymentFor = useMemo(
    () => expenses.find((expense) => expense.id === paymentForId) || null,
    [expenses, paymentForId],
  );

  const totals = filteredExpenses.reduce(
    (acc, expense) => {
      const draft = drafts[expense.id] || {};
      const cost = toAmount(draft.cost ?? String(expense.cost));
      const paid = toAmount(expense.paidAmount);
      acc.cost += cost;
      acc.paid += paid;
      acc.pending += cost - paid;
      return acc;
    },
    { cost: 0, paid: 0, pending: 0 },
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

      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end">
        <label className="grid min-w-0 gap-1.5">
          <span className={filterLabelClass}>Buscar</span>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand"
            />
            <input
              className={`${filterInputClass} pl-9`}
              name="search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título…"
              type="search"
              value={search}
            />
          </div>
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className={filterLabelClass}>Responsable</span>
          <FilterMultiSelect
            label="Responsable"
            onChange={setResponsibleFilter}
            options={responsibleOptions.map((responsible) => ({
              value: responsible.id,
              label: responsible.name,
            }))}
            selected={responsibleFilter}
          />
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className={filterLabelClass}>Estado</span>
          <FilterMultiSelect
            label="Estado"
            onChange={setStatusFilter}
            options={[
              { value: "pendiente", label: "Pendiente" },
              { value: "parcial", label: "Parcial" },
              { value: "pagado", label: "Pagado" },
            ]}
            selected={statusFilter}
          />
        </label>

        <label className="grid min-w-0 gap-1.5">
          <span className={filterLabelClass}>Proveedor</span>
          <FilterMultiSelect
            label="Proveedor"
            onChange={setProviderFilter}
            options={activeProviders.map((provider) => ({
              value: provider.id,
              label: provider.name,
            }))}
            selected={providerFilter}
          />
        </label>

        {hasActiveFilters ? (
          <button
            className="col-span-2 inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-accent px-3 text-sm font-semibold text-brand transition hover:bg-accent/40 sm:w-auto"
            onClick={clearFilters}
            type="button"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Limpiar filtros
          </button>
        ) : null}
      </div>

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
            {filteredExpenses.map((expense, index) => {
              const draft = drafts[expense.id] || {};
              const title = draft.title ?? expense.title;
              const providerId = draft.providerId ?? expense.providerId;
              const cost = draft.cost ?? String(expense.cost);
              const paid = String(expense.paidAmount);
              const responsibleId = draft.responsibleId ?? expense.responsibleId;
              const notes = draft.notes ?? expense.notes ?? "";
              const dirty = Object.keys(draft).length > 0;
              const status = deriveStatus(cost, paid);
              const pending = toAmount(cost) - toAmount(paid);
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
                        handleFieldChange(
                          event,
                          expense,
                          "title",
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
                      onBlur={(event) => handleCellBlur(event, expense)}
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
                        handleFieldChange(
                          event,
                          expense,
                          "providerId",
                          expense.providerId,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          discardRow(expense.id);
                        }
                      }}
                      onBlur={(event) => handleCellBlur(event, expense)}
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
                    <div className="flex items-center gap-1">
                      <PesoSign className="text-ink" />
                      <input
                        className={`${cellInputClass} text-right`}
                        disabled={rowDisabled}
                        max={10000000000}
                        min={0}
                        name="cost"
                        onChange={(event) =>
                          handleFieldChange(
                            event,
                            expense,
                            "cost",
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
                        onBlur={(event) => handleCellBlur(event, expense)}
                        step={1}
                        type="number"
                        value={cost}
                      />
                    </div>
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
                    <div className="flex items-center justify-end gap-1">
                      <PesoSign className="text-ink" />
                      <span className="min-w-0 truncate text-right text-sm tabular-nums text-ink">
                        {formatAmount(expense.paidAmount)}
                      </span>
                      <button
                        aria-label={`Registrar un pago de ${expense.title}`}
                        className="grid size-6 shrink-0 place-items-center rounded-md border border-accent text-brand transition hover:bg-accent/40"
                        onClick={() => setPaymentForId(expense.id)}
                        title="Registrar un pago"
                        type="button"
                      >
                        <Plus aria-hidden="true" className="size-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <span
                      className={`inline-flex items-center justify-end gap-1 text-sm tabular-nums ${
                        pending < 0
                          ? "font-semibold text-danger"
                          : "text-ink"
                      }`}
                    >
                      {pending < 0 ? "-" : null}
                      <PesoSign />
                      {formatAmount(Math.abs(pending))}
                    </span>
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
                            handleFieldChange(
                              event,
                              expense,
                              "responsibleId",
                              expense.responsibleId,
                            );
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            discardRow(expense.id);
                          }
                        }}
                        onBlur={(event) => handleCellBlur(event, expense)}
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
                        handleFieldChange(
                          event,
                          expense,
                          "notes",
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
                      onBlur={(event) => handleCellBlur(event, expense)}
                      placeholder="Opcional"
                      type="text"
                      value={notes}
                    />
                  </td>
                  <td className="px-1 py-1 text-right align-middle">
                    <ExpenseRemoveButton
                      action={removeAction.bind(null, expense.id)}
                      expenseTitle={expense.title}
                    />
                  </td>
                </tr>
              );
            })}

            {expenses.length > 0 && filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_DEFS.length}>
                  <p className="px-4 py-6 text-center text-sm text-brand">
                    No se encontraron gastos que coincidan con los filtros.
                  </p>
                </td>
              </tr>
            ) : null}

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
                  {newDraft.providerId === "" ? (
                    <option disabled value="">
                      Elegí un proveedor
                    </option>
                  ) : null}
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
                <div className="flex items-center gap-1">
                  <PesoSign className="text-ink" />
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
                </div>
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
                <div className="flex items-center gap-1">
                  <PesoSign className="text-ink" />
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
                    title="Monto ya pagado: se registra como un pago de hoy"
                    type="number"
                    value={newDraft.paidAmount}
                  />
                </div>
              </td>
              <td className="px-2 py-1.5 text-right">
                {newDraft.cost === "" ? (
                  <span className="text-xs text-brand">—</span>
                ) : (
                  <span
                    className={`inline-flex items-center justify-end gap-1 text-sm tabular-nums ${
                      toAmount(newDraft.cost) - toAmount(newDraft.paidAmount) < 0
                        ? "font-semibold text-danger"
                        : "text-ink"
                    }`}
                  >
                    {toAmount(newDraft.cost) - toAmount(newDraft.paidAmount) < 0
                      ? "-"
                      : null}
                    <PesoSign />
                    {formatAmount(
                      Math.abs(
                        toAmount(newDraft.cost) - toAmount(newDraft.paidAmount),
                      ),
                    )}
                  </span>
                )}
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
                    {newDraft.responsibleId === "" ? (
                      <option disabled value="">
                        Elegí un responsable
                      </option>
                    ) : null}
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
                    aria-label="Agregar gasto"
                    className="grid size-7 place-items-center rounded-md border border-ink bg-ink text-surface transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={newRowDisabled}
                    onClick={saveNew}
                    title={
                      !newDraft.title.trim() || !newDraft.cost || !newDraft.providerId || !newDraft.responsibleId
                        ? "Completá título, costo, proveedor y responsable"
                        : "Agregar gasto"
                    }
                    type="button"
                  >
                    <Check aria-hidden="true" className="size-4" />
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
                <span className="inline-flex items-center justify-end gap-1 text-sm">
                  <PesoSign />
                  {formatAmount(totals.cost)}
                </span>
              </td>
              <td className="px-2 py-2.5" />
              <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-ink">
                <span className="inline-flex items-center justify-end gap-1 text-sm">
                  <PesoSign />
                  {formatAmount(totals.paid)}
                </span>
              </td>
              <td className="px-2 py-2.5 text-right font-semibold tabular-nums text-ink">
                <span className="inline-flex items-center justify-end gap-1 text-sm">
                  {totals.pending < 0 ? "-" : null}
                  <PesoSign />
                  {formatAmount(Math.abs(totals.pending))}
                </span>
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs leading-5 text-brand sm:hidden">
        Deslizá horizontalmente para ver todas las columnas.
      </p>

      {paymentFor ? (
        <ExpensePaymentModal
          addAction={addPaymentAction.bind(null, paymentFor.id)}
          expense={paymentFor}
          onClose={closePaymentModal}
          removeAction={removePaymentAction.bind(null, paymentFor.id)}
          updateAction={updatePaymentAction.bind(null, paymentFor.id)}
        />
      ) : null}
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
        data-row-inline-form
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
          aria-label="Agregar responsable"
          className="grid size-7 shrink-0 place-items-center rounded-md border border-ink bg-ink text-surface transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isSubmitting || name.trim().length < 2}
          type="submit"
        >
          <Check aria-hidden="true" className="size-4" />
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
      className={`absolute inset-y-0 -right-1.5 w-3 cursor-col-resize touch-none transition ${
        isDragging ? "bg-ink/15" : "hover:bg-brand/10"
      }`}
      onPointerCancel={onPointerUp}
      onPointerDown={(event) => onPointerDown(columnKey, event)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <span
        className={`absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 transition ${
          isDragging ? "bg-ink" : "bg-brand/60"
        }`}
      />
    </span>
  );
}

function FilterMultiSelect({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handleOutsideClick(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [open]);

  function toggleValue(value) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        className={filterMultiControlClass}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {selected.length === 0 ? (
          <span className="px-1 text-brand">Todos</span>
        ) : (
          selected.map((value) => {
            const option = options.find((item) => item.value === value);
            return (
              <span className={filterPillClass} key={value}>
                {option?.label ?? value}
                <button
                  aria-label={`Quitar ${label}: ${option?.label ?? value}`}
                  className="grid size-4 place-items-center rounded-full text-brand transition hover:bg-brand/10"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    toggleValue(value);
                  }}
                  type="button"
                >
                  <X aria-hidden="true" className="size-3" />
                </button>
              </span>
            );
          })
        )}
        <ChevronDown aria-hidden="true" className={filterChevronClass} />
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 w-full min-w-48 rounded-md border border-accent bg-surface p-1 shadow-xl">
          {options.map((option) => {
            const checked = selected.includes(option.value);
            return (
              <label
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink transition hover:bg-accent/40"
                key={option.value}
              >
                <input
                  checked={checked}
                  className="size-4 shrink-0 cursor-pointer accent-secondary"
                  onChange={() => toggleValue(option.value)}
                  type="checkbox"
                />
                <span className="min-w-0 truncate">{option.label}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
