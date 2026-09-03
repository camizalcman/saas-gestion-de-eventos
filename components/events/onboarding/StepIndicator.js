"use client";

const STEPS = [
  { id: 1, label: "Identidad" },
  { id: 2, label: "Detalles" },
  { id: 3, label: "Portada" },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;

          return (
            <div key={step.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`grid size-9 place-items-center rounded-full border text-sm font-semibold transition ${
                    isActive
                      ? "border-secondary bg-secondary text-surface"
                      : isDone
                        ? "border-secondary bg-secondary/20 text-ink"
                        : "border-accent bg-accent text-brand"
                  }`}
                >
                  {isDone ? (
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`text-xs transition ${
                    isActive ? "font-semibold text-ink" : "text-brand"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 mb-5 h-px flex-1 transition ${
                    isDone ? "bg-secondary" : "bg-accent"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
