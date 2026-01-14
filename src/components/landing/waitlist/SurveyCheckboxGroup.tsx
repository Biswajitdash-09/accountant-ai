import { motion } from "framer-motion";
import { Check, Square, CheckSquare } from "lucide-react";
import { SurveyOption } from "./surveyConfig";

interface SurveyCheckboxGroupProps {
  label: string;
  options: SurveyOption[];
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
  exclusiveOption?: string; // If this option is selected, deselect others
}

export const SurveyCheckboxGroup = ({
  label,
  options,
  values,
  onChange,
  hint,
  exclusiveOption,
}: SurveyCheckboxGroupProps) => {
  const handleToggle = (optionValue: string) => {
    if (optionValue === exclusiveOption) {
      // If clicking exclusive option, only select that
      onChange(values.includes(optionValue) ? [] : [optionValue]);
    } else {
      // If clicking non-exclusive option
      const newValues = values.includes(optionValue)
        ? values.filter((v) => v !== optionValue)
        : [...values.filter((v) => v !== exclusiveOption), optionValue];
      onChange(newValues);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
        {hint && (
          <p className="text-xs text-muted-foreground mt-1">{hint}</p>
        )}
      </div>
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={`w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 text-left transition-all min-h-[56px] ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <div
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-muted-foreground/40"
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
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
