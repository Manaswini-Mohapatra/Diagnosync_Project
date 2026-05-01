import React from "react";

/**
 * RegistrationStepper
 *
 * Props:
 *   currentStep  {number}  – 1-indexed active step (1–5)
 *   onStepClick  {(id: number) => void}  – optional, called when a completed step is clicked
 *
 * Steps (fixed for Patient Registration):
 *   1 – Basic Information
 *   2 – Medical History
 *   3 – Lifestyle
 *   4 – Emergency Contact
 *   5 – Documents Upload
 */

const DEFAULT_STEPS = [
  { id: 1, label: "Basic Information" },
  { id: 2, label: "Medical History" },
  { id: 3, label: "Lifestyle" },
  { id: 4, label: "Emergency Contact" },
  { id: 5, label: "Documents Upload" },
];

// Checkmark SVG (inline so no extra dep needed)
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Vertical stepper (md and above) ─────────────────────────────────────────
function VerticalStepper({ currentStep, onStepClick, steps }) {
  return (
    <ol className="hidden md:flex flex-col select-none">
      {steps.map((step, idx) => {
        const isCompleted = step.id < currentStep;
        const isCurrent   = step.id === currentStep;
        const isPending   = step.id > currentStep;
        const isLast      = idx === steps.length - 1;

        return (
          <li key={step.id} className="flex gap-4">
            {/* Left column: circle + connector line */}
            <div className="flex flex-col items-center">
              {/* Circle */}
              <button
                type="button"
                disabled={isPending}
                onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
                aria-label={`Step ${step.id}: ${step.label}`}
                className={[
                  "flex items-center justify-center rounded-full shrink-0 transition-all duration-300 focus:outline-none",
                  /* size */
                  isCurrent ? "w-11 h-11" : "w-10 h-10",
                  /* colours */
                  isCompleted
                    ? "bg-[#1F5F7A] text-white cursor-pointer hover:brightness-110"
                    : isCurrent
                    ? "bg-[#1F5F7A] text-white ring-4 ring-[#1F5F7A]/20 shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-default",
                ].join(" ")}
              >
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <span
                    className={[
                      "font-bold leading-none",
                      isCurrent ? "text-base" : "text-sm",
                    ].join(" ")}
                  >
                    {step.id}
                  </span>
                )}
              </button>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={[
                    "w-0.5 flex-1 my-1 min-h-[28px] rounded-full transition-colors duration-500",
                    isCompleted ? "bg-[#1F5F7A]/50" : "bg-gray-200",
                  ].join(" ")}
                />
              )}
            </div>

            {/* Right column: label */}
            <div
              className={[
                "flex items-start pb-8 last:pb-0",
                isLast ? "" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "text-sm leading-snug transition-colors duration-200 mt-[10px]",
                  isCurrent
                    ? "font-bold text-[#1F5F7A]"
                    : isCompleted
                    ? "font-semibold text-gray-700"
                    : "font-medium text-gray-400",
                ].join(" ")}
              >
                {step.label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ─── Horizontal progress bar (mobile) ────────────────────────────────────────
function HorizontalProgress({ currentStep, steps }) {
  const progress = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);
  const currentLabel = steps.find((s) => s.id === currentStep)?.label ?? "";

  return (
    <div className="md:hidden w-full">
      {/* Step indicators row */}
      <div className="flex items-center justify-between mb-2 gap-1">
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent   = step.id === currentStep;
          return (
            <div
              key={step.id}
              className={[
                "flex-1 h-1.5 rounded-full transition-all duration-500",
                isCompleted
                  ? "bg-[#1F5F7A]"
                  : isCurrent
                  ? "bg-[#1F5F7A]/50"
                  : "bg-gray-200",
              ].join(" ")}
            />
          );
        })}
      </div>

      {/* Label row */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className="font-medium">
          Step {currentStep} of {steps.length}
        </span>
        <span className="font-semibold text-[#1F5F7A] truncate max-w-[60%] text-right">
          {currentLabel}
        </span>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function RegistrationStepper({ currentStep = 1, onStepClick, steps = DEFAULT_STEPS }) {
  return (
    <>
      {/* Mobile */}
      <HorizontalProgress currentStep={currentStep} steps={steps} />

      {/* Desktop */}
      <VerticalStepper currentStep={currentStep} onStepClick={onStepClick} steps={steps} />
    </>
  );
}
