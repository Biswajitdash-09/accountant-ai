import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAI } from "@/hooks/useAI";
import { useChatHistory } from "@/hooks/useChatHistory";
import { Bot, Send, Loader2, Download, Trash2, Sparkles, Paperclip, X, FileText, History, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import CreditBalance from "@/components/CreditBalance";
import { useToast } from "@/hooks/use-toast";
import { EnhancedDocumentUpload } from "./EnhancedDocumentUpload";
import { DocumentPreview } from "./DocumentPreview";
import { DocumentHistory } from "./DocumentHistory";
import { DragDropOverlay } from "./DragDropOverlay";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDocuments } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";

interface DocumentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnailUrl?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'document';
  timestamp: Date;
  attachments?: DocumentAttachment[];
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState<DocumentAttachment[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showSmartPrompts, setShowSmartPrompts] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { generateResponse, isLoading, availableCredits } = useAI();
  const { documents } = useDocuments();
  const { toast } = useToast();
  const {
    createNewSession,
    addMessageToSession,
    exportChatHistory,
    clearAllHistory
  } = useChatHistory();

  useEffect(() => {
    if (messages.length === 0) {
      createNewSession("AI Financial Chat");
    }
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && pendingDocuments.length === 0) || isLoading || availableCredits === 0) return;

    // Build enhanced message with document content
    let enhancedMessage = inputMessage.trim();
    const attachments = [...pendingDocuments];
    
    if (attachments.length > 0) {
      const documentsContent = attachments
        .filter(doc => doc.extractedText)
        .map(doc => `\n\n--- Document: ${doc.fileName} ---\n${doc.extractedText}\n--- End of Document ---`)
        .join('\n');
      
      if (documentsContent) {
        enhancedMessage = enhancedMessage 
          ? `${enhancedMessage}\n\nHere are the documents I've uploaded:${documentsContent}`
          : `Please analyze these documents:${documentsContent}`;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim() || `Uploaded ${attachments.length} document(s) for analysis`,
      role: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setPendingDocuments([]);
    inputRef.current?.focus();

    try {
      const response = await generateResponse(enhancedMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.text,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    }
  };

  const quickPrompts = [
    "Help me create a monthly budget",
    "What stocks should I invest in right now?",
    "Analyze my financial documents for issues",
    "Create a retirement savings plan for me",
    "What are the best tax-saving strategies?",
    "How can I build passive income streams?",
    "Suggest cryptocurrency investments",
    "Help me plan for early retirement"
  ];

  const documentPrompts = [
    "Find unauthorized charges or hidden fees",
    "Summarize income, expenses and calculate savings rate",
    "Identify patterns of recurring subscriptions",
    "Extract tax-relevant items and potential deductions",
    "Analyze investment portfolio performance",
    "Review mortgage or loan details",
    "Verify paystub accuracy and benefits"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  const handleDocumentUpload = (uploadedDocs: Array<{ id: string; fileName: string; extractedText?: string }>) => {
    // Find the full document records
    const docAttachments: DocumentAttachment[] = uploadedDocs.map(doc => {
      const fullDoc = documents.find(d => d.id === doc.id);
      return {
        id: doc.id,
        fileName: doc.fileName,
        fileType: fullDoc?.file_type || 'application/octet-stream',
        fileSize: fullDoc?.file_size || 0,
        extractedText: doc.extractedText,
        processingStatus: 'completed' as const,
        thumbnailUrl: fullDoc?.public_url
      };
    });

    setPendingDocuments(prev => [...prev, ...docAttachments]);
    setIsUploadOpen(false);
    setShowSmartPrompts(true);
    
    toast({
      title: "Documents ready",
      description: `${docAttachments.length} document(s) processed. Add a message and send to analyze with AI.`,
    });
  };

  const handleSelectFromHistory = (doc: any) => {
    const docAttachment: DocumentAttachment = {
      id: doc.id,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      extractedText: doc.extractedText,
      processingStatus: 'completed',
      thumbnailUrl: doc.publicUrl
    };

    setPendingDocuments(prev => [...prev, docAttachment]);
    setIsHistoryOpen(false);
    setShowSmartPrompts(true);
  };

  const removePendingDocument = (id: string) => {
    setPendingDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleExportHistory = () => {
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
      title: "Chat exported",
      description: "Your chat history has been downloaded",
    });
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed",
    });
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragActive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  // Paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await processFiles(imageFiles);
        toast({
          title: "Images pasted",
          description: `${imageFiles.length} image(s) pasted from clipboard`
        });
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const processFiles = async (files: File[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload files",
        variant: "destructive"
      });
      return;
    }

    const uploadedDocs: any[] = [];

    for (const file of files) {
      try {
        // Upload to storage
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        // Create document record
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: fileName,
            public_url: publicUrl,
            processing_status: 'pending'
          })
          .select()
          .single();

        if (docError) throw docError;

        // Call OCR processing
        const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-ocr', {
          body: { document_id: docData.id }
        });

        if (ocrError) throw ocrError;

        // Fetch updated document
        const { data: updatedDoc } = await supabase
          .from('documents')
          .select('extracted_text')
          .eq('id', docData.id)
          .single();

        uploadedDocs.push({
          id: docData.id,
          fileName: file.name,
          extractedText: updatedDoc?.extracted_text || ''
        });
      } catch (error) {
        console.error('File processing error:', error);
      }
    }

    if (uploadedDocs.length > 0) {
      handleDocumentUpload(uploadedDocs);
    }
  };

  const handleExportWithDocuments = () => {
    const exportData = {
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      })),
      documents: pendingDocuments,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Analysis exported",
      description: "Chat and documents have been exported"
    });
  };

  return (
    <div className="h-[calc(100vh-12rem)] min-h-[400px] flex gap-4">
      {/* Document History Sidebar - Desktop */}
      <div className="hidden lg:block w-80 shrink-0 h-full overflow-hidden">
        <DocumentHistory onSelectDocument={handleSelectFromHistory} />
      </div>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <DragDropOverlay isDragging={isDragActive} />
        
        <CardHeader className="border-b p-3 sm:p-6">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 bg-primary/10 shrink-0">
                <Bot className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-sm sm:text-lg truncate">Arnold - AI Financial Assistant</CardTitle>
                <CardDescription className="text-xs hidden sm:block">
                  Your trusted financial advisor • Powered by AI
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <CreditBalance />
              
              {/* Document History - Mobile */}
              <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 lg:hidden"
                  >
                    <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <DocumentHistory onSelectDocument={handleSelectFromHistory} />
                </SheetContent>
              </Sheet>

              {messages.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportWithDocuments}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearHistory}
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent 
          className="flex-1 min-h-0 p-0 overflow-hidden relative"
          ref={chatContainerRef}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="px-3 sm:px-4 py-4 sm:py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 sm:space-y-6 px-2">
                <div className="space-y-2">
                  <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-primary" />
                  <h3 className="text-lg sm:text-xl font-semibold">Hi! I'm Arnold 👋</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                    Your trusted financial advisor. Ask me about investments, crypto wallets, taxes, retirement planning, and wealth building
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto py-3 px-3 sm:px-4 whitespace-normal text-xs sm:text-sm"
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 bg-primary/10 shrink-0">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </Avatar>
                    )}
                     <div className="max-w-[85%] sm:max-w-[80%] space-y-2">
                      {/* Document attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-2">
                          {message.attachments.map((doc) => (
                            <DocumentPreview
                              key={doc.id}
                              fileName={doc.fileName}
                              fileType={doc.fileType}
                              fileSize={doc.fileSize}
                              extractedText={doc.extractedText}
                              processingStatus={doc.processingStatus}
                              thumbnailUrl={doc.thumbnailUrl}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Message content */}
                      {message.content && (
                        <div
                          className={`rounded-lg px-3 sm:px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-3 sm:p-4 border-t">
          {/* Smart contextual prompts for documents */}
          {showSmartPrompts && pendingDocuments.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span>Suggested analyses for your documents:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {documentPrompts.slice(0, 3).map((prompt, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInputMessage(prompt);
                      setShowSmartPrompts(false);
                      inputRef.current?.focus();
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Pending documents preview */}
          {pendingDocuments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {pendingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-[120px]">{doc.fileName}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-destructive/10"
                    onClick={() => removePendingDocument(doc.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] sm:h-[70vh]">
                <SheetHeader>
                  <SheetTitle>Upload Financial Documents</SheetTitle>
                  <SheetDescription>
                    Upload bank statements, tax documents, receipts, or any financial files for AI analysis
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <EnhancedDocumentUpload onUploadComplete={handleDocumentUpload} />
                </div>
              </SheetContent>
            </Sheet>
            
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={pendingDocuments.length > 0 ? "Add a message about the documents..." : "Ask about investments, taxes, retirement..."}
              disabled={isLoading || availableCredits === 0}
              className="flex-1 text-sm"
            />
            <Button 
              type="submit" 
              disabled={(!inputMessage.trim() && pendingDocuments.length === 0) || isLoading || availableCredits === 0}
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 p-0 sm:px-4 sm:w-auto"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-2">Send</span>
            </Button>
          </form>
          {availableCredits === 0 && (
            <p className="text-xs text-destructive mt-2 text-center">
              No credits available. Please purchase more credits to continue.
            </p>
          )}
          <p className="text-xs text-muted-foreground text-center mt-2">
            💡 Tip: Drag & drop files or paste images (Ctrl+V) anywhere in the chat
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AIChatbot;