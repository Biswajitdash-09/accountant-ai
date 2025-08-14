import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { EnhancedButton } from "./enhanced-button"

interface EnhancedModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  description?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
  variant?: "default" | "glass" | "gradient"
  showCloseButton?: boolean
  closeOnOverlay?: boolean
  className?: string
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-[95vw] max-h-[95vh]",
}

const variantClasses = {
  default: "bg-background border shadow-large",
  glass: "glass backdrop-blur-xl",
  gradient: "gradient-card border-primary/20",
}

const EnhancedModal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "md",
  variant = "default",
  showCloseButton = true,
  closeOnOverlay = true,
  className,
}: EnhancedModalProps) => {
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOverlay ? onClose : undefined}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className={cn(
              "relative w-full mx-4 rounded-lg overflow-hidden",
              sizeClasses[size],
              variantClasses[variant],
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b">
                <div className="space-y-1">
                  {title && (
                    <h2 
                      id="modal-title"
                      className="text-lg font-semibold leading-none"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p 
                      id="modal-description"
                      className="text-sm text-muted-foreground"
                    >
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <EnhancedButton
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </EnhancedButton>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Modal Footer Component
const EnhancedModalFooter = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode
  className?: string 
}) => (
  <div className={cn(
    "flex items-center justify-end gap-3 p-6 border-t bg-muted/5",
    className
  )}>
    {children}
  </div>
)

export { EnhancedModal, EnhancedModalFooter }