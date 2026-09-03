"use client";

import useInView from "@/lib/useInView";

const funcionalidades = [
  {
    numero: "01",
    titulo: "Invitación Digital Interactiva",
    subtitulo:
      "Plantilla personalizable para incluir una cuenta regresiva, ubicación, confirmación de asistencia en tiempo real y todo lo necesario.",
    imagen: "/foto1.jpg",
  },
  {
    numero: "02",
    titulo: "Gestión de Invitados y Mesas",
    subtitulo:
      "Controlá las confirmaciones, asigná las mesas y enviales a tus invitados su ubicación el día del evento.",
    imagen: "/foto2.jpg",
  },
  {
    numero: "03",
    titulo: "Línea de Tiempo y Proveedores",
    subtitulo:
      "Coordiná el minuto a minuto de la fiesta junto a los contactos, horarios y tareas de cada proveedor en una única vista.",
    imagen: "/foto3.jpg",
  },
  {
    numero: "04",
    titulo: "Presupuesto y División de Gastos",
    subtitulo:
      "Llevá una planilla dinámica que calcula subtotales y divide los costos por responsable.",
    imagen: "/foto4.jpg",
  },
];

function FuncionalidadCard({ f, index }) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`grid items-stretch gap-6 lg:grid-cols-2 transition-all duration-700 ease-out ${
        isInView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div
        className={`flex flex-col justify-center gap-2 rounded-3xl bg-secondary p-6 sm:gap-3 sm:p-8 lg:h-52 ${
          index % 2 === 1 ? "lg:order-2" : ""
        }`}
      >
        <span className="text-3xl font-semibold text-surface/60">
          {f.numero}
        </span>
        <h3 className="text-xl font-semibold text-surface sm:text-2xl">
          {f.titulo}
        </h3>
        <p className="text-sm leading-6 text-surface/80">
          {f.subtitulo}
        </p>
      </div>

      <div
        className={`overflow-hidden rounded-3xl lg:h-52 ${
          index % 2 === 1 ? "lg:order-1" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={f.titulo}
          className="h-full w-full object-cover transition duration-500 ease-out hover:scale-105 hover:grayscale"
          src={f.imagen}
        />
      </div>
    </div>
  );
}

export default function Funcionalidades() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-start gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Funcionalidades
        </p>
        <h2 className="text-2xl font-semibold tracking-normal text-ink sm:text-3xl">
          Todo lo que necesitás para tu evento
        </h2>
      </div>

      <div className="flex flex-col gap-6">
        {funcionalidades.map((f, i) => (
          <FuncionalidadCard key={f.titulo} f={f} index={i} />
        ))}
      </div>
    </section>
  );
}
