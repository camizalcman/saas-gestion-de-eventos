"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import StepIndicator from "./StepIndicator";
import Step1Identity from "./Step1Identity";
import Step2Details from "./Step2Details";
import Step3Media from "./Step3Media";
import { createEvent } from "@/app/(app)/dashboard/actions";

export default function EventOnboardingWizard({ useFirebaseStorage }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    eventType: "",
    customEventType: "",
    protagonists: "",
    date: "",
    location: "",
    imageUrl: "",
    imagePath: "",
  });
  const [loading, setLoading] = useState(false);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, 3));
  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 1));

  async function handleCreate(image) {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("title", form.title);
      formData.set("description", form.description);
      formData.set("eventType", form.eventType);
      formData.set("customEventType", form.customEventType);
      formData.set("protagonists", form.protagonists);
      formData.set("date", form.date);
      formData.set("location", form.location);
      formData.set("imageUrl", image.imageUrl);
      formData.set("imagePath", image.imagePath);

      await createEvent(formData);

      setCreated(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid h-screen max-h-screen w-full grid-cols-1 overflow-hidden bg-surface text-ink md:grid-cols-2">
      <div className="relative hidden h-full max-h-screen overflow-hidden md:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Celebración"
          className="h-full w-full object-cover object-[50%_35%]"
          src="/fiesta.jpg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/20 to-transparent" />
        <div className="absolute inset-0 flex items-end p-10">
          <div>
            <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight text-surface">Cada celebración merece ser inolvidable.</h1>
          </div>
        </div>
      </div>

      <div className="flex h-full max-h-screen flex-col justify-center overflow-y-auto px-8 py-4 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          {created ? (
            <div className="grid justify-items-center gap-6 py-10 text-center">
              <div className="grid size-20 place-items-center rounded-full bg-secondary/15">
                <Check aria-hidden="true" className="size-10 text-secondary" />
              </div>
              <h2 className="max-w-sm text-2xl font-semibold tracking-wide text-ink sm:text-3xl">
                Su evento se ha creado con éxito
              </h2>
              <Link
                className="inline-flex h-12 w-full items-center justify-center rounded-md border border-secondary bg-secondary px-6 text-sm font-semibold text-surface transition hover:bg-secondary/90 sm:w-auto"
                href="/dashboard"
              >
                Ver evento
              </Link>
            </div>
          ) : (
            <>
              <StepIndicator currentStep={currentStep} />

              {currentStep === 1 && (
                <Step1Identity form={form} updateField={updateField} onNext={nextStep} />
              )}
              {currentStep === 2 && (
                <Step2Details form={form} updateField={updateField} onBack={prevStep} onNext={nextStep} />
              )}
              {currentStep === 3 && (
                <Step3Media
                  form={form}
                  onBack={prevStep}
                  onCreate={handleCreate}
                  useFirebaseStorage={useFirebaseStorage}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
