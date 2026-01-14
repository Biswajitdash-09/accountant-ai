import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { surveySteps } from "./surveyConfig";

interface SurveyProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export const SurveyProgress = ({ currentStep, totalSteps = 4 }: SurveyProgressProps) => {
  return (
    <div className="w-full mb-6">
      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute left-0 top-0 h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Step indicators */}
      <div className="hidden sm:flex justify-between">
        {surveySteps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center flex-1"
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary text-primary bg-background"
                    : "border-muted-foreground/30 text-muted-foreground bg-background"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </motion.div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  isCurrent ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile step indicator */}
      <div className="sm:hidden flex items-center justify-center gap-2">
        <span className="text-sm font-medium text-primary">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          — {surveySteps[currentStep - 1]?.title}
        </span>
      </div>
    </div>
  );
};
