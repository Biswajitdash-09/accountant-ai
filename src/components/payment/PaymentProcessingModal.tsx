import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: "processing" | "success" | "error";
  message?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export const PaymentProcessingModal = ({
  isOpen,
  onClose,
  status,
  message,
  errorMessage,
  onRetry,
}: PaymentProcessingModalProps) => {
  // Trigger confetti on success
  useEffect(() => {
    if (status === "success" && isOpen) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["hsl(var(--primary))", "hsl(var(--accent))"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["hsl(var(--primary))", "hsl(var(--accent))"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [status, isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {status === "processing" && "Processing Payment"}
            {status === "success" && "Payment Successful!"}
            {status === "error" && "Payment Failed"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <AnimatePresence mode="wait">
            {status === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Loader2 className="h-16 w-16 text-primary" />
                </motion.div>
                
                {/* Pulsing rings */}
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-2 border-primary rounded-full"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{
                      scale: [1, 1.5, 2],
                      opacity: [0.8, 0.4, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                ))}
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </motion.div>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ x: 0 }}
                animate={{ x: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, ease: "easeInOut" as any }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <XCircle className="h-16 w-16 text-destructive" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {status === "processing" && (
              <p className="text-muted-foreground">
                {message || "Please wait while we process your payment..."}
              </p>
            )}
            
            {status === "success" && (
              <>
                <p className="text-lg font-semibold text-green-600">
                  Payment completed successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  {message || "Your credits have been added to your account."}
                </p>
              </>
            )}
            
            {status === "error" && (
              <>
                <p className="text-lg font-semibold text-destructive">
                  Payment could not be processed
                </p>
                <p className="text-sm text-muted-foreground">
                  {errorMessage || "Please try again or use a different payment method."}
                </p>
              </>
            )}
          </motion.div>

          {/* Progress bar for processing */}
          {status === "processing" && (
            <motion.div className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              />
            </motion.div>
          )}

          {/* Action buttons */}
          {status === "error" && onRetry && (
            <motion.div
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button onClick={onRetry} variant="default">
                Try Again
              </Button>
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
