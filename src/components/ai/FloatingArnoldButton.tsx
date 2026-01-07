import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain } from "lucide-react";
import { ConversationalInterface } from "./ConversationalInterface";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

export const FloatingArnoldButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewInsights] = useState(false);
  const isMobile = useIsMobile();

  // Hide on mobile - accessible via bottom nav AI button
  if (isMobile) return null;

  return (
    <>
      {/* Arnold Button - positioned by parent container */}
      <motion.div
        className="relative"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-accent text-accent-foreground hover:bg-accent/90 border border-border"
          title="Chat with Arnold AI"
        >
          <Brain className="h-6 w-6" />
          {hasNewInsights && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-destructive">
              !
            </Badge>
          )}
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[80vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Arnold AI Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden p-6 pt-0">
            <ConversationalInterface />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};