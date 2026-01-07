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

// Additional heavy pages for better initial load performance
export const LazyAnalytics = lazyLoadComponent(
  () => import("@/pages/Analytics")
);

export const LazyTax = lazyLoadComponent(
  () => import("@/pages/Tax")
);

export const LazyTransactions = lazyLoadComponent(
  () => import("@/pages/Transactions")
);

export const LazyAccounts = lazyLoadComponent(
  () => import("@/pages/Accounts")
);

export const LazyFinancialManagement = lazyLoadComponent(
  () => import("@/pages/FinancialManagement")
);

export const LazyIntegrations = lazyLoadComponent(
  () => import("@/pages/Integrations")
);

export const LazyMarkets = lazyLoadComponent(
  () => import("@/pages/Markets")
);

export const LazySecurity = lazyLoadComponent(
  () => import("@/pages/Security")
);

export const LazyProfile = lazyLoadComponent(
  () => import("@/pages/Profile")
);

export const LazyPricing = lazyLoadComponent(
  () => import("@/pages/Pricing")
);
