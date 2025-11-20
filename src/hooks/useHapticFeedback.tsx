import { useCallback } from "react";

type HapticStyle = "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error";

export const useHapticFeedback = () => {
  const isSupported = useCallback(() => {
    return "vibrate" in navigator;
  }, []);

  const trigger = useCallback((style: HapticStyle = "light") => {
    if (!isSupported()) return;

    // Map haptic styles to vibration patterns
    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      selection: 5,
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    };

    navigator.vibrate(patterns[style]);
  }, [isSupported]);

  return {
    trigger,
    isSupported: isSupported(),
  };
};
