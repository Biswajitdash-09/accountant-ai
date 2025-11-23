/**
 * Request Manager - Prevents duplicate requests and implements request deduplication
 */

type PendingRequest = {
  promise: Promise<any>;
  timestamp: number;
};

class RequestManager {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private requestTimeout = 30000; // 30 seconds

  /**
   * Execute a request with deduplication
   * If same request is already in progress, return that promise
   */
  async execute<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const existing = this.pendingRequests.get(key);
    
    if (existing) {
      // Check if request hasn't timed out
      if (Date.now() - existing.timestamp < this.requestTimeout) {
        console.log(`[RequestManager] Reusing pending request: ${key}`);
        return existing.promise as Promise<T>;
      } else {
        // Remove stale request
        this.pendingRequests.delete(key);
      }
    }

    // Create new request
    const promise = requestFn()
      .then((result) => {
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Clear a specific pending request
   */
  clear(key: string): void {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get number of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

export const requestManager = new RequestManager();
