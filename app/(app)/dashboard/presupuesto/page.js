import { redirect } from "next/navigation";
import ToastProvider from "@/components/ToastProvider";
import BudgetCard from "@/components/events/BudgetCard";
import ExpensesSheet from "@/components/events/ExpensesSheet";
import { getActiveEvent } from "@/lib/events/active";
import { computeBudgetSummary } from "@/lib/events/events";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  addExpense,
  addExpensePayment,
  addPaymentResponsible,
  removeExpense,
  removeExpensePayment,
  saveBudget,
  updateExpense,
  updateExpensePayment,
} from "../actions";

export const dynamic = "force-dynamic";

function formatMoney(value) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch {
    return `$${Number(value || 0).toLocaleString("es-AR")}`;
  }
}

export default async function PresupuestoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const event = await getActiveEvent(user);
  if (!event) redirect("/dashboard");

  const expenses = event.expenses || [];
  const providers = event.providers || [];
  const responsibles = event.paymentResponsibles || [];
  const summary = computeBudgetSummary(event);
  const pendingToPay = Math.max(summary.totalSpent - summary.totalPaid, 0);
  const hasBudget = summary.budget > 0;
  const spentPercent = hasBudget
    ? Math.min(100, Math.round((summary.totalSpent / summary.budget) * 100))
    : 0;
  const spentRawPercent = hasBudget
    ? (summary.totalSpent / summary.budget) * 100
    : 0;
  const overBudget = hasBudget && summary.balance < 0;
  const spentFill = !hasBudget
    ? "bg-accent"
    : overBudget
      ? "bg-danger"
      : spentRawPercent >= 80
        ? "bg-warning"
        : "bg-brand";
  const spentCaption = !hasBudget
    ? "Definí el presupuesto para ver el avance de lo gastado."
    : overBudget
      ? `Gastaste el ${Math.round(spentRawPercent)}% de tu presupuesto - te pasaste ${formatMoney(Math.abs(summary.balance))}`
      : `Gastaste el ${spentPercent}% de tu presupuesto - quedan ${formatMoney(summary.balance)}`;

  return (
    <ToastProvider>
      <header className="border-b border-accent pb-5">
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-ink sm:text-3xl font-serif">
          Presupuesto
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-brand">
          Controlá los gastos del evento “{event.title}”.
        </p>
      </header>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BudgetCard action={saveBudget} current={summary.budget} />

        <div className="rounded-lg border border-accent bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Saldo
          </p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-ink">
            {formatMoney(Math.abs(summary.balance))}
          </p>
          <div className="mt-4">
            <div
              aria-label="Avance del presupuesto"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={spentPercent}
              className="h-2.5 w-full overflow-hidden rounded-full bg-accent/50"
              role="progressbar"
            >
              <div
                className={`h-full rounded-full ${spentFill}`}
                style={{ width: `${spentPercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-brand">
              {spentCaption}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-accent bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Total gastado
          </p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-ink">
            {formatMoney(summary.totalSpent)}
          </p>
          <p className="mt-1 text-sm text-brand">
            Suma de los costos cargados
          </p>
        </div>
        <div className="rounded-lg border border-accent bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Pendiente de pago
          </p>
          <p className="mt-2 text-xl font-semibold tabular-nums text-ink">
            {formatMoney(pendingToPay)}
          </p>
          <p className="mt-1 text-sm text-brand">
            Lo que falta pagar
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ExpensesSheet
          addAction={addExpense}
          addPaymentAction={addExpensePayment}
          addResponsibleAction={addPaymentResponsible}
          expenses={expenses}
          providers={providers}
          removeAction={removeExpense}
          removePaymentAction={removeExpensePayment}
          responsibles={responsibles}
          storageKey={`expenses-sheet-columns:${user.uid}`}
          updateAction={updateExpense}
          updatePaymentAction={updateExpensePayment}
        />
      </div>
    </ToastProvider>
  );
}