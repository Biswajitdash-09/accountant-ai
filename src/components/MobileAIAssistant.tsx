import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

const MobileAIAssistant = () => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("assistant");

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

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle message sending
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Header */}
      <div className="bg-gradient-primary text-white p-4 safe-area-padding">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8" />
          <h1 className="text-xl sm:text-2xl font-bold">AI Financial Assistant</h1>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">
          Leverage artificial intelligence to streamline your financial management
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 mb-0 h-12">
          <TabsTrigger value="assistant" className="text-sm font-medium min-h-[44px]">
            <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="truncate">Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-sm font-medium min-h-[44px]">
            <Lightbulb className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="truncate">Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Assistant View */}
        <TabsContent value="assistant" className="px-4 pb-4 space-y-4 min-h-0">
          {/* AI Assistant Card */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Assistant</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      Powered by Google Gemini
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs text-success">
                  Free to Use
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Chat Section */}
          <Card className="shadow-md">
            <CardContent className="p-4">
              <div className="bg-muted/30 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Brain className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      Hi! I'm your AI assistant powered by Gemini. I can help you with any questions about finance, business, or anything else. What would you like to know?
                    </p>
                    <span className="text-xs text-muted-foreground mt-1 block">10:02:23</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Quick prompts to get started:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {promptButtons.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 text-left justify-start text-sm text-wrap"
                      onClick={() => handlePromptClick(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="min-w-[44px] h-[44px]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Voice Recognition</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Natural language processing extracts expense details from speech with 95%+ accuracy
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Scan className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Document Intelligence</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Advanced OCR and AI extraction from receipts, invoices, and financial documents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights View */}
        <TabsContent value="insights" className="px-4 pb-4 space-y-4 min-h-0">
          {/* Header */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
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
              <Button variant="outline" size="sm" className="text-xs">
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