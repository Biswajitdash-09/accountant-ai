import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  MessageSquare, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles,
  TrendingUp,
  PieChart,
  Calculator,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssistantWidgetProps {
  className?: string;
}

const quickActions = [
  { icon: TrendingUp, label: "Analyze trends", query: "Show me my revenue trends for this quarter" },
  { icon: PieChart, label: "Expense breakdown", query: "Break down my expenses by category" },
  { icon: Calculator, label: "Tax calculation", query: "Calculate my estimated tax for this year" },
  { icon: FileText, label: "Generate report", query: "Generate a financial summary report" },
];

const aiSuggestions = [
  "You're spending 23% more on office supplies this month",
  "Consider setting aside $2,400 for quarterly taxes",
  "Your revenue growth is 15% higher than last quarter",
  "3 invoices are overdue - shall I send reminders?",
];

export const AIAssistantWidget = ({ className }: AIAssistantWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % aiSuggestions.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle AI query here
      console.log("AI Query:", message);
      setMessage("");
    }
  };

  const handleQuickAction = (query: string) => {
    setMessage(query);
    handleSendMessage();
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Implement voice recognition here
  };

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm mx-4 sm:w-96 sm:mx-0"
          >
            <Card className="glass border border-white/20 shadow-2xl backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="p-2 rounded-full bg-gradient-primary flex-shrink-0"
                    >
                      <Bot className="h-4 w-4 text-white" />
                    </motion.div>
                    <CardTitle className="text-base sm:text-lg truncate">AI Financial Assistant</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex-shrink-0"
                  >
                    ×
                  </Button>
                </div>
                
                <motion.div
                  key={currentSuggestion}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md"
                >
                  <Sparkles className="h-3 w-3 text-finance-highlight flex-shrink-0 mt-0.5" />
                  <span className="break-words">{aiSuggestions[currentSuggestion]}</span>
                </motion.div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.label}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleQuickAction(action.query)}
                        className="flex items-center gap-2 p-3 text-xs rounded-md border border-border hover:bg-muted/50 transition-colors min-h-[44px]"
                      >
                        <action.icon className="h-3 w-3 flex-shrink-0" />
                        <span className="break-words">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {/* Chat Input */}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Ask me anything about your finances..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-12 min-h-[44px]"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={toggleVoice}
                      className={cn(
                        "absolute right-1 top-1 h-10 w-10 p-0",
                        isListening && "text-finance-positive animate-pulse"
                      )}
                    >
                      {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="shrink-0 min-h-[44px] min-w-[44px]"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className="relative p-4 bg-gradient-primary rounded-full shadow-2xl hover:shadow-glow transition-all duration-300"
          >
            <Bot className="h-6 w-6 text-white" />
            
            {/* Notification dot */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-finance-positive rounded-full"
            />
            
            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-primary"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};