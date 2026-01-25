import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { 
  Brain, 
  Mic, 
  Scan, 
  Send, 
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Target,
  Lightbulb,
  Phone,
  Loader2,
  Bot,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VoiceAgent } from "@/components/voice/VoiceAgent";
import { useAI } from "@/hooks/useAI";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MobileAIAssistant = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("assistant");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { generateResponse, isLoading, availableCredits } = useAI();
  const { toast } = useToast();

  const promptButtons = [
    "Help me create a budget plan",
    "Explain compound interest", 
    "What are the best investment strategies?",
    "How to reduce business expenses?",
    "Tax planning tips for this year"
  ];

  const insightCards = [
    {
      id: 1,
      color: "bg-gradient-to-r from-orange-400 to-orange-500",
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Dining Out Spike Detected",
      description: "Your dining expenses increased 45% this month compared to last month average. Consider meal planning to optimize costs.",
      amount: "$180",
      confidence: "45%",
      category: "Food & Dining",
      categoryIcon: "🍽️"
    },
    {
      id: 2,
      color: "bg-gradient-to-r from-pink-400 to-pink-500",
      icon: <Target className="h-4 w-4" />,
      title: "Subscription Optimization Opportunity",
      description: "You have 3 similar software subscriptions. Consolidating could save you $45/month.",
      amount: "$45",
      confidence: "92%",
      category: "High Impact",
      categoryIcon: "🎯"
    },
    {
      id: 3,
      color: "bg-gradient-to-r from-red-400 to-red-500",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "End-of-Month Budget Forecast",
      description: "Based on current spending patterns, you're projected to exceed your monthly budget by $120.",
      amount: "$120",
      confidence: "78%",
      category: "Take Action",
      categoryIcon: "⚠️"
    },
    {
      id: 4,
      color: "bg-gradient-to-r from-amber-400 to-amber-500",
      icon: <DollarSign className="h-4 w-4" />,
      title: "Unusual Large Transaction",
      description: "A $500 business expense was detected, which is 3x your average transaction amount. Verify if this is legitimate.",
      amount: "$500",
      confidence: "95%",
      category: "Tax Deductible",
      categoryIcon: "💼"
    }
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (promptOverride?: string) => {
    const messageToSend = promptOverride || message.trim();
    if (!messageToSend || isLoading) return;

    // Check credits
    if (availableCredits <= 0) {
      toast({
        title: "No credits available",
        description: "Please purchase credits to continue using the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    try {
      // Call AI
      const response = await generateResponse(messageToSend);
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePromptClick = async (prompt: string) => {
    await handleSendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background pb-safe">
      {/* Header - Compact */}
      <div className="bg-gradient-primary text-white p-4 safe-area-padding shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Financial Assistant</h1>
            <p className="text-white/80 text-xs">Leverage AI to streamline your finances</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-3 mx-3 mt-3 h-12 p-1 gap-1 bg-muted/30 rounded-xl shadow-soft shrink-0" style={{ width: 'calc(100% - 24px)' }}>
          <TabsTrigger 
            value="assistant" 
            className="text-sm font-semibold min-h-[40px] rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-medium transition-all duration-300"
          >
            <MessageCircle className="h-4 w-4 mr-1.5" />
            <span className="truncate">Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="voice" 
            className="text-sm font-semibold min-h-[40px] rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-medium transition-all duration-300"
          >
            <Phone className="h-4 w-4 mr-1.5" />
            <span className="truncate">Voice</span>
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="text-sm font-semibold min-h-[40px] rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-medium transition-all duration-300"
          >
            <Lightbulb className="h-4 w-4 mr-1.5" />
            <span className="truncate">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Assistant View */}
        <TabsContent value="assistant" className="px-3 pb-4 space-y-3 min-h-0 animate-fade-in flex-1 flex flex-col">
          {/* AI Assistant Card - Compact */}
          <Card className="shadow-md border-0 rounded-xl overflow-hidden bg-card shrink-0">
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-sm">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Arnold AI</CardTitle>
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      Powered by AI
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-success font-semibold px-2 py-0.5">
                  {availableCredits} credits
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Chat Section */}
          <Card className="shadow-md rounded-xl border-0 flex-1 flex flex-col min-h-0">
            <CardContent className="p-3 flex flex-col flex-1 min-h-0">
              {/* Messages Area */}
              <ScrollArea className="flex-1 min-h-[200px] max-h-[300px] mb-3" ref={scrollAreaRef}>
                <div className="space-y-3 pr-2">
                  {messages.length === 0 ? (
                    <>
                      {/* Welcome Message */}
                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Brain className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">
                              Hi! I'm Arnold, your AI financial assistant. I can help you with budgeting, investments, taxes, and more. Ask me anything!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Prompts */}
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-2">Quick prompts:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {promptButtons.map((prompt, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="h-auto p-3 text-left justify-start text-sm text-wrap min-h-[44px] touch-manipulation hover:bg-accent/50 rounded-lg"
                              onClick={() => handlePromptClick(prompt)}
                              disabled={isLoading}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={cn(
                            "flex gap-2",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                          )}
                        >
                          {msg.role === 'assistant' && (
                            <Avatar className="h-8 w-8 bg-primary/10 shrink-0">
                              <Bot className="h-4 w-4 text-primary" />
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[85%] rounded-xl p-3 text-sm",
                              msg.role === 'user'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                          {msg.role === 'user' && (
                            <Avatar className="h-8 w-8 bg-primary shrink-0">
                              <User className="h-4 w-4 text-primary-foreground" />
                            </Avatar>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {isLoading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2 justify-start"
                        >
                          <Avatar className="h-8 w-8 bg-primary/10 shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </Avatar>
                          <div className="bg-muted rounded-xl p-3 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">Arnold is thinking...</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="flex gap-2 shrink-0">
                <Input
                  ref={inputRef}
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12 text-sm rounded-lg border focus:border-primary transition-colors"
                  disabled={isLoading}
                />
                <Button 
                  size="icon" 
                  onClick={() => handleSendMessage()}
                  disabled={!message.trim() || isLoading}
                  className="min-w-[48px] h-12 rounded-lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities - Compact */}
          <Card className="shadow-md rounded-xl shrink-0">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Mic className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs">Voice Recognition</h4>
                  <p className="text-xs text-muted-foreground">95%+ accuracy speech processing</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-lg border border-border">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Scan className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-xs">Document Intelligence</h4>
                  <p className="text-xs text-muted-foreground">OCR & AI extraction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Agent View */}
        <TabsContent value="voice" className="px-3 pb-4 flex-1 min-h-0">
          <div className="h-[calc(100vh-14rem)] min-h-[350px]">
            <VoiceAgent className="h-full" />
          </div>
        </TabsContent>

        {/* Insights View */}
        <TabsContent value="insights" className="px-3 pb-4 space-y-3 min-h-0">
          {/* Header */}
          <Card className="shadow-md border-0 rounded-xl">
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">AI Financial Insights</CardTitle>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Machine Learning
                  </Badge>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Last 30 days
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Smart Insights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Smart Insights (4)</h3>
               <Button variant="outline" size="sm" className="text-xs min-h-[36px] min-w-[80px] touch-manipulation">
                 Refresh Insights
               </Button>
            </div>

            {/* Insight Cards */}
            {insightCards.map((card) => (
              <Card key={card.id} className="shadow-md border-0 overflow-hidden">
                <div className={cn("h-1", card.color)} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      {card.icon}
                      <h4 className="font-semibold text-sm leading-tight">{card.title}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-muted-foreground">{card.categoryIcon}</span>
                      <span className="font-medium">{card.category}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {card.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{card.amount}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span className="text-xs font-medium">{card.confidence} confidence</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Take Action Button */}
          <Button 
            className="w-full h-12 text-base font-semibold bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            Take Action
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileAIAssistant;
