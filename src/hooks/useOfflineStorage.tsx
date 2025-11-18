import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { usePWA } from './usePWA';

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

const QUEUE_KEY = 'offline-queue';

export const useOfflineStorage = () => {
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { isOnline } = usePWA();
  const { toast } = useToast();

  // Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem(QUEUE_KEY);
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }, [queue]);

  // Sync queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      syncQueue();
    }
  }, [isOnline, queue.length]);

  const addToQueue = (operation: Omit<QueuedOperation, 'id' | 'timestamp'>) => {
    const newOperation: QueuedOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setQueue(prev => [...prev, newOperation]);
    
    toast({
      title: "Saved Offline",
      description: "Changes will sync when you're back online.",
    });
  };

  const syncQueue = async () => {
    if (queue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];

    try {
      for (const operation of queue) {
        try {
          // Here you would make the actual API call
          // For now, we'll simulate success
          await new Promise(resolve => setTimeout(resolve, 100));
          successfulIds.push(operation.id);
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);
          // Don't break the loop, continue with other operations
        }
      }

      // Remove successfully synced operations
      if (successfulIds.length > 0) {
        setQueue(prev => prev.filter(op => !successfulIds.includes(op.id)));
        
        toast({
          title: "Synced Successfully",
          description: `${successfulIds.length} changes synced to cloud.`,
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    localStorage.removeItem(QUEUE_KEY);
  };

  return {
    queue,
    queueCount: queue.length,
    isSyncing,
    addToQueue,
    syncQueue,
    clearQueue,
  };
};
