import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, FileText, CornerDownLeft, Loader2, History, Trash2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAI } from "@/hooks/useAI";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
      content: "Hello! I'm your AI assistant powered by Gemini 2.0 Flash. I can help you with any questions or topics you'd like to discuss. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string>(() => 
    crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateResponse, isLoading } = useAI();
  const { chatHistory, saveMessage, conversations, deleteConversation } = useChatHistory();
  const isMobile = useIsMobile();

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
    
    // Save user message to database
    await saveMessage.mutateAsync({
      message_content: input,
      message_type: 'user',
      conversation_id: currentConversationId,
    });
    
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

      // Save AI response to database
      await saveMessage.mutateAsync({
        message_content: aiResponse.text,
        message_type: 'assistant',
        conversation_id: currentConversationId,
      });
    } catch (error) {
      // Remove loading message and add error message
      const errorMessage = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        return [...filteredMessages, {
          id: (Date.now() + 2).toString(),
          content: errorMessage,
          sender: "assistant" as const,
          timestamp: new Date(),
        }];
      });

      // Save error message to database
      await saveMessage.mutateAsync({
        message_content: errorMessage,
        message_type: 'assistant',
        conversation_id: currentConversationId,
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

  const startNewConversation = () => {
    const newId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    setCurrentConversationId(newId);
    setMessages([{
      id: "welcome",
      content: "Hello! I'm your AI assistant powered by Gemini 2.0 Flash. I can help you with any questions or topics you'd like to discuss. How can I assist you today?",
      sender: "assistant",
      timestamp: new Date(),
    }]);
  };

  const loadConversation = (conversationId: string) => {
    // Load messages from chat history
    const conversationMessages = chatHistory.filter(msg => msg.conversation_id === conversationId);
    const formattedMessages: Message[] = conversationMessages.map(msg => ({
      id: msg.id,
      content: msg.message_content,
      sender: msg.message_type,
      timestamp: new Date(msg.created_at),
    }));
    
    setCurrentConversationId(conversationId);
    setMessages(formattedMessages);
  };

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation.mutate(conversationId);
    if (currentConversationId === conversationId) {
      startNewConversation();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">AI Assistant</h1>
      
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"
      )}>
        <div className={cn(isMobile ? "order-2" : "lg:col-span-3")}>
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>
                    Ask me anything! I'm powered by Gemini 2.0 Flash and can help with any topic or question.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewConversation}
                  className="button-hover transition-all duration-200 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
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
                        <Avatar className="hover-scale transition-all duration-200">
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
                          className={cn(
                            "rounded-lg p-3 transition-all duration-200 cursor-pointer",
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          )}
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
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 focus-ring transition-all duration-200"
                  rows={1}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSend} 
                  size="icon"
                  disabled={isLoading || input.trim() === ""}
                  className="button-hover transition-all duration-200 cursor-pointer"
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

        <div className={cn(isMobile ? "order-1" : "")}>
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Quick Questions & History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="questions">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="questions" className="cursor-pointer">Questions</TabsTrigger>
                  <TabsTrigger value="history" className="cursor-pointer">History</TabsTrigger>
                </TabsList>
                <TabsContent value="questions" className="p-4 space-y-2">
                  <Button
                    variant="outline"
                    className="justify-start w-full button-hover transition-all duration-200 cursor-pointer"
                    onClick={() => handleQuickQuestion("What's the weather like today?")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Weather information</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full button-hover transition-all duration-200 cursor-pointer"
                    onClick={() => handleQuickQuestion("Explain quantum computing in simple terms")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Quantum computing</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full button-hover transition-all duration-200 cursor-pointer"
                    onClick={() => handleQuickQuestion("Write a creative short story")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Creative writing</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full button-hover transition-all duration-200 cursor-pointer"
                    onClick={() => handleQuickQuestion("Help me plan a healthy meal")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Meal planning</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start w-full button-hover transition-all duration-200 cursor-pointer"
                    onClick={() => handleQuickQuestion("Solve this math problem: 2x + 5 = 15")}
                  >
                    <CornerDownLeft className="mr-2 h-4 w-4" />
                    <span>Math problems</span>
                  </Button>
                </TabsContent>
                <TabsContent value="history" className="p-4 space-y-2">
                  <ScrollArea className="h-[400px]">
                    {conversations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No chat history yet</p>
                        <p className="text-sm">Start a conversation to see history</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((conversation) => (
                          <div key={conversation.conversation_id} className="flex items-center justify-between group">
                            <Button
                              variant="ghost"
                              className="flex-1 justify-start text-left p-2 h-auto button-hover transition-all duration-200 cursor-pointer"
                              onClick={() => loadConversation(conversation.conversation_id)}
                            >
                              <div className="truncate">
                                <p className="text-sm font-medium truncate">{conversation.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(conversation.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                              onClick={() => handleDeleteConversation(conversation.conversation_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
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
