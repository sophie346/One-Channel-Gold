import React from "react";
import { Check, MapPin, CreditCard, Package } from "lucide-react";

export type CheckoutStep = "shipping" | "payment" | "review" | "confirmation";

interface Step {
  id: CheckoutStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  steps: Step[];
}

export default function CheckoutProgress({
  currentStep,
  steps,
}: CheckoutProgressProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6">
        <div className="flex items-center justify-between max-w-[600px] mx-auto">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isLastStep = index === steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isCompleted
                        ? "bg-green-600 text-white"
                        : isActive
                        ? "bg-[#f21f1f] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-6" />
                    ) : (
                      <StepIcon className="size-6" />
                    )}
                  </div>
                  <span
                    className={`text-[13px] font-medium ${
                      isActive
                        ? "text-[#f21f1f]"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {!isLastStep && (
                  <div
                    className={`h-[2px] flex-1 min-w-[24px] -mt-8 mx-1 ${
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

