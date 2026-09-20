import { redirect } from "next/navigation";
import ToastProvider from "@/components/ToastProvider";
import BudgetCard from "@/components/events/BudgetCard";
import ExpensesSheet from "@/components/events/ExpensesSheet";
import { getActiveEvent } from "@/lib/events/active";
import { computeBudgetSummary } from "@/lib/events/events";
import { getCurrentUser } from "@/lib/firebase/session";
import {
  addExpense,
  addPaymentResponsible,
  removeExpense,
  saveBudget,
  updateExpense,
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

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <BudgetCard action={saveBudget} current={summary.budget} />
        <div className="rounded-lg border border-accent bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Total gastado
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">
            {formatMoney(summary.totalSpent)}
          </p>
          <p className="mt-1 text-sm text-brand">
            Suma de los costos cargados
          </p>
        </div>
        <div className="rounded-lg border border-accent bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
            Pendiente de pago
          </p>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">
            {formatMoney(pendingToPay)}
          </p>
          <p className="mt-1 text-sm text-brand">
            Lo que falta pagar (saldo)
          </p>
        </div>
      </div>

      <div className="mt-6">
        <ExpensesSheet
          addAction={addExpense}
          addResponsibleAction={addPaymentResponsible}
          expenses={expenses}
          providers={providers}
          removeAction={removeExpense}
          responsibles={responsibles}
          storageKey={`expenses-sheet-columns:${user.uid}`}
          updateAction={updateExpense}
        />
      </div>
    </ToastProvider>
  );
}