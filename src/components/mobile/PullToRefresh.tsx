import { useState, useRef, useEffect, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || window.scrollY > 0) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        e.preventDefault();
        const dampedDistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(dampedDistance);
        setCanRefresh(dampedDistance >= threshold);
      }
    };

    const handleTouchEnd = async () => {
      if (canRefresh && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          setCanRefresh(false);
        }
      } else {
        setPullDistance(0);
        setCanRefresh(false);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canRefresh, isRefreshing, onRefresh, threshold, disabled]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-transform",
          "pointer-events-none z-50"
        )}
        style={{
          transform: `translateY(${pullDistance - 60}px)`,
        }}
      >
        <div className="bg-background border border-border rounded-full p-3 shadow-lg">
          <RefreshCw
            className={cn(
              "h-5 w-5 text-primary transition-transform",
              isRefreshing && "animate-spin",
              canRefresh && !isRefreshing && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: isRefreshing ? `translateY(60px)` : `translateY(${Math.min(pullDistance, 60)}px)`,
          transition: isRefreshing ? "transform 0.3s" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};
