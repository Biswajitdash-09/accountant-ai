import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStart.current;
      
      // Log slow renders (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === "production" && renderTime > 100) {
        // You can send this to your analytics service
        const metrics: PerformanceMetrics = {
          renderTime,
          componentName,
        };
        
        // Example: send to analytics
        // analytics.track("slow_render", metrics);
      }
    };
  }, [componentName]);
};

export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    // Observe Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      console.log("LCP:", lastEntry.renderTime || lastEntry.loadTime);
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // Browser doesn't support LCP
    }

    // Observe First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log("FID:", entry.processingStart - entry.startTime);
      });
    });

    try {
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // Browser doesn't support FID
    }

    // Observe Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
        }
      }
      console.log("CLS:", clsScore);
    });

    try {
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // Browser doesn't support CLS
    }

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
};
