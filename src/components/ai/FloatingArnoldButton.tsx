import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain } from "lucide-react";
import { ConversationalInterface } from "./ConversationalInterface";
import { Badge } from "@/components/ui/badge";

export const FloatingArnoldButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewInsights] = useState(false); // Can be connected to real insight notifications

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 animate-pulse hover:animate-none"
        title="Chat with Arnold AI"
      >
        <Brain className="h-6 w-6" />
        {hasNewInsights && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-destructive">
            !
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Arnold AI Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <ConversationalInterface />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};