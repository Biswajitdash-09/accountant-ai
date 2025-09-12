import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Download, Loader2, Building, Target, DollarSign, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessPlanGenerator = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    description: '',
    targetMarket: '',
    fundingAmount: '',
    timeframe: '12'
  });
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateResponse, availableCredits } = useAI();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateBusinessPlan = async () => {
    if (!formData.businessName || !formData.industry || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a comprehensive business plan for:
      
Business Name: ${formData.businessName}
Industry: ${formData.industry}
Description: ${formData.description}
Target Market: ${formData.targetMarket}
Funding Needed: $${formData.fundingAmount}
Timeframe: ${formData.timeframe} months

Please include:
1. Executive Summary
2. Company Description
3. Market Analysis
4. Organization & Management
5. Products/Services
6. Marketing & Sales Strategy
7. Financial Projections
8. Funding Requirements
9. Risk Analysis
10. Implementation Timeline

Make it detailed, professional, and investor-ready.`;

      const response = await generateResponse(prompt);
      setGeneratedPlan(response.text);
      
      toast({
        title: "Business Plan Generated",
        description: "Your comprehensive business plan is ready!"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate business plan. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  const downloadPlan = () => {
    const blob = new Blob([generatedPlan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.businessName || 'Business'}_Plan.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-heading font-bold">AI Business Plan Generator</h2>
              <p className="opacity-90">Create comprehensive, investor-ready business plans</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare, Retail"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your business, products/services, and value proposition"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Market</Label>
              <Input
                id="targetMarket"
                value={formData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                placeholder="Describe your target customers"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fundingAmount">Funding Needed ($)</Label>
                <Input
                  id="fundingAmount"
                  type="number"
                  value={formData.fundingAmount}
                  onChange={(e) => handleInputChange('fundingAmount', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe (months)</Label>
                <Input
                  id="timeframe"
                  type="number"
                  value={formData.timeframe}
                  onChange={(e) => handleInputChange('timeframe', e.target.value)}
                  placeholder="12"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={generateBusinessPlan}
                disabled={isGenerating || availableCredits <= 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Business Plan
                  </>
                )}
              </Button>
              {availableCredits <= 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No credits available. Purchase credits to generate plans.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Generated Business Plan
              {generatedPlan && <Badge variant="secondary">Ready</Badge>}
            </CardTitle>
            {generatedPlan && (
              <Button variant="outline" size="sm" onClick={downloadPlan}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!generatedPlan && !isGenerating && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill in the form and click "Generate Business Plan" to get started</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="space-y-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  AI is crafting your comprehensive business plan...
                </p>
              </div>
            )}

            {generatedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedPlan}
                  </pre>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan Sections Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            What's Included in Your Business Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Executive Summary", desc: "Overview and key highlights" },
              { title: "Market Analysis", desc: "Industry trends and competition" },
              { title: "Financial Projections", desc: "Revenue and expense forecasts" },
              { title: "Marketing Strategy", desc: "Customer acquisition plans" },
              { title: "Operations Plan", desc: "Day-to-day business operations" },
              { title: "Risk Analysis", desc: "Potential challenges and mitigation" }
            ].map((section, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <h4 className="font-medium mb-1">{section.title}</h4>
                <p className="text-sm text-muted-foreground">{section.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessPlanGenerator;