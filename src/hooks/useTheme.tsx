import * as React from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

// Safe localStorage access
const getStoredTheme = (storageKey: string, defaultTheme: Theme): Theme => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored && ['dark', 'light', 'system'].includes(stored)) {
        return stored;
      }
    }
  } catch {
    // localStorage not available
  }
  return defaultTheme;
};

const setStoredTheme = (storageKey: string, theme: Theme) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(storageKey, theme);
    }
  } catch {
    // localStorage not available
  }
};

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "accountant-ai-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => 
    getStoredTheme(storageKey, defaultTheme)
  );

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setStoredTheme(storageKey, newTheme);
    setThemeState(newTheme);
  }, [storageKey]);

  const toggleTheme = React.useCallback(() => {
    setThemeState((currentTheme) => {
      let newTheme: Theme;
      if (currentTheme === "system") {
        const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        newTheme = systemIsDark ? "light" : "dark";
      } else {
        newTheme = currentTheme === "dark" ? "light" : "dark";
      }
      setStoredTheme(storageKey, newTheme);
      return newTheme;
    });
  }, [storageKey]);

  const value = React.useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
  }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderState => {
  const context = React.useContext(ThemeProviderContext);
  
  // Return safe defaults if context is not available
  if (!context) {
    return initialState;
  }

  return context;
};