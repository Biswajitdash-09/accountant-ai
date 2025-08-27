import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  BarChart3,
  VolumeOff,
  Settings
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
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechPaused, setSpeechPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechRate, setSpeechRate] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Set default voice (prefer female English voice)
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (preferredVoice && !selectedVoice) {
        setSelectedVoice(preferredVoice.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // Handle step changes with auto-narration
  useEffect(() => {
    if (voiceEnabled && !isMuted && isOpen) {
      speakCurrentStep();
    }
  }, [currentStep, voiceEnabled, isMuted, isOpen]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

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

  const speakCurrentStep = () => {
    if (!voiceEnabled || isMuted) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const currentStepData = tutorialSteps[currentStep];
    if (!currentStepData) return;

    const text = `${currentStepData.title}. ${currentStepData.description}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voice = availableVoices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    
    utterance.rate = speechRate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeechPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeechPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechPaused(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isSpeaking && !speechPaused) {
      window.speechSynthesis.pause();
      setSpeechPaused(true);
    } else if (speechPaused) {
      window.speechSynthesis.resume();
      setSpeechPaused(false);
    } else {
      speakCurrentStep();
    }
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechPaused(false);
  };

  const restartSpeech = () => {
    stopSpeech();
    setTimeout(() => {
      speakCurrentStep();
    }, 100);
  };

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
    stopSpeech();
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
      stopSpeech();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('demoTutorialCompleted', 'true');
    stopSpeech();
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

          {/* Voice Settings */}
          {voiceEnabled && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Settings className="h-4 w-4" />
                Voice Settings
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Voice</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Speed: {speechRate}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-4">
            {/* Tutorial Controls */}
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRestart}
                disabled={progress === 0}
                title="Restart tutorial"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handlePlay}
                title={isPlaying ? "Pause tutorial" : "Play tutorial"}
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
                title="Skip to next step"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Voice Controls */}
            <div className="flex justify-center gap-2">
              <Button
                variant={voiceEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (!voiceEnabled) {
                    speakCurrentStep();
                  } else {
                    stopSpeech();
                  }
                }}
                title="Toggle voice narration"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                {voiceEnabled ? "Voice On" : "Voice Off"}
              </Button>

              {voiceEnabled && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSpeech}
                    disabled={!voiceEnabled}
                    title={
                      isSpeaking && !speechPaused
                        ? "Pause narration"
                        : speechPaused
                        ? "Resume narration"
                        : "Start narration"
                    }
                  >
                    {isSpeaking && !speechPaused ? (
                      <Pause className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isSpeaking && !speechPaused
                      ? "Pause"
                      : speechPaused
                      ? "Resume"
                      : "Speak"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopSpeech}
                    disabled={!isSpeaking && !speechPaused}
                    title="Stop narration"
                  >
                    <VolumeOff className="h-4 w-4 mr-2" />
                    Stop
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={restartSpeech}
                    disabled={!voiceEnabled}
                    title="Restart current step narration"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Replay
                  </Button>
                </>
              )}
            </div>

            {/* Voice Status */}
            {voiceEnabled && (
              <div className="text-center text-xs text-muted-foreground">
                {isSpeaking && !speechPaused && "🔊 Speaking..."}
                {speechPaused && "⏸ Paused"}
                {!isSpeaking && !speechPaused && voiceEnabled && "🔇 Ready to speak"}
              </div>
            )}
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