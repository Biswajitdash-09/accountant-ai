
import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, FileText, CornerDownLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAI } from "@/hooks/useAI";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  isLoading?: boolean;
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI accounting assistant. I can help you with accounting, tax, finance, bookkeeping, audit, and business compliance questions. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateResponse, isLoading } = useAI();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    
    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "Thinking...",
      sender: "assistant",
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);
    
    const currentInput = input;
    setInput("");

    try {
      // Get AI response
      const aiResponse = await generateResponse(currentInput);
      
      // Remove loading message and add AI response
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, {
          id: (Date.now() + 2).toString(),
          content: aiResponse.text,
          sender: "assistant" as const,
          timestamp: new Date(),
        }];
      });
    } catch (error) {
      // Remove loading message and add error message
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, {
          id: (Date.now() + 2).toString(),
          content: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
          sender: "assistant" as const,
          timestamp: new Date(),
        }];
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="pb-4">
              <CardTitle>Accounting Assistant</CardTitle>
              <CardDescription>
                Ask questions about accounting, taxes, finance, bookkeeping, and business compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-18rem)] px-4 py-2">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.sender === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <Avatar>
                          {message.sender === "user" ? (
                            <>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </>
                          ) : (
                            <>
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                <Bot className="h-5 w-5" />
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div
                          className={`rounded-lg p-3 ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="mb-1 text-sm">
                            {message.sender === "user" ? "You" : "AI Assistant"}
                            <span className="text-xs opacity-70 ml-2">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap flex items-center gap-2">
                            {message.isLoading && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="pt-4 border-t">
              <div className="flex w-full items-center space-x-2">
                <Textarea
                  placeholder="Ask a question about accounting, taxes, or finance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  rows={1}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  disabled={isLoading || input.trim() === ""}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="questions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="questions" className="p-4 space-y-2">
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => handleQuickQuestion("What are my estimated quarterly taxes based on my current income?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Calculate quarterly taxes</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => handleQuickQuestion("What business expenses can I deduct this year?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Deductible expenses</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => handleQuickQuestion("How should I categorize my business transactions?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Transaction categorization</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => handleQuickQuestion("What accounting method should I use for my business?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Accounting methods</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => handleQuickQuestion("How do I prepare for a tax audit?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Tax audit preparation</span>
                  </Button>
                </TabsContent>
                <TabsContent value="documents" className="p-4 space-y-2">
                  <Button variant="outline" className="justify-start w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Latest Tax Return</span>
                  </Button>
                  <Button variant="outline" className="justify-start w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Monthly Financial Statement</span>
                  </Button>
                  <Button variant="outline" className="justify-start w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Quarterly P&L Report</span>
                  </Button>
                  <Button variant="outline" className="justify-start w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Cash Flow Forecast</span>
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
