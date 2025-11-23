/**
 * Performance Monitor - Track component renders, query times, and performance metrics
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'query' | 'hook' | 'navigation';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;
  private slowThreshold = 100; // ms

  /**
   * Start measuring performance
   */
  startMeasure(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type: 'query',
      });
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Warn on slow operations
    if (metric.duration > this.slowThreshold) {
      console.warn(
        `[Performance] Slow ${metric.type}: ${metric.name} took ${metric.duration.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get average duration for a specific metric
   */
  getAverage(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  /**
   * Get slowest operations
   */
  getSlowest(count: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const total = this.metrics.length;
    const slow = this.metrics.filter(m => m.duration > this.slowThreshold).length;
    const avgDuration = total > 0 
      ? this.metrics.reduce((acc, m) => acc + m.duration, 0) / total 
      : 0;

    return {
      totalMeasurements: total,
      slowOperations: slow,
      averageDuration: avgDuration.toFixed(2),
      slowestOperation: this.metrics.length > 0 
        ? this.metrics.reduce((a, b) => a.duration > b.duration ? a : b)
        : null,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Development mode helper
if (import.meta.env.DEV) {
  (window as any).__performanceMonitor = performanceMonitor;
  console.log('[Performance] Monitor available at window.__performanceMonitor');
}
