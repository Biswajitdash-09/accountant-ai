import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';
import { Calculator, TrendingUp, Calendar, Target, Loader2, PieChart, BarChart3, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const BudgetForecastingTool = () => {
  const [budgetData, setBudgetData] = useState({
    monthlyIncome: '',
    fixedExpenses: '',
    variableExpenses: '',
    savingsGoal: '',
    forecastPeriod: '12',
    businessType: 'personal'
  });
  const [forecast, setForecast] = useState('');
  const [budgetBreakdown, setBudgetBreakdown] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateResponse, availableCredits } = useAI();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setBudgetData(prev => ({ ...prev, [field]: value }));
  };

  const generateForecast = async () => {
    if (!budgetData.monthlyIncome || !budgetData.fixedExpenses) {
      toast({
        title: "Missing Information",
        description: "Please provide at least monthly income and fixed expenses",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Create a comprehensive budget and ${budgetData.forecastPeriod}-month financial forecast:

Type: ${budgetData.businessType === 'business' ? 'Business Budget' : 'Personal Budget'}
Monthly Income: $${budgetData.monthlyIncome}
Fixed Expenses: $${budgetData.fixedExpenses}
Variable Expenses: $${budgetData.variableExpenses || 'Not specified'}
Savings Goal: $${budgetData.savingsGoal || 'Not specified'}
Forecast Period: ${budgetData.forecastPeriod} months

Please provide:
1. **Budget Breakdown & Analysis**
   - Detailed expense categories
   - Income vs expenses analysis
   - Savings rate calculation
   - Cash flow analysis

2. **${budgetData.forecastPeriod}-Month Forecast**
   - Month-by-month projections
   - Seasonal adjustments
   - Growth assumptions
   - Cash flow predictions

3. **Budget Optimization Tips**
   - Cost reduction opportunities
   - Income enhancement strategies
   - Emergency fund recommendations
   - Investment allocation suggestions

4. **Financial Health Metrics**
   - Debt-to-income ratio
   - Savings rate
   - Emergency fund adequacy
   - Budget variance analysis

5. **Action Plan**
   - Priority improvements
   - Timeline for implementation
   - Monitoring recommendations
   - Adjustment triggers

Format with clear headings and specific dollar amounts where applicable.`;

      const response = await generateResponse(prompt);
      setForecast(response.text);
      
      // Generate mock budget breakdown for visualization
      const income = parseFloat(budgetData.monthlyIncome);
      const fixed = parseFloat(budgetData.fixedExpenses);
      const variable = parseFloat(budgetData.variableExpenses) || income * 0.3;
      const savings = parseFloat(budgetData.savingsGoal) || income * 0.2;
      
      setBudgetBreakdown({
        income,
        expenses: {
          fixed,
          variable,
          total: fixed + variable
        },
        savings,
        netCashFlow: income - fixed - variable - savings
      });
      
      toast({
        title: "Forecast Generated",
        description: "Your budget analysis and forecast are ready!"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate forecast. Please try again.",
        variant: "destructive"
      });
    }
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-heading font-bold">AI Budget & Forecasting Tool</h2>
              <p className="opacity-90">Smart budgeting with predictive financial modeling</p>
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
              Budget Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Budget Type</Label>
              <Select value={budgetData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Budget</SelectItem>
                  <SelectItem value="business">Business Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income * ($)</Label>
              <Input
                id="monthlyIncome"
                type="number"
                value={budgetData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                placeholder="5000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fixedExpenses">Fixed Expenses * ($)</Label>
              <Input
                id="fixedExpenses"
                type="number"
                value={budgetData.fixedExpenses}
                onChange={(e) => handleInputChange('fixedExpenses', e.target.value)}
                placeholder="2000"
              />
              <p className="text-xs text-muted-foreground">Rent, utilities, insurance, loan payments</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="variableExpenses">Variable Expenses ($)</Label>
              <Input
                id="variableExpenses"
                type="number"
                value={budgetData.variableExpenses}
                onChange={(e) => handleInputChange('variableExpenses', e.target.value)}
                placeholder="1500"
              />
              <p className="text-xs text-muted-foreground">Food, entertainment, shopping, transportation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="savingsGoal">Savings Goal ($)</Label>
              <Input
                id="savingsGoal"
                type="number"
                value={budgetData.savingsGoal}
                onChange={(e) => handleInputChange('savingsGoal', e.target.value)}
                placeholder="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecastPeriod">Forecast Period (months)</Label>
              <Select value={budgetData.forecastPeriod} onValueChange={(value) => handleInputChange('forecastPeriod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                  <SelectItem value="36">36 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                onClick={generateForecast}
                disabled={isGenerating || availableCredits <= 0}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Forecast...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Budget & Forecast
                  </>
                )}
              </Button>
              {availableCredits <= 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No credits available. Purchase credits to generate forecasts.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Summary */}
        {budgetBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="text-xl font-bold text-green-600">${budgetBreakdown.income.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-xl font-bold text-red-600">${budgetBreakdown.expenses.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fixed Expenses</span>
                  <span className="font-medium">${budgetBreakdown.expenses.fixed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Variable Expenses</span>
                  <span className="font-medium">${budgetBreakdown.expenses.variable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Savings Goal</span>
                  <span className="font-medium">${budgetBreakdown.savings.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-bold">
                  <span>Net Cash Flow</span>
                  <span className={budgetBreakdown.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${budgetBreakdown.netCashFlow.toLocaleString()}
                  </span>
                </div>
              </div>

              {budgetBreakdown.netCashFlow < 0 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Budget Deficit Alert</p>
                    <p className="text-yellow-700 dark:text-yellow-300">Your expenses exceed income. Review the forecast for optimization strategies.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Forecast Results */}
        <Card className={budgetBreakdown ? "lg:col-span-2" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Financial Forecast & Analysis
              {forecast && <Badge variant="secondary">Complete</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!forecast && !isGenerating && (
              <div className="text-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your financial information to generate a comprehensive forecast</p>
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
                  AI is analyzing your financial data and market trends...
                </p>
              </div>
            )}

            {forecast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {forecast}
                  </pre>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetForecastingTool;