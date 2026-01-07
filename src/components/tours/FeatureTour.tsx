import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

interface FeatureTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

const COMPLETED_TOURS_KEY = 'accountant-ai-completed-tours';

export const FeatureTour = ({ tourId, steps, onComplete, onSkip }: FeatureTourProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Check if tour was already completed
  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem(COMPLETED_TOURS_KEY) || '[]');
    if (!completed.includes(tourId)) {
      // Delay start for better UX
      const timer = setTimeout(() => setIsActive(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [tourId]);

  // Update highlight position when step changes
  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStep];
    if (step?.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  }, [currentStep, isActive, steps]);

  const markComplete = useCallback(() => {
    const completed = JSON.parse(localStorage.getItem(COMPLETED_TOURS_KEY) || '[]');
    if (!completed.includes(tourId)) {
      completed.push(tourId);
      localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify(completed));
    }
  }, [tourId]);

  const handleNext = () => {
    const step = steps[currentStep];
    if (step?.action) {
      step.action();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    markComplete();
    setIsActive(false);
    onComplete?.();
  };

  const handleSkip = () => {
    markComplete();
    setIsActive(false);
    onSkip?.();
  };

  if (!isActive) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const position = step.position || 'center';

  // Calculate tooltip position
  const getTooltipStyles = () => {
    if (!highlightRect || position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = 400;
    const tooltipHeight = 200;

    switch (position) {
      case 'top':
        return {
          bottom: `${window.innerHeight - highlightRect.top + padding}px`,
          left: `${Math.max(padding, Math.min(highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'bottom':
        return {
          top: `${highlightRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case 'left':
        return {
          top: `${highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2}px`,
          right: `${window.innerWidth - highlightRect.left + padding}px`,
        };
      case 'right':
        return {
          top: `${highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2}px`,
          left: `${highlightRect.right + padding}px`,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            // Optional: allow clicking outside to skip
          }
        }}
      />

      {/* Highlight */}
      {highlightRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed z-[101] ring-4 ring-primary rounded-lg pointer-events-none"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[102] max-w-md"
        style={getTooltipStyles()}
      >
        <Card className="p-6 shadow-2xl border-primary/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mt-2 -mr-2"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-1 mb-4" />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1"
            >
              {isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Link */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              Skip tour
            </button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to check if a tour was completed
export const useTourStatus = (tourId: string) => {
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const completed = JSON.parse(localStorage.getItem(COMPLETED_TOURS_KEY) || '[]');
    setIsCompleted(completed.includes(tourId));
  }, [tourId]);

  const resetTour = useCallback(() => {
    const completed = JSON.parse(localStorage.getItem(COMPLETED_TOURS_KEY) || '[]');
    const filtered = completed.filter((id: string) => id !== tourId);
    localStorage.setItem(COMPLETED_TOURS_KEY, JSON.stringify(filtered));
    setIsCompleted(false);
  }, [tourId]);

  return { isCompleted, resetTour };
};

// Predefined tour configurations
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard! 🎉',
    description: 'This is your financial command center. Let me show you around.',
    position: 'center',
  },
  {
    id: 'metrics',
    title: 'Financial Overview',
    description: 'See your total balance, income, expenses, and savings at a glance.',
    target: '[data-tour="metrics"]',
    position: 'bottom',
  },
  {
    id: 'transactions',
    title: 'Recent Transactions',
    description: 'View and manage your latest financial transactions here.',
    target: '[data-tour="transactions"]',
    position: 'top',
  },
  {
    id: 'arnold',
    title: 'Meet Arnold AI 🤖',
    description: 'Click the brain icon to chat with Arnold - your AI financial assistant!',
    target: '[data-tour="arnold"]',
    position: 'left',
  },
];

export const ONBOARDING_TOUR_STEPS: TourStep[] = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your business details to get personalized tax recommendations.',
    target: '[data-tour="profile"]',
    position: 'bottom',
  },
  {
    id: 'accounts',
    title: 'Connect Your Accounts',
    description: 'Link bank accounts for automatic transaction import.',
    target: '[data-tour="accounts"]',
    position: 'bottom',
  },
  {
    id: 'first-transaction',
    title: 'Add Your First Transaction',
    description: 'Manually add transactions or let us import them automatically.',
    target: '[data-tour="add-transaction"]',
    position: 'left',
  },
];
