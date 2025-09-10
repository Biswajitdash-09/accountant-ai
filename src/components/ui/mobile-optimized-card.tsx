import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface MobileOptimizedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  touchable?: boolean;
  swipeable?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const MobileOptimizedCard = React.forwardRef<
  HTMLDivElement,
  MobileOptimizedCardProps
>(({ 
  className, 
  touchable = false, 
  swipeable = false,
  onSwipeLeft,
  onSwipeRight,
  children,
  ...props 
}, ref) => {
  const touchStart = React.useRef<{ x: number; y: number } | null>(null);
  const touchEnd = React.useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!swipeable) return;
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, [swipeable]);

  const onTouchMove = React.useCallback((e: React.TouchEvent) => {
    if (!swipeable) return;
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, [swipeable]);

  const onTouchEndHandler = React.useCallback(() => {
    if (!swipeable || !touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;

    // Only trigger if horizontal swipe is more prominent than vertical
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    }
  }, [swipeable, onSwipeLeft, onSwipeRight]);

  return (
    <Card
      ref={ref}
      className={cn(
        "mobile-card transition-all duration-200",
        touchable && "mobile-touch touch-feedback active:scale-[0.98] cursor-pointer",
        swipeable && "touch-manipulation select-none",
        className
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      {...props}
    >
      {children}
    </Card>
  );
});

MobileOptimizedCard.displayName = "MobileOptimizedCard";

export { MobileOptimizedCard };