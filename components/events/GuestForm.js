export default function GuestForm({ action, defaultQuantity = 1 }) {
  return (
    <form
      action={action}
      className="grid min-w-0 gap-3 border border-accent p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-end">
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Nombre del invitado o grupo</span>
          <input
            className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
            maxLength={120}
            minLength={2}
            name="name"
            placeholder="Ej. Familia Garcia"
            required
            type="text"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Cantidad</span>
          <input
            className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
            defaultValue={defaultQuantity}
            min={1}
            max={50}
            name="quantity"
            required
            type="number"
          />
        </label>
      </div>
      <button
        className="h-11 w-full rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90 sm:w-auto sm:self-start"
        type="submit"
      >
        Agregar invitado
      </button>
    </form>
  );
}
