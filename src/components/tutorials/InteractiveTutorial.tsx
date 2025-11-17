import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: "top" | "bottom" | "left" | "right";
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "dashboard",
    title: "Welcome to Your Dashboard",
    description: "This is your financial command center. Get a quick overview of your accounts, spending, and insights.",
    target: ".dashboard-overview",
    position: "bottom",
  },
  {
    id: "add-transaction",
    title: "Add Transactions",
    description: "Click here to manually add transactions, income, or expenses.",
    target: "[data-tutorial='add-transaction']",
    position: "bottom",
  },
  {
    id: "arnold",
    title: "Meet Arnold AI",
    description: "Your AI financial assistant is always here to help. Ask questions, get insights, or generate reports.",
    target: "[data-tutorial='arnold-button']",
    position: "left",
  },
  {
    id: "upload-documents",
    title: "Upload Documents",
    description: "Upload receipts, invoices, or bank statements. Arnold will extract and categorize the data automatically.",
    target: "[data-tutorial='upload']",
    position: "bottom",
  },
  {
    id: "analytics",
    title: "View Analytics",
    description: "Explore detailed charts and insights about your spending patterns, investments, and more.",
    target: "[data-tutorial='analytics']",
    position: "right",
  },
  {
    id: "reports",
    title: "Generate Reports",
    description: "Create custom financial reports for tax filing, business analysis, or personal review.",
    target: "[data-tutorial='reports']",
    position: "right",
  },
];

interface InteractiveTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const InteractiveTutorial = ({ onComplete, onSkip }: InteractiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const step = tutorialSteps[currentStep];
    const element = document.querySelector(step.target) as HTMLElement;
    
    if (element) {
      setHighlightedElement(element);
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const getTooltipPosition = () => {
    if (!highlightedElement) return { top: "50%", left: "50%" };

    const rect = highlightedElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    switch (step.position) {
      case "top":
        return {
          top: rect.top + scrollTop - 20,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          top: rect.bottom + scrollTop + 20,
          left: rect.left + scrollLeft + rect.width / 2,
          transform: "translate(-50%, 0)",
        };
      case "left":
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.left + scrollLeft - 20,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          top: rect.top + scrollTop + rect.height / 2,
          left: rect.right + scrollLeft + 20,
          transform: "translate(0, -50%)",
        };
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Overlay with spotlight */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm pointer-events-auto" />
        
        {highlightedElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute border-4 border-primary rounded-lg shadow-2xl pointer-events-none"
            style={{
              top: highlightedElement.getBoundingClientRect().top + window.pageYOffset,
              left: highlightedElement.getBoundingClientRect().left + window.pageXOffset,
              width: highlightedElement.offsetWidth,
              height: highlightedElement.offsetHeight,
              zIndex: 51,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute pointer-events-auto"
          style={getTooltipPosition()}
        >
          <Card className="p-6 w-80 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
                <h3 className="text-lg font-semibold">{step.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {step.description}
            </p>

            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full mb-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary"
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip tutorial
              </Button>
              <Button onClick={handleNext} size="sm">
                {currentStep < tutorialSteps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Complete
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
