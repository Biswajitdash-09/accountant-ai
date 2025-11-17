import { useEffect, useRef } from "react";

/**
 * Announce changes to screen readers
 */
export const useAnnouncement = () => {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create hidden announcer element
    const announcer = document.createElement("div");
    announcer.setAttribute("role", "status");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    document.body.appendChild(announcer);
    announcerRef.current = announcer;

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute("aria-live", priority);
      announcerRef.current.textContent = message;
    }
  };

  return { announce };
};

/**
 * Trap focus within a modal or dialog
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element when activated
    firstElement?.focus();

    container.addEventListener("keydown", handleTabKey as any);

    return () => {
      container.removeEventListener("keydown", handleTabKey as any);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Manage keyboard shortcuts
 */
export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  } = {}
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesModifiers =
        (options.ctrl === undefined || e.ctrlKey === options.ctrl) &&
        (options.shift === undefined || e.shiftKey === options.shift) &&
        (options.alt === undefined || e.altKey === options.alt) &&
        (options.meta === undefined || e.metaKey === options.meta);

      if (e.key.toLowerCase() === key.toLowerCase() && matchesModifiers) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
};

/**
 * Skip to main content link
 */
export const SkipToContent = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      Skip to main content
    </a>
  );
};

/**
 * Check if user prefers reduced motion
 */
export const usePrefersReducedMotion = () => {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return prefersReducedMotion;
};
