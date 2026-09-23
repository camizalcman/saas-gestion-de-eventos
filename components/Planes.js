"use client";

import { useState } from "react";
import { Check, Crown, Users } from "lucide-react";

const cardClases = {
  normal:
    "flex flex-col rounded-3xl border border-secondary bg-white p-7 sm:p-8",
  destacado:
    "relative flex flex-col rounded-3xl border border-secondary bg-brand p-7 shadow-[0_24px_60px_-24px_rgba(32,80,110,0.45)] sm:p-8",
};

const ctaClases = {
  normal:
    "inline-flex h-11 items-center justify-center rounded-lg border border-secondary bg-secondary px-6 text-sm font-semibold text-surface transition hover:border-brand hover:bg-brand",
  destacado:
    "inline-flex h-11 items-center justify-center rounded-lg border border-surface bg-surface px-6 text-sm font-semibold text-brand transition hover:border-secondary hover:bg-secondary hover:text-surface",
};

const modalidades = {
  personal: {
    intro: "Esta modalidad funciona mediante un",
    resaltado: "pago único por evento",
  },
  empresas: {
    intro: "Esta modalidad funciona mediante una",
    resaltado: "suscripción mensual",
  },
};

const planesPersonales = [
  {
    nombre: "Primer evento",
    precio: "$100.000",
    subtitulo: "Todo lo que necesitás para organizar tu evento.",
    cta: "Crear mi evento",
    destacado: false,
    caracteristicas: [
      "Invitación digital personalizada",
      "Gestión de invitados",
      "Confirmación de asistencia (RSVP)",
      "Organización de mesas",
      "Cronograma del evento",
      "Gestión de proveedores",
      "Presupuesto",
      "Acceso a todas las funcionalidades de la plataforma",
    ],
  },
  {
    nombre: "Segundo evento",
    precio: "$80.000",
    subtitulo: "Volvé a organizar tu evento con un precio especial.",
    cta: "Crear mi evento",
    destacado: false,
    caracteristicas: [
      "Todo lo incluido en el primer evento",
      "Precio especial por recurrencia",
      "Reutilización de configuraciones anteriores",
    ],
  },
  {
    nombre: "Tercer evento en adelante",
    precio: "$50.000",
    subtitulo: "El precio más conveniente para usuarios recurrentes.",
    cta: "Crear mi evento",
    destacado: true,
    caracteristicas: [
      "Todo lo incluido en los eventos anteriores",
      "Precio especial por recurrencia",
      "Reutilización de configuraciones anteriores",
    ],
  },
];

const planesEmpresas = [
  {
    nombre: "Plan Básico",
    precio: "$30.000",
    porMes: true,
    limite: "Hasta 5 eventos activos",
    subtitulo:
      "Para planners y equipos pequeños que gestionan varios eventos.",
    cta: "Elegir Plan Básico",
    destacado: false,
    caracteristicas: [
      { texto: "Hasta 5 eventos activos simultáneamente", resaltada: true },
      "Gestión de múltiples eventos",
      "Invitaciones digitales",
      "Gestión de invitados y RSVP",
      "Organización de mesas",
      "Cronogramas",
      "Gestión de proveedores",
      "Presupuestos",
      "Panel centralizado para administrar los eventos",
    ],
  },
  {
    nombre: "Plan Full / Ilimitado",
    precio: "$50.000",
    porMes: true,
    badge: "Sin límites",
    subtitulo:
      "Para productoras y equipos que gestionan un gran volumen de eventos.",
    cta: "Elegir Plan Full",
    destacado: true,
    caracteristicas: [
      { texto: "Eventos activos ilimitados", resaltada: true },
      "Gestión de múltiples eventos simultáneamente",
      "Invitaciones digitales",
      "Gestión de invitados y RSVP",
      "Organización de mesas",
      "Cronogramas",
      "Gestión de proveedores",
      "Presupuestos",
      "Panel centralizado para administrar todos los eventos",
      { texto: "Soporte directo vía WhatsApp", resaltada: true },
    ],
  },
];

