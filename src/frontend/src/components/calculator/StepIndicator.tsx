import { Check } from "lucide-react";

interface Step {
  label: string;
  sublabel?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 1-indexed
}

const STEP_OCIDS = [
  "wizard.step1_button",
  "wizard.step2_button",
  "wizard.step3_button",
  "wizard.step4_button",
];

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border z-0 mx-8" />
        <div
          className="absolute top-5 left-0 h-0.5 z-0 mx-8 transition-all duration-500"
          style={{
            background: "oklch(0.35 0.12 255)",
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={step.label}
              className="flex flex-col items-center z-10"
              data-ocid={STEP_OCIDS[index]}
            >
              <div
                className={`step-circle w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted ? "completed" : isActive ? "active" : "pending"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNum}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-semibold hidden sm:block ${
                    isActive
                      ? "text-foreground"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {step.sublabel && (
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.sublabel}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
