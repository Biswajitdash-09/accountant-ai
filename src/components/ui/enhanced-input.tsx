import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const enhancedInputVariants = cva(
  "flex w-full rounded-md border transition-all duration-smooth file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:border-primary/50",
        ghost: "border-transparent bg-transparent hover:bg-accent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring",
        glass: "glass border-primary/20 focus-visible:border-primary/50 focus-visible:shadow-glow",
        success: "border-success bg-success/5 focus-visible:ring-2 focus-visible:ring-success",
        warning: "border-warning bg-warning/5 focus-visible:ring-2 focus-visible:ring-warning",
        error: "border-destructive bg-destructive/5 focus-visible:ring-2 focus-visible:ring-destructive",
      },
      size: {
        default: "h-10 px-3 py-2 text-sm",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-4 text-base",
        xl: "h-12 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof enhancedInputVariants> {
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, variant, size = "default", type, label, error, success, leftIcon, rightIcon, ...props }, ref) => {
    const inputVariant = error ? "error" : success ? "success" : variant
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              enhancedInputVariants({ variant: inputVariant, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
        {success && !error && (
          <p className="text-sm text-success animate-fade-in">{success}</p>
        )}
      </div>
    )
  }
)
EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput, enhancedInputVariants }