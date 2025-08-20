import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Upload,
  PieChart,
  FileText,
  BarChart3
} from 'lucide-react';

interface DemoTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number; // in seconds
}

const DemoTutorial: React.FC<DemoTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Accountant AI",
      description: "Your intelligent accounting assistant for streamlined financial management.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      duration: 5
    },
    {
      id: 2,
      title: "Upload Documents",
      description: "Simply drag and drop receipts, invoices, and financial documents.",
      icon: <Upload className="h-8 w-8 text-primary" />,
      duration: 7
    },
    {
      id: 3,
      title: "AI Analysis",
      description: "Our AI automatically extracts data and categorizes your expenses.",
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      duration: 8
    },
    {
      id: 4,
      title: "Generate Reports",
      description: "Create P&L statements, balance sheets, and visual charts instantly.",
      icon: <PieChart className="h-8 w-8 text-primary" />,
      duration: 10
    }
  ];

  const totalDuration = tutorialSteps.reduce((total, step) => total + step.duration, 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && isOpen) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / totalDuration);
          
          // Calculate which step should be active based on progress
          let accumulatedDuration = 0;
          const activeStepIndex = tutorialSteps.findIndex(step => {
            accumulatedDuration += step.duration;
            return (newProgress / 100) * totalDuration <= accumulatedDuration;
          });
          
          if (activeStepIndex !== -1 && activeStepIndex !== currentStep) {
            setCurrentStep(activeStepIndex);
          }

          if (newProgress >= 100) {
            setIsPlaying(false);
            return 100;
          }
          
          return newProgress;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, isOpen, currentStep, totalDuration]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setProgress(0);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleSkip = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Calculate progress for the next step
      let accumulatedDuration = 0;
      for (let i = 0; i <= nextStep; i++) {
        accumulatedDuration += tutorialSteps[i].duration;
      }
      setProgress((accumulatedDuration / totalDuration) * 100);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('demoTutorialCompleted', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Accountant AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tutorial Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  {tutorialSteps[currentStep]?.icon}
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-2">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </Badge>
                <h3 className="text-xl font-semibold">
                  {tutorialSteps[currentStep]?.title}
                </h3>
                <p className="text-muted-foreground">
                  {tutorialSteps[currentStep]?.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRestart}
              disabled={progress === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handlePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSkip}
              disabled={currentStep >= tutorialSteps.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Duration Info */}
          <div className="text-center text-sm text-muted-foreground">
            Total duration: ~{totalDuration} seconds
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-3">
            <Button variant="outline" onClick={onClose}>
              Skip Tutorial
            </Button>
            
            {progress >= 100 ? (
              <Button onClick={handleComplete} className="flex-1">
                Get Started
              </Button>
            ) : (
              <Button onClick={handleComplete} variant="secondary" className="flex-1">
                Continue to App
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoTutorial;