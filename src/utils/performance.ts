// Performance optimization utilities

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Cache function results with expiration
 */
export const memoizeWithExpiry = <T extends (...args: any[]) => any>(
  func: T,
  expiryMs: number = 5 * 60 * 1000 // 5 minutes default
) => {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>();

  return (...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && cached.expiry > now) {
      return cached.value;
    }

    const value = func(...args);
    cache.set(key, { value, expiry: now + expiryMs });

    // Clean up expired entries
    for (const [k, v] of cache.entries()) {
      if (v.expiry <= now) {
        cache.delete(k);
      }
    }

    return value;
  };
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (img: HTMLImageElement) => {
  const loadImage = () => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  } else {
    loadImage();
  }
};

/**
 * Batch multiple async operations
 */
export const batchAsync = async <T>(
  items: T[],
  operation: (item: T) => Promise<any>,
  batchSize: number = 5
): Promise<any[]> => {
  const results: any[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(operation));
    results.push(...batchResults);
  }
  
  return results;
};

/**
 * Format large numbers for display
 */
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Measure component render performance
 */
export const measureRender = (componentName: string) => {
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  const measureName = `${componentName}-render`;

  performance.mark(startMark);

  return () => {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0];
    if (measure && measure.duration > 16) {
      console.warn(`${componentName} took ${measure.duration.toFixed(2)}ms to render`);
    }
    
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  };
};

/**
 * Prefetch data for faster navigation
 */
export const prefetchData = async (url: string) => {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      fetch(url, { method: "HEAD" });
    });
  } else {
    setTimeout(() => {
      fetch(url, { method: "HEAD" });
    }, 1000);
  }
};

/**
 * Virtual scroll helper for large lists
 */
export const calculateVisibleRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return { startIndex, endIndex };
};
