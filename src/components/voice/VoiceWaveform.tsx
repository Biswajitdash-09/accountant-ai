import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VoiceWaveformProps {
  isActive: boolean;
  isSpeaking: boolean;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive,
  isSpeaking,
  className
}) => {
  const barsCount = 20;
  
  return (
    <div className={cn(
      "flex items-center justify-center gap-1 h-16",
      className
    )}>
      {Array.from({ length: barsCount }).map((_, i) => {
        const delay = i * 0.05;
        const baseHeight = 8;
        
        return (
          <motion.div
            key={i}
            className={cn(
              "w-1 rounded-full transition-colors",
              isActive 
                ? isSpeaking 
                  ? "bg-primary" 
                  : "bg-primary/70"
                : "bg-muted-foreground/30"
            )}
            animate={{
              height: isActive 
                ? [baseHeight, 24 + Math.random() * 32, baseHeight]
                : baseHeight,
              opacity: isActive ? 1 : 0.5
            }}
            transition={{
              height: {
                duration: isSpeaking ? 0.3 : 0.5,
                repeat: isActive ? Infinity : 0,
                repeatType: "reverse",
                delay: delay,
                ease: "easeInOut"
              }
            }}
            style={{ minHeight: baseHeight }}
          />
        );
      })}
    </div>
  );
};
