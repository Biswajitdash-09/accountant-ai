import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "info" | "gradient"
  showValue?: boolean
  label?: string
  className?: string
  animated?: boolean
}

const ProgressIndicator = ({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showValue = false,
  label,
  className,
  animated = true,
}: ProgressIndicatorProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  }

  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
    gradient: "gradient-primary",
  }

  const getVariantColor = () => {
    if (variant === "gradient") return "from-primary to-primary-glow"
    return variantClasses[variant]
  }

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-foreground">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={cn(
        "w-full bg-muted rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <motion.div
          className={cn(
            "h-full rounded-full transition-all duration-smooth",
            variant === "gradient" 
              ? "bg-gradient-to-r from-primary to-primary-glow" 
              : variantClasses[variant]
          )}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { 
            duration: 1.2, 
            ease: [0.4, 0, 0.2, 1],
            delay: 0.2 
          } : undefined}
        />
      </div>
    </div>
  )
}

// Circular Progress Component
interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: "default" | "success" | "warning" | "info"
  showValue?: boolean
  className?: string
  animated?: boolean
}

const CircularProgress = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  variant = "default",
  showValue = true,
  className,
  animated = true,
}: CircularProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const variantColors = {
    default: "stroke-primary",
    success: "stroke-success",
    warning: "stroke-warning",
    info: "stroke-info",
  }

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : offset}
          className={variantColors[variant]}
          animate={animated ? { strokeDashoffset: offset } : undefined}
          transition={animated ? { 
            duration: 1.2, 
            ease: [0.4, 0, 0.2, 1],
            delay: 0.2 
          } : undefined}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

export { ProgressIndicator, CircularProgress }