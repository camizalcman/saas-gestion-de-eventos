"use client";

import { useState } from "react";

const faqs = [
  {
    pregunta: "¿Qué tipo de evento permite gestionar la plataforma?",
    respuesta:
      "La plataforma permite gestionar casamientos, cumpleaños, bautismos, bnei mitzvot y cualquier tipo de fiesta o evento.",
  },
  {
    pregunta: "¿Los invitados necesitan descargarse una app para confirmar asistencia?",
    respuesta:
      "No. Los invitados ingresan directo desde el navegador mediante el link que les compartís.",
  },
  {
    pregunta:
      "¿Puedo empezar a armar la invitación si todavía no tengo confirmado el salón o la fecha?",
    respuesta:
      "Sí. El onboarding permite saltar pasos y editar los datos más adelante.",
  },
  {
    pregunta:
      "¿Cómo se envían las mesas a los invitados el día del evento?",
    respuesta:
      "Desde el panel se dispara un mensaje al contacto registrado con su número de mesa.",
  },
  {
    pregunta: "¿Se pueden dividir los costos entre varias personas?",
    respuesta:
      "Sí. La planilla permite asignar cada gasto a un pagador específico y calcula el saldo individual.",
  },
];

export default function Faq() {
  const [abierta, setAbierta] = useState(0);

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col items-start gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Preguntas frecuentes
        </p>
        <h2 className="text-2xl font-semibold tracking-normal text-ink sm:text-3xl">
          ¿Tenés dudas? Te las respondemos
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const estaAbierta = abierta === i;
          return (
            <div className="border-b border-accent" key={faq.pregunta}>
              <button
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                onClick={() => setAbierta(estaAbierta ? -1 : i)}
              >
                <span className="text-base font-semibold text-ink">{faq.pregunta}</span>
                <span className="text-xl leading-none text-secondary">
                  {estaAbierta ? "−" : "+"}
                </span>
              </button>
              {estaAbierta ? (
                <p className="pb-5 text-sm leading-6 text-ink/80">
                  {faq.respuesta}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
