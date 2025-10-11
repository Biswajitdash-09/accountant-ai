import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Sparkles, Download, Trash2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { useChatHistory } from '@/hooks/useChatHistory';
import { motion, AnimatePresence } from 'framer-motion';
import CreditBalance from '@/components/CreditBalance';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your comprehensive AI Financial Assistant powered by OpenAI GPT-5. I can help with:\n\n📊 **Budgeting & Forecasting** - Create budgets, predict cash flows, analyze spending patterns\n💼 **Business Advisory** - Strategic planning, market analysis, growth strategies\n🏛️ **Authority Liaison** - Tax compliance, regulatory guidance, institutional communication\n📋 **Business Plans** - Complete business plan creation, market research, financial projections\n💰 **Funding & Loans** - Grant applications, loan proposals, investor presentations\n📈 **Investment Advice** - Portfolio analysis, risk assessment, market insights\n💡 **Financial Management** - Optimization tips, cost reduction, revenue enhancement\n📚 **Accounting & Bookkeeping** - Financial statements, transaction analysis, compliance\n\nI provide both proactive insights and respond to your specific questions. How can I assist with your financial needs today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const { generateResponse, isLoading, availableCredits } = useAI();
  const { 
    sessions, 
    currentSessionId, 
    createNewSession, 
    addMessageToSession,
    getCurrentSession,
    exportChatHistory,
    clearAllHistory 
  } = useChatHistory();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize session if none exists
  useEffect(() => {
    if (!currentSessionId && messages.length > 1) {
      const sessionId = createNewSession('Accounting Chat');
      messages.forEach(msg => addMessageToSession(sessionId, msg));
    }
  }, [messages.length]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Add to session history
    if (currentSessionId) {
      addMessageToSession(currentSessionId, userMessage);
    }

    try {
      const response = await generateResponse(inputMessage.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.text,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Add to session history
      if (currentSessionId) {
        addMessageToSession(currentSessionId, assistantMessage);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Add to session history
      if (currentSessionId) {
        addMessageToSession(currentSessionId, errorMessage);
      }
    }

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const quickPrompts = [
    "Create a comprehensive budget for my business",
    "Generate 12-month cash flow forecast",
    "Draft a business plan for my startup",
    "Help me apply for a small business loan",
    "Analyze my investment portfolio",
    "Create tax optimization strategies",
    "Generate expense reduction recommendations",
    "Prepare financial projections for investors",
    "Draft a grant application proposal",
    "Analyze market opportunities in my industry",
    "Create a debt management plan",
    "Generate financial KPI dashboard"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  const handleExportHistory = async () => {
    try {
      const exportData = exportChatHistory();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Chat history exported",
        description: "Your chat history has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setMessages([{
      id: '1',
      content: "Hi! I'm your comprehensive AI Financial Assistant. I can help with budgeting, forecasting, business planning, investment advice, tax strategies, and much more. How can I assist you today?",
      role: 'assistant',
      timestamp: new Date()
    }]);
    
    toast({
      title: "Chat history cleared",
      description: "All chat history has been cleared.",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="font-heading">AI Assistant</CardTitle>
                <p className="text-sm text-muted-foreground">Powered by OpenAI GPT-5</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                Free to Use
              </Badge>
              <CreditBalance showBuyButton={false} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Area */}
      <Card className="h-[calc(100vh-12rem)] min-h-[500px] max-h-[700px] flex flex-col">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Chat</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{messages.length - 1} messages</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportHistory}
                className="h-8 px-2"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="h-8 px-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col">
          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[85%] p-3 rounded-lg break-words ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.role === 'user' 
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className="p-4 border-t bg-muted/30">
              <p className="text-sm text-muted-foreground mb-3">Quick prompts to get started:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={availableCredits > 0 ? "Type your message..." : "No credits available"}
                disabled={isLoading || availableCredits <= 0}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !inputMessage.trim() || availableCredits <= 0}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            {availableCredits <= 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                You've used all your credits. They reset daily or you can purchase more.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChatbot;