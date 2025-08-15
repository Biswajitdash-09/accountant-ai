import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Mic, Scan, Lightbulb, MessageCircle, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import VoiceExpenseEntry from "@/components/VoiceExpenseEntry";
import SmartDocumentUpload from "@/components/SmartDocumentUpload";
import AIFinancialInsights from "@/components/AIFinancialInsights";
import AIChatbot from "@/components/ai/AIChatbot";
import PaymentGateway from "@/components/PaymentGateway";
import MobileAIAssistant from "@/components/MobileAIAssistant";
import { useIsMobile } from "@/hooks/use-mobile";

const AIAssistantPage = () => {
  const isMobile = useIsMobile();

  // Use mobile-optimized component on mobile devices
  if (isMobile) {
    return <MobileAIAssistant />;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-10 w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">AI Financial Assistant</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Leverage artificial intelligence to streamline your financial management. 
          Voice entries, smart document processing, and intelligent insights.
        </p>
      </motion.div>

      {/* AI Features Tabs */}
      <Tabs defaultValue="chatbot" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto h-auto p-1">
          <TabsTrigger 
            value="chatbot" 
            className="gap-1 text-xs py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </TabsTrigger>
          <TabsTrigger 
            value="voice" 
            className="gap-1 text-xs py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Voice Entry</span>
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="gap-1 text-xs py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Scan className="h-4 w-4" />
            <span className="hidden sm:inline">Smart OCR</span>
          </TabsTrigger>
          <TabsTrigger 
            value="insights" 
            className="gap-1 text-xs py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
          <TabsTrigger 
            value="payment" 
            className="gap-1 text-xs py-2 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Buy Credits</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chatbot" className="space-y-6">
          <AIChatbot />
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <VoiceExpenseEntry />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <SmartDocumentUpload />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AIFinancialInsights />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <PaymentGateway />
        </TabsContent>
      </Tabs>

      {/* AI Capabilities Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-center">AI Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading font-semibold">Voice Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Natural language processing extracts expense details from speech with 95%+ accuracy
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
                <Scan className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading font-semibold">Document Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Advanced OCR and AI extraction from receipts, invoices, and financial documents
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading font-semibold">Smart Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Machine learning algorithms provide personalized insights and financial optimization
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistantPage;