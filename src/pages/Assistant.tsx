
import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, FileText, CornerDownLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const Assistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI accounting assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: { [key: string]: string } = {
        "tax": "Based on your current transactions, I estimate your quarterly tax payment to be approximately $1,543.25. Would you like me to prepare the necessary forms for filing?",
        "expense": "I've analyzed your expenses and found that your highest spending category is 'Software Subscriptions' at $450 this month. This is about 15% higher than your average for this category.",
        "report": "I can generate several financial reports for you. Would you like a Profit & Loss statement, Balance Sheet, or Cash Flow report?",
        "invoice": "To create a new invoice, please provide the client name, services rendered, and amount. I can also help you track payment status for existing invoices.",
      };

      // Look for keywords in the user's message
      let aiResponse = "I can help with that! I can assist with bookkeeping, financial analysis, tax preparation, and more. What specific area would you like help with?";
      
      const lowercaseInput = input.toLowerCase();
      for (const [keyword, response] of Object.entries(aiResponses)) {
        if (lowercaseInput.includes(keyword)) {
          aiResponse = response;
          break;
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="pb-4">
              <CardTitle>Accounting Assistant</CardTitle>
              <CardDescription>
                Ask questions about your finances, taxes, and business
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
                          <div className="whitespace-pre-wrap">{message.content}</div>
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
                  placeholder="Ask a question about your finances..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  rows={1}
                />
                <Button onClick={handleSend} size="icon">
                  <Send className="h-4 w-4" />
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
                    onClick={() => setInput("What are my estimated taxes for this quarter?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>What are my estimated taxes?</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => setInput("Analyze my expenses for this month")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Analyze my expenses</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => setInput("Generate a profit and loss report")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Generate P&L report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => setInput("How can I reduce my business expenses?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>How to reduce expenses?</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full"
                    onClick={() => setInput("Help me create an invoice")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Create an invoice</span>
                  </Button>
                </TabsContent>
                <TabsContent value="documents" className="p-4 space-y-2">
                  <Button variant="outline" className="justify-start w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Latest Tax Return</span>
                  </Button>
                  <Button variant="outline" className="justify-start w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>June Financial Statement</span>
                  </Button>
                  <Button variant="outline" className="justify-start w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Q2 Profit & Loss Report</span>
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
