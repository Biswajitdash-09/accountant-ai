import React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedCounter } from "./animated-counter"

interface MetricDisplayProps {
  title: string
  value: number
  previousValue?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: number
  trendLabel?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "glass" | "gradient" | "success" | "warning" | "info"
  loading?: boolean
  animate?: boolean
}

const MetricDisplay = ({
  title,
  value,
  previousValue,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
  trend,
  trendValue,
  trendLabel,
  size = "md",
  variant = "default",
  loading = false,
  animate = true,
  ...props
}: MetricDisplayProps) => {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  }

  const titleSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  }

  const valueSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  }

  const variantClasses = {
    default: "bg-card border shadow-soft",
    glass: "glass",
    gradient: "gradient-card border-primary/20",
    success: "bg-success/10 border-success/20",
    warning: "bg-warning/10 border-warning/20",
    info: "bg-info/10 border-info/20",
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />
      case "neutral":
        return <Minus className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success"
      case "down":
        return "text-destructive"
      case "neutral":
        return "text-muted-foreground"
      default:
        return "text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className={cn(
        "rounded-lg border",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}>
        <div className="space-y-3">
          <div className="h-4 bg-muted/50 rounded animate-shimmer" />
          <div className="h-8 bg-muted/50 rounded animate-shimmer" />
          <div className="h-3 bg-muted/50 rounded w-24 animate-shimmer" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        "rounded-lg border transition-all duration-smooth",
        sizeClasses[size],
        variantClasses[variant],
        "hover-lift",
        className
      )}
      initial={animate ? { opacity: 0, scale: 0.95 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
      {...props}
    >
      <div className="space-y-2">
        <p className={cn(
          "font-medium text-muted-foreground",
          titleSizeClasses[size]
        )}>
          {title}
        </p>
        
        <div className={cn(
          "font-bold font-display",
          valueSizeClasses[size]
        )}>
          {animate ? (
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              duration={1.5}
            />
          ) : (
            `${prefix}${value.toFixed(decimals)}${suffix}`
          )}
        </div>

        {(trend || trendValue !== undefined) && (
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {trendValue !== undefined && (
              <span className={cn(
                "text-sm font-medium",
                getTrendColor()
              )}>
                {trendValue > 0 ? "+" : ""}{trendValue.toFixed(1)}%
              </span>
            )}
            {trendLabel && (
              <span className="text-sm text-muted-foreground">
                {trendLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export { MetricDisplay }