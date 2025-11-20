import { forwardRef, InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MobileFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  inputMode?: "text" | "email" | "tel" | "url" | "numeric" | "decimal" | "search";
}

export const MobileFormField = forwardRef<HTMLInputElement, MobileFormFieldProps>(
  ({ label, error, hint, className, inputMode, type, ...props }, ref) => {
    // Auto-detect appropriate input mode
    const autoInputMode = inputMode || (
      type === "email" ? "email" :
      type === "tel" ? "tel" :
      type === "url" ? "url" :
      type === "number" ? "numeric" :
      "text"
    );

    return (
      <div className="space-y-2">
        <Label htmlFor={props.id} className="text-base">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        <Input
          ref={ref}
          type={type}
          inputMode={autoInputMode}
          className={cn(
            // Larger touch target
            "h-12 text-base",
            // Better focus visibility
            "focus-visible:ring-2 focus-visible:ring-primary",
            // Error state
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
          }
          {...props}
        />

        {hint && !error && (
          <p id={`${props.id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )}

        {error && (
          <p
            id={`${props.id}-error`}
            className="text-sm text-destructive font-medium"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

MobileFormField.displayName = "MobileFormField";
