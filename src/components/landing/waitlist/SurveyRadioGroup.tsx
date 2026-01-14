import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { SurveyOption } from "./surveyConfig";

interface SurveyRadioGroupProps {
  label: string;
  options: SurveyOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const SurveyRadioGroup = ({
  label,
  options,
  value,
  onChange,
  required = false,
}: SurveyRadioGroupProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 text-left transition-all min-h-[56px] ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              {option.icon && (
                <span className="text-lg flex-shrink-0">{option.icon}</span>
              )}
              <span
                className={`text-sm sm:text-base ${
                  isSelected ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
              >
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
