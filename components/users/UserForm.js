export default function UserForm({
  action,
  user,
  showCredentials = false,
  submitLabel = "Guardar",
}) {
  return (
    <form action={action} className="grid min-w-0 gap-4 border border-accent p-4 sm:p-5">
      {showCredentials ? (
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Email</span>
          <input
            className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
            name="email"
            type="email"
            defaultValue={user?.email || ""}
            required
          />
        </label>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Nombre visible</span>
        <input
          className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
          name="displayName"
          defaultValue={user?.displayName || ""}
        />
      </label>

      {showCredentials ? (
        <label className="grid gap-2 text-sm font-medium text-ink">
          <span>Contrasena</span>
          <input
            className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </label>
      ) : null}

      <label className="grid gap-2 text-sm font-medium text-ink">
        <span>Tipo de usuario</span>
        <select
          className="h-11 rounded-md border border-accent bg-surface px-3 text-ink outline-none transition focus:border-secondary"
          name="user_type"
          defaultValue={user?.user_type || "user"}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>

      <button
        className="h-11 w-full rounded-md border border-secondary bg-secondary px-4 text-sm font-semibold text-surface transition hover:bg-secondary/90"
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}
