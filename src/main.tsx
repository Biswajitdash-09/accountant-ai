import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Bootstrap the app with all dependencies loaded dynamically
// This ensures React is fully initialized before any hooks are called
async function bootstrap() {
  try {
    // Load React first to ensure dispatcher is initialized
    const React = await import("react");
    const { StrictMode } = React;

    // Then load everything else
    const [
      { QueryClient, QueryClientProvider },
      { BrowserRouter },
      { ErrorBoundary },
      { ThemeProvider },
      { AuthProvider },
      { CurrencyProvider },
      { BiometricProvider },
      { default: App },
      { Toaster },
    ] = await Promise.all([
      import("@tanstack/react-query"),
      import("react-router-dom"),
      import("@/components/ui/error-boundary"),
      import("@/hooks/useTheme"),
      import("@/contexts/AuthContext"),
      import("@/contexts/CurrencyContext"),
      import("@/contexts/BiometricContext"),
      import("./App"),
      import("sonner"),
    ]);

    // Create query client after React is ready
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    });

    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <ThemeProvider defaultTheme="dark" storageKey="accountant-ai-theme">
                <AuthProvider>
                  <BiometricProvider>
                    <CurrencyProvider>
                      <App />
                      <Toaster position="top-center" richColors />
                    </CurrencyProvider>
                  </BiometricProvider>
                </AuthProvider>
              </ThemeProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (error) {
    console.error("Failed to bootstrap app:", error);
    rootElement.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:system-ui;padding:20px;text-align:center;">
        <h1 style="color:#ef4444;margin-bottom:16px;">Failed to load application</h1>
        <p style="color:#666;margin-bottom:16px;">Please try refreshing the page.</p>
        <button onclick="location.reload()" style="background:#3b82f6;color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
}

// Start bootstrap
bootstrap();
