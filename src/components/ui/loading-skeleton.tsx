import React from "react"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular"
  animation?: "pulse" | "shimmer" | "wave"
  lines?: number
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, variant = "default", animation = "pulse", lines = 1, ...props }, ref) => {
    const baseClasses = "bg-muted/50 rounded animate-pulse"
    
    const variantClasses = {
      default: "h-4 w-full",
      text: "h-4 w-3/4",
      circular: "h-12 w-12 rounded-full",
      rectangular: "h-32 w-full rounded-lg",
    }
    
    const animationClasses = {
      pulse: "animate-pulse",
      shimmer: "animate-shimmer bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 bg-[length:200%_100%]",
      wave: "animate-pulse",
    }

    if (variant === "text" && lines > 1) {
      return (
        <div className="space-y-2" ref={ref} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                variantClasses[variant],
                animationClasses[animation],
                index === lines - 1 && "w-1/2", // Last line shorter
                className
              )}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          animationClasses[animation],
          className
        )}
        {...props}
      />
    )
  }
)
LoadingSkeleton.displayName = "LoadingSkeleton"

// Preset skeleton components
const SkeletonCard = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 border rounded-lg", className)} {...props}>
    <div className="space-y-4">
      <LoadingSkeleton variant="rectangular" className="h-48" />
      <LoadingSkeleton variant="text" />
      <LoadingSkeleton variant="text" lines={2} />
      <div className="flex justify-between items-center">
        <LoadingSkeleton variant="text" className="w-24" />
        <LoadingSkeleton variant="rectangular" className="h-8 w-20" />
      </div>
    </div>
  </div>
)

const SkeletonProfile = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center space-x-4", className)} {...props}>
    <LoadingSkeleton variant="circular" />
    <div className="space-y-2">
      <LoadingSkeleton variant="text" className="w-32" />
      <LoadingSkeleton variant="text" className="w-24" />
    </div>
  </div>
)

const SkeletonTable = ({ className, rows = 5, ...props }: React.HTMLAttributes<HTMLDivElement> & { rows?: number }) => (
  <div className={cn("space-y-3", className)} {...props}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <LoadingSkeleton variant="circular" className="h-8 w-8" />
        <LoadingSkeleton variant="text" className="flex-1" />
        <LoadingSkeleton variant="text" className="w-20" />
        <LoadingSkeleton variant="text" className="w-16" />
      </div>
    ))}
  </div>
)

export { 
  LoadingSkeleton, 
  SkeletonCard, 
  SkeletonProfile, 
  SkeletonTable 
}