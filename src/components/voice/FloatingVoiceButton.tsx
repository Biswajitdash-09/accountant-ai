import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceAgent } from './VoiceAgent';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface FloatingVoiceButtonProps {
  className?: string;
}

export const FloatingVoiceButton: React.FC<FloatingVoiceButtonProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Don't show on mobile - use MobileQuickActions instead
  if (isMobile) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className={cn(
          "fixed bottom-8 right-8 z-50",
          className
        )}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg",
            "bg-gradient-to-br from-primary to-primary/80",
            "hover:scale-110 transition-transform"
          )}
        >
          <Mic className="h-6 w-6" />
        </Button>
        
        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30 -z-10"
          animate={{
            scale: [1, 1.5, 1.5],
            opacity: [0.5, 0, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
      </motion.div>

      {/* Voice Agent Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg h-[80vh] p-0 gap-0">
          <VisuallyHidden>
            <DialogTitle>Voice Agent</DialogTitle>
          </VisuallyHidden>
          <VoiceAgent onClose={() => setIsOpen(false)} className="h-full border-0" />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Mobile version that uses Drawer
export const MobileVoiceButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="h-14 w-full bg-gradient-to-br from-primary to-primary/80"
      >
        <Mic className="h-5 w-5 mr-2" />
        Voice Assistant
      </Button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="h-[90vh]">
          <VisuallyHidden>
            <DrawerTitle>Voice Agent</DrawerTitle>
          </VisuallyHidden>
          <VoiceAgent onClose={() => setIsOpen(false)} className="h-full border-0" />
        </DrawerContent>
      </Drawer>
    </>
  );
};
