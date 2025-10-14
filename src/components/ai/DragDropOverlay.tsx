import { Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DragDropOverlayProps {
  isDragging: boolean;
}

export const DragDropOverlay = ({ isDragging }: DragDropOverlayProps) => {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-primary/5 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg pointer-events-none"
        >
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
            >
              <Upload className="h-12 w-12 mx-auto text-primary" />
            </motion.div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-primary">Drop files here</p>
              <p className="text-sm text-muted-foreground">
                Images, PDFs, and documents supported
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};