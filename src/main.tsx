import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "./index.css";

// Create query client outside of component tree
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Lazy load providers and app to ensure React is fully initialized
const initApp = async () => {
  // Dynamic imports ensure proper React initialization order
  const [
    { ThemeProvider },
    { AuthProvider },
    { CurrencyProvider },
    { default: App }
  ] = await Promise.all([
    import("@/hooks/useTheme"),
    import("@/contexts/AuthContext"),
    import("@/contexts/CurrencyContext"),
    import("./App")
  ]);

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider defaultTheme="light" storageKey="accountant-ai-theme">
              <AuthProvider>
                <CurrencyProvider>
                  <App />
                </CurrencyProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
};

initApp();
