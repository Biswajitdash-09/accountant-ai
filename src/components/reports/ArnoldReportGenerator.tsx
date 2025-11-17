import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const quickPrompts = [
  {
    label: "Tax Report 2024",
    prompt: "Generate a comprehensive tax report for 2024 including all income, expenses, deductions, and crypto transactions",
    category: "tax",
  },
  {
    label: "Q4 Performance",
    prompt: "Show me a quarterly performance report comparing Q4 to Q3 with key metrics and insights",
    category: "business",
  },
  {
    label: "Spending Analysis",
    prompt: "Analyze where I overspent last quarter and provide recommendations for improvement",
    category: "spending",
  },
  {
    label: "Investment Summary",
    prompt: "Create a year-to-date investment summary including stocks, crypto, and overall portfolio performance",
    category: "investment",
  },
  {
    label: "Cash Flow Forecast",
    prompt: "Generate a 6-month cash flow forecast based on my current income and spending patterns",
    category: "forecast",
  },
];

export const ArnoldReportGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a report request",
        description: "Describe what kind of report you'd like Arnold to generate",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("arnold-generate-report", {
        body: {
          reportType: "custom",
          dateRange: { start: null, end: null },
          format: "markdown",
          sources: ["transactions", "accounts", "crypto", "investments", "documents"],
          customPrompt: prompt,
        },
      });

      if (error) throw error;

      setGeneratedReport(data.reportData.summary || "Report generated successfully");

      toast({
        title: "Report Generated",
        description: "Arnold has created your custom report",
      });
    } catch (error) {
      console.error("Report generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Arnold couldn't generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  const handleDownload = () => {
    if (!generatedReport) return;

    const blob = new Blob([generatedReport], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arnold-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your report has been saved to your downloads folder",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Arnold Report Generator
          </CardTitle>
          <CardDescription>
            Describe what you need in plain English, and Arnold will create a custom report for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Prompts */}
          <div>
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Reports
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((quick) => (
                <Badge
                  key={quick.label}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleQuickPrompt(quick.prompt)}
                >
                  {quick.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Request</label>
            <Textarea
              placeholder="Example: Generate a tax report for 2024 including crypto transactions and investment gains..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Report
              </span>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                {generatedReport}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
