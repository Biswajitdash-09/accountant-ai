import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, DollarSign, TrendingDown, FileText, Receipt, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { VoiceAgent } from '@/components/voice/VoiceAgent';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/lib/utils';

const quickActions = [
  {
    icon: Mic,
    label: 'Voice',
    color: 'bg-primary',
    action: 'voice',
  },
  {
    icon: TrendingDown,
    label: 'Expense',
    color: 'bg-destructive',
    action: '/transactions?type=expense',
  },
  {
    icon: DollarSign,
    label: 'Income',
    color: 'bg-green-500',
    action: '/transactions?type=income',
  },
  {
    icon: Receipt,
    label: 'Scan',
    color: 'bg-blue-500',
    action: '/upload',
  },
  {
    icon: FileText,
    label: 'Reports',
    color: 'bg-purple-500',
    action: '/reports',
  },
];

export const MobileQuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleAction = (action: string) => {
    if (action === 'voice') {
      setIsVoiceOpen(true);
    } else {
      navigate(action);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container - Positioned above bottom nav */}
      <div className="fixed bottom-[72px] right-3 z-45">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="flex flex-col gap-2 mb-3"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                >
                  <Button
                    onClick={() => handleAction(action.action)}
                    className={cn(
                      action.color,
                      "text-white shadow-lg h-11 px-4 gap-2 hover:opacity-90 rounded-xl",
                      "active:scale-95 transition-transform touch-manipulation"
                    )}
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full shadow-lg touch-manipulation",
            "active:scale-95 transition-all duration-200",
            isOpen 
              ? "bg-destructive hover:bg-destructive/90" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </motion.div>
        </Button>
      </div>

      {/* Voice Agent Drawer */}
      <Drawer open={isVoiceOpen} onOpenChange={setIsVoiceOpen}>
        <DrawerContent className="h-[85vh]">
          <VisuallyHidden>
            <DrawerTitle>Voice Agent</DrawerTitle>
          </VisuallyHidden>
          <VoiceAgent onClose={() => setIsVoiceOpen(false)} className="h-full border-0" />
        </DrawerContent>
      </Drawer>
    </>
  );
};
