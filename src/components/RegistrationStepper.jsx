import React from "react";

const DEFAULT_STEPS = [
  { id: 1, label: "Basic Information" },
  { id: 2, label: "Medical History" },
  { id: 3, label: "Lifestyle" },
  { id: 4, label: "Emergency Contact" },
  { id: 5, label: "Documents Upload" },
];

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
           
            <div className="flex flex-col items-center">
           
              <button
                type="button"
                disabled={isPending}
                onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
                aria-label={`Step ${step.id}: ${step.label}`}
                className={[
                  "flex items-center justify-center rounded-full shrink-0 transition-all duration-300 focus:outline-none",
                  
                  isCurrent ? "w-11 h-11" : "w-10 h-10",
                  
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

             
              {!isLast && (
                <div
                  className={[
                    "w-0.5 flex-1 my-1 min-h-[28px] rounded-full transition-colors duration-500",
                    isCompleted ? "bg-[#1F5F7A]/50" : "bg-gray-200",
                  ].join(" ")}
                />
              )}
            </div>

          
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


function HorizontalProgress({ currentStep, steps }) {
  const progress = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);
  const currentLabel = steps.find((s) => s.id === currentStep)?.label ?? "";

  return (
    <div className="md:hidden w-full">
      
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


export default function RegistrationStepper({ currentStep = 1, onStepClick, steps = DEFAULT_STEPS }) {
  return (
    <>
      
      <HorizontalProgress currentStep={currentStep} steps={steps} />

      
      <VerticalStepper currentStep={currentStep} onStepClick={onStepClick} steps={steps} />
    </>
  );
}
