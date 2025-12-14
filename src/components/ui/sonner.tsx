
import * as React from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Safe hook to get theme that won't crash if context isn't ready
const useSafeTheme = (): "light" | "dark" | "system" => {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  
  React.useEffect(() => {
    // Try to get theme from localStorage first
    const storedTheme = localStorage.getItem("accountant-ai-theme") as "light" | "dark" | "system" | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }

    // Listen for changes to the theme in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accountant-ai-theme" && e.newValue) {
        setTheme(e.newValue as "light" | "dark" | "system");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return theme;
};

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useSafeTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
