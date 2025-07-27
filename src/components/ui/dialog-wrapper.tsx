
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  hideTitle?: boolean;
  hideDescription?: boolean;
}

const DialogWrapper = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  DialogWrapperProps
>(({
  children,
  title = "Dialog",
  description = "This dialog contains additional options and information.",
  className,
  open,
  onOpenChange,
  trigger,
  hideTitle = false,
  hideDescription = false,
  ...props
}, ref) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent ref={ref} className={cn(className)} {...props}>
        <DialogHeader>
          <DialogTitle className={cn(hideTitle && "sr-only")}>
            {title}
          </DialogTitle>
          {!hideDescription && (
            <DialogDescription className={cn(hideDescription && "sr-only")}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
});

DialogWrapper.displayName = "DialogWrapper";

export { DialogWrapper };