function Caracteristica({ caracteristica, destacado }) {
  const texto = caracteristica.texto || caracteristica;
  const resaltada = caracteristica.resaltada;

  return (
    <li className="flex items-start gap-2.5">
      <Check
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 text-secondary"
      />
      <span
        className={`text-sm leading-6 ${
          resaltada
            ? destacado
              ? "font-semibold text-secondary"
              : "font-semibold text-brand"
            : destacado
              ? "text-surface/85"
              : "text-ink/80"
        }`}
      >
        {texto}
      </span>
    </li>
  );
}

function PlanCard({ plan }) {
  const destacado = plan.destacado;

  return (
    <article
      className={`${cardClases[destacado ? "destacado" : "normal"]} ${
        destacado ? "relative z-10 md:scale-[1.03]" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {plan.badge ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-surface">
            <Crown aria-hidden="true" className="size-3.5" />
            {plan.badge}
          </span>
        ) : plan.limite ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            <Users aria-hidden="true" className="size-3.5" />
            {plan.limite}
          </span>
        ) : null}
      </div>

      <div className="mt-0.5 flex items-baseline gap-3 pt-4">
        <span
          className={`font-serif text-5xl font-semibold tracking-tight ${
            destacado ? "text-surface" : "text-ink"
          }`}
        >
          {plan.precio}
        </span>
        {plan.porMes ? (
          <span
            className={`text-lg font-semibold ${
              destacado ? "text-surface/80" : "text-ink/60"
            }`}
          >
            /mes
          </span>
        ) : null}
      </div>

      <h3
        className={`mt-3 font-serif text-2xl font-semibold tracking-tight ${
          destacado ? "text-surface" : "text-ink"
        }`}
      >
        {plan.nombre}
      </h3>
      <p
        className={`mt-2 text-sm leading-6 ${
          destacado ? "text-surface/80" : "text-ink/70"
        }`}
      >
        {plan.subtitulo}
      </p>

      <div
        className={`my-6 h-px w-full ${
          destacado ? "bg-surface/20" : "bg-accent"
        }`}
      />

      <ul className="grid flex-1 content-start gap-2.5">
        {plan.caracteristicas.map((caracteristica, i) => (
          <Caracteristica
            caracteristica={caracteristica}
            destacado={destacado}
            key={`${caracteristica.texto || caracteristica}-${i}`}
          />
        ))}
      </ul>

      <a
        className={`${ctaClases[destacado ? "destacado" : "normal"]} mt-8 w-full`}
        href="/login"
      >
        {plan.cta}
      </a>
    </article>
  );
}

export default function Planes() {
  const [tab, setTab] = useState("personal");
  const esPersonal = tab === "personal";
  const modalidad = modalidades[tab];

  return (
    <section
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-30 sm:px-6 lg:px-8"
      id="planes"
    >
      <div className="mb-8 flex flex-col items-center gap-4">
        <h2 className="text-center font-serif text-2xl font-semibold tracking-wide text-ink sm:text-3xl">
          Planes de Pago
        </h2>
        <span className="h-px w-80 bg-gradient-to-r from-transparent via-brand to-transparent" />
      </div>

      <div className="mb-10 flex justify-center">
        <div
          className="inline-flex rounded-full border border-accent bg-white p-1"
          role="tablist"
        >
          {["personal", "empresas"].map((nombre) => {
            const activo = tab === nombre;
            return (
              <button
                aria-selected={activo}
                key={nombre}
                onClick={() => setTab(nombre)}
                role="tab"
                type="button"
                className={`h-10 min-w-32 rounded-full px-6 text-sm font-semibold capitalize transition ${
                  activo
                    ? "bg-brand text-surface"
                    : "text-ink/70 hover:text-secondary"
                }`}
              >
                {nombre}
              </button>
            );
          })}
        </div>
      </div>

      <div key={tab} className="animate-fade-in-up">
        <p className="mb-10 text-center text-sm leading-6 text-ink/70">
          {modalidad.intro}{" "}
          <strong className="font-semibold text-ink">{modalidad.resaltado}</strong>
          .
        </p>

        {esPersonal ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {planesPersonales.map((plan) => (
              <PlanCard key={plan.nombre} plan={plan} />
            ))}
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-4xl gap-6 md:grid-cols-2">
            {planesEmpresas.map((plan) => (
              <PlanCard key={plan.nombre} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}