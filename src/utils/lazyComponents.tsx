import { lazy, Suspense, ComponentType } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load heavy components with loading fallback
export const lazyLoadComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Heavy page components that should be lazy loaded (have default exports)
export const LazyAIAssistant = lazyLoadComponent(
  () => import("@/pages/AIAssistant")
);

export const LazyReports = lazyLoadComponent(
  () => import("@/pages/Reports")
);

export const LazyAdvancedFeatures = lazyLoadComponent(
  () => import("@/pages/AdvancedFeaturesEnhanced")
);

export const LazyHMRCIntegration = lazyLoadComponent(
  () => import("@/pages/HMRCIntegration")
);

export const LazyScanner = lazyLoadComponent(
  () => import("@/pages/Scanner")
);
