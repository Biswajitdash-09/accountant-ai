import { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { cn } from "@/lib/utils";

interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface FloatingActionButtonProps {
  actions: FABAction[];
  className?: string;
}

export const FloatingActionButton = ({ actions, className }: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trigger } = useHapticFeedback();

  const handleToggle = () => {
    trigger("light");
    setIsOpen(!isOpen);
  };

  const handleAction = (action: FABAction) => {
    trigger("medium");
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className={cn("fixed bottom-20 right-4 z-40 md:bottom-6", className)}>
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col gap-3 mb-3"
          >
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="bg-card border border-border px-3 py-1 rounded-full text-sm font-medium shadow-lg whitespace-nowrap">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  variant={action.variant || "default"}
                  onClick={() => handleAction(action)}
                  className="h-12 w-12 rounded-full shadow-lg"
                >
                  {action.icon}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={handleToggle}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl transition-transform",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};
