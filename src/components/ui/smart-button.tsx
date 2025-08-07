import React from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SmartButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const SmartButton = ({
  loading = false,
  success = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: SmartButtonProps) => {
  return (
    <Button
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        success && "bg-finance-positive hover:bg-finance-positive/90",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <motion.div
        className="flex items-center gap-2"
        animate={{
          scale: loading ? 0.95 : 1,
          opacity: loading ? 0.7 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {icon && (
          <motion.div
            animate={{ 
              rotate: loading ? 360 : 0,
              scale: success ? [1, 1.2, 1] : 1 
            }}
            transition={{ 
              rotate: { duration: 1, repeat: loading ? Infinity : 0 },
              scale: { duration: 0.6 }
            }}
          >
            {icon}
          </motion.div>
        )}
        <span>{children}</span>
      </motion.div>
      
      {success && (
        <motion.div
          className="absolute inset-0 bg-finance-positive"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.6 }}
        />
      )}
    </Button>
  );
};