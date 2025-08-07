import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter = ({ 
  value, 
  duration = 2, 
  prefix = "", 
  suffix = "", 
  decimals = 0,
  className = ""
}: AnimatedCounterProps) => {
  const spring = useSpring(value, { 
    damping: 15, 
    stiffness: 100,
    duration: duration * 1000 
  });
  
  const display = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals)}${suffix}`
  );

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  );
};