import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { cn } from "@/lib/utils";

interface TouchOptimizedButtonProps extends ButtonProps {
  haptic?: boolean;
  hapticStyle?: "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error";
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ className, onClick, haptic = true, hapticStyle = "light", ...props }, ref) => {
    const { trigger } = useHapticFeedback();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic) {
        trigger(hapticStyle);
      }
      onClick?.(e);
    };

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        className={cn(
          // Minimum touch target size (44x44px)
          "min-h-[44px] min-w-[44px]",
          // Better tap response
          "active:scale-95 transition-transform",
          // Prevent text selection on double-tap
          "select-none",
          className
        )}
        {...props}
      />
    );
  }
);

TouchOptimizedButton.displayName = "TouchOptimizedButton";
