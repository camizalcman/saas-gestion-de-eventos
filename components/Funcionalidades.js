"use client";

import Image from "next/image";
import useInView from "@/lib/useInView";

const funcionalidades = [
  {
    numero: "01",
    titulo: "Invitación digital interactiva",
    subtitulo:
      "Plantilla personalizable para incluir la información de tu evento y confirmación de asistencia en tiempo real.",
    imagen: "/foto1.jpg",
  },
  {
    numero: "02",
    titulo: "Gestión de invitados y mesas",
    subtitulo:
      "Controlá las confirmaciones, asigná las mesas y enviales a tus invitados su ubicación el día del evento.",
    imagen: "/foto2.jpg",
  },
  {
    numero: "03",
    titulo: "Cronograma y proveedores",
    subtitulo:
      "Coordiná el minuto a minuto de la fiesta junto a los contactos, horarios y tareas de cada proveedor.",
    imagen: "/foto3.jpg",
  },
  {
    numero: "04",
    titulo: "Presupuesto y división de gastos",
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
        <p className="text-md leading-6 text-surface/80">
          {f.subtitulo}
        </p>
      </div>

      <div
        className={`relative overflow-hidden rounded-3xl h-52 lg:h-52 ${
          index % 2 === 1 ? "lg:order-1" : ""
        }`}
      >
        <Image
          alt={f.titulo}
          className="object-cover transition duration-500 ease-out hover:scale-105 hover:grayscale"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          src={f.imagen}
        />
      </div>
    </div>
  );
}

export default function Funcionalidades() {
  return (
    <section id="funcionalidades" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-30 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-center gap-4">
        <h2 className="text-center font-serif text-2xl font-semibold tracking-wide text-ink sm:text-3xl">
          Funcionalidades
        </h2>
        <span className="h-px w-80 bg-gradient-to-r from-transparent via-brand to-transparent" />
      </div>

      <div className="flex flex-col gap-6">
        {funcionalidades.map((f, i) => (
          <FuncionalidadCard key={f.titulo} f={f} index={i} />
        ))}
      </div>
    </section>
  );
}
