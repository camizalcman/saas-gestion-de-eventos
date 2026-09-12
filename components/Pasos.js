import {
  CalendarHeart,
  PartyPopper,
  Send,
  Wallet,
} from "lucide-react";

const pasos = [
  {
    numero: "1",
    titulo: "Creá tu evento",
    icono: CalendarHeart,
    descripcion:
      "Elegí el tipo de fiesta e incluí todos los detalles.",
  },
  {
    numero: "2",
    titulo: "Armá las invitaciones",
    icono: Send,
    descripcion:
      "Personalizá tu invitación digital y enviá el enlace a tus invitados.",
  },
  {
    numero: "3",
    titulo: "Organizá tu evento",
    icono: Wallet,
    descripcion:
      "Gestioná los proveedores, confirmación de invitados y su ubicación en las mesas.",
  },
  {
    numero: "4",
    titulo: "Disfrutá la fiesta",
    icono: PartyPopper,
    descripcion:
      "El sistema envía notificaciones sin que te tengas que ocupar.",
  },
];

export default function Pasos() {
  return (
    <section className="bg-surface py-20 md:py-16">
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-16">
          <h2 className="font-serif mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
           ¿Cómo utilizarla?
          </h2>
          <span className="mx-auto mt-4 block h-px w-80 bg-gradient-to-r from-transparent via-brand to-transparent" />
        </div>

        <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 right-0 top-7 hidden border-t border-accent md:block"
          />

          {pasos.map((paso) => {
            const Icono = paso.icono;
            return (
              <li
                key={paso.numero}
                className="group relative flex flex-col items-center text-center transition duration-300 hover:-translate-y-1"
              >
                <div className="relative flex size-14 items-center justify-center rounded-full border border-brand bg-surface transition duration-300 group-hover:border-secondary group-hover:bg-secondary/10">
                  <Icono className="size-6 text-brand transition duration-300 group-hover:text-secondary" />
                </div>

                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
                  Paso {paso.numero}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-ink">
                  {paso.titulo}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-brand">
                  {paso.descripcion}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
