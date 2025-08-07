import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ 
  children, 
  className, 
  hover = true, 
  ...props 
}: GlassCardProps) => {
  return (
    <motion.div
      className={cn(
        "glass rounded-lg p-6 backdrop-blur-xl",
        hover && "hover:scale-[1.02] transition-transform duration-300",
        className
      )}
      whileHover={hover ? { 
        scale: 1.02, 
        boxShadow: "0 20px 40px rgba(6, 182, 212, 0.15)" 
      } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};