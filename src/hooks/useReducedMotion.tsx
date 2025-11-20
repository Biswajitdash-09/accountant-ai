import { useState, useEffect } from "react";

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

// Animation config that respects user preferences
export const getAnimationConfig = (prefersReducedMotion: boolean) => ({
  initial: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
  animate: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
  transition: prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: "easeOut" },
});
