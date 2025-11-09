import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, TrendingUp, Calculator, FileText, Target } from "lucide-react";
import { useAI } from "@/hooks/useAI";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickQuestions = [
  {
    icon: TrendingUp,
    question: "How am I doing this month?",
    prompt: "Give me a summary of my financial situation this month including income, expenses, and savings.",
  },
  {
    icon: Calculator,
    question: "Should I invest more in crypto?",
    prompt: "Analyze my current crypto holdings and advise if I should increase my investment based on my risk profile and financial goals.",
  },
  {
    icon: FileText,
    question: "What can I claim on my taxes?",
    prompt: "Review my transactions and documents to identify potential tax deductions I may have missed.",
  },
  {
    icon: Target,
    question: "When will I reach my savings goal?",
    prompt: "Based on my current savings rate and financial goals, estimate when I'll reach my targets.",
  },
];

export const ConversationalInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Arnold, your AI financial assistant. I can help you understand your finances in plain English. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const { generateResponse, isLoading } = useAI();
  const { toast } = useToast();

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      // Get AI response
      const response = await generateResponse(textToSend);

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || "I apologize, I couldn't process that request. Could you rephrase?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from Arnold",
        variant: "destructive",
      });
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Chat with Arnold
        </CardTitle>
        <CardDescription>
          Ask anything about your finances in plain English
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-muted-foreground mb-3">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2"
                  onClick={() => handleQuickQuestion(q.prompt)}
                >
                  <q.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-xs">{q.question}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Arnold anything..."
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
