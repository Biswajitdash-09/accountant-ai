import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, Video, MessageCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I connect my bank account?",
      answer: "Navigate to Integrations → Select your region → Click 'Connect Bank' and follow the secure authentication flow. We support TrueLayer (UK), Plaid/Yodlee (US), and Mono (Nigeria).",
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes! We use bank-level 256-bit encryption, read-only access, and never store your banking credentials. All connections use secure Open Banking protocols approved by financial regulators.",
    },
    {
      question: "How does Arnold AI work?",
      answer: "Arnold analyzes your transactions, income patterns, and spending habits using advanced AI. It provides personalized insights, tax optimization suggestions, and answers your financial questions in plain English.",
    },
    {
      question: "What tax regions are supported?",
      answer: "We currently support UK, US, India, and Nigeria tax calculations. Arnold can handle multi-region scenarios and provides country-specific optimization strategies.",
    },
    {
      question: "Can I export my financial data?",
      answer: "Yes! Go to Reports → Export Data. You can export to PDF, Excel, or CSV formats. Choose which data sources to include (bank accounts, crypto, investments) and the date range.",
    },
    {
      question: "How do I track cryptocurrency?",
      answer: "Navigate to Markets → Connect Wallet. We support wallet connections via Moralis for automatic transaction sync, or you can manually enter your holdings.",
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            Help Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Find answers, watch tutorials, and get help from Arnold
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/api-docs')}>
          <CardHeader>
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Complete API and feature docs</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <Video className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Video Tutorials</CardTitle>
            <CardDescription>Step-by-step video guides</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/assistant')}>
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Ask Arnold</CardTitle>
            <CardDescription>Chat with AI assistant</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            {searchQuery ? `Showing ${filteredFaqs.length} result(s)` : 'Common questions and answers'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Video Tutorials */}
      <Card>
        <CardHeader>
          <CardTitle>Video Tutorials</CardTitle>
          <CardDescription>Watch and learn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: "Getting Started", duration: "5:20", thumbnail: "🎬" },
              { title: "Connecting Your Bank", duration: "3:45", thumbnail: "🏦" },
              { title: "Using Arnold AI", duration: "7:15", thumbnail: "🤖" },
              { title: "Tax Optimization", duration: "6:30", thumbnail: "📊" },
              { title: "Crypto Tracking", duration: "4:50", thumbnail: "₿" },
              { title: "Generating Reports", duration: "5:10", thumbnail: "📄" },
            ].map((video, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-6xl text-center mb-4">{video.thumbnail}</div>
                  <h3 className="font-semibold text-center">{video.title}</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">{video.duration}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>Our team is here to assist you</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with Arnold AI
          </Button>
          <Button variant="outline" className="flex-1">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpCenter;