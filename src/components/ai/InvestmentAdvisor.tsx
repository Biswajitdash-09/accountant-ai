import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, PieChart, AlertTriangle, Target, Loader2, DollarSign, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const InvestmentAdvisor = () => {
  const [portfolioData, setPortfolioData] = useState({
    totalValue: '',
    riskTolerance: '',
    investmentGoal: '',
    timeHorizon: '',
    currentAge: '',
    monthlyInvestment: ''
  });
  const [analysis, setAnalysis] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { generateResponse, availableCredits } = useAI();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setPortfolioData(prev => ({ ...prev, [field]: value }));
  };

  const analyzePortfolio = async () => {
    if (!portfolioData.totalValue || !portfolioData.riskTolerance || !portfolioData.investmentGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `As a professional financial advisor, analyze this investment profile and provide comprehensive advice:

Portfolio Value: $${portfolioData.totalValue}
Risk Tolerance: ${portfolioData.riskTolerance}
Investment Goal: ${portfolioData.investmentGoal}
Time Horizon: ${portfolioData.timeHorizon}
Current Age: ${portfolioData.currentAge}
Monthly Investment: $${portfolioData.monthlyInvestment}

Please provide:
1. Portfolio Analysis & Current Assessment
2. Asset Allocation Recommendations
3. Specific Investment Suggestions
4. Risk Management Strategies
5. Tax Optimization Tips
6. Rebalancing Schedule
7. Performance Benchmarks
8. Exit Strategy Planning

Include specific percentages, fund types, and actionable steps. Consider current market conditions and economic factors.`;

      const response = await generateResponse(prompt);
      setAnalysis(response.text);
      
      // Extract recommendations (simplified - in real app would parse better)
      const recs = [
        "Diversify across 3-4 asset classes",
        "Rebalance portfolio quarterly",
        "Consider tax-advantaged accounts",
        "Set up automatic investments",
        "Review performance monthly",
        "Maintain 6-month emergency fund"
      ];
      setRecommendations(recs);
      
      toast({
        title: "Analysis Complete",
        description: "Your investment analysis is ready!"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze portfolio. Please try again.",
        variant: "destructive"
      });
    }
    setIsAnalyzing(false);
  };

  const riskLevels = [
    { value: 'conservative', label: 'Conservative (Low Risk)' },
    { value: 'moderate', label: 'Moderate (Medium Risk)' },
    { value: 'aggressive', label: 'Aggressive (High Risk)' },
    { value: 'very_aggressive', label: 'Very Aggressive (Very High Risk)' }
  ];

  const investmentGoals = [
    { value: 'retirement', label: 'Retirement Planning' },
    { value: 'wealth_building', label: 'Wealth Building' },
    { value: 'income', label: 'Income Generation' },
    { value: 'education', label: 'Education Funding' },
    { value: 'house', label: 'Home Purchase' },
    { value: 'other', label: 'Other Goals' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-heading font-bold">AI Investment Advisor</h2>
              <p className="opacity-90">Professional portfolio analysis and investment recommendations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Investment Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalValue">Current Portfolio Value * ($)</Label>
              <Input
                id="totalValue"
                type="number"
                value={portfolioData.totalValue}
                onChange={(e) => handleInputChange('totalValue', e.target.value)}
                placeholder="100000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskTolerance">Risk Tolerance *</Label>
              <Select value={portfolioData.riskTolerance} onValueChange={(value) => handleInputChange('riskTolerance', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  {riskLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentGoal">Investment Goal *</Label>
              <Select value={portfolioData.investmentGoal} onValueChange={(value) => handleInputChange('investmentGoal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select investment goal" />
                </SelectTrigger>
                <SelectContent>
                  {investmentGoals.map(goal => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeHorizon">Time Horizon (years)</Label>
                <Input
                  id="timeHorizon"
                  type="number"
                  value={portfolioData.timeHorizon}
                  onChange={(e) => handleInputChange('timeHorizon', e.target.value)}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAge">Current Age</Label>
                <Input
                  id="currentAge"
                  type="number"
                  value={portfolioData.currentAge}
                  onChange={(e) => handleInputChange('currentAge', e.target.value)}
                  placeholder="35"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyInvestment">Monthly Investment ($)</Label>
              <Input
                id="monthlyInvestment"
                type="number"
                value={portfolioData.monthlyInvestment}
                onChange={(e) => handleInputChange('monthlyInvestment', e.target.value)}
                placeholder="1000"
              />
            </div>

            <div className="pt-4">
              <Button 
                onClick={analyzePortfolio}
                disabled={isAnalyzing || availableCredits <= 0}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Portfolio
                  </>
                )}
              </Button>
              {availableCredits <= 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No credits available. Purchase credits to get analysis.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Investment Analysis
              {analysis && <Badge variant="secondary">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analysis && !isAnalyzing && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Complete your profile to get personalized investment advice</p>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="space-y-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  AI is analyzing market conditions and your profile...
                </p>
              </div>
            )}

            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {analysis}
                  </pre>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">{rec}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Investment Disclaimer</p>
              <p className="text-yellow-700 dark:text-yellow-300">
                This AI analysis is for educational purposes only and not professional financial advice. 
                Past performance doesn't guarantee future results. Consult with a licensed financial advisor 
                before making investment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentAdvisor;