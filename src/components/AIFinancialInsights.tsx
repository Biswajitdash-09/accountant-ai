import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  PieChart,
  BarChart3,
  Calendar,
  DollarSign,
  Tag,
  Lightbulb,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_alert' | 'optimization' | 'prediction' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category?: string;
  amount?: number;
  percentage?: number;
  actionable: boolean;
  confidence: number;
  createdAt: string;
}

interface SpendingPattern {
  category: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  amount: number;
  change: number;
  prediction: number;
}

const AIFinancialInsights = () => {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [spendingPatterns, setSpendingPatterns] = useState<SpendingPattern[]>([]);
  const [timeRange, setTimeRange] = useState("30d");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTakeAction = (insight: AIInsight) => {
    switch (insight.type) {
      case 'spending_pattern':
        navigate(`/dashboard?category=${insight.category}`);
        toast({ title: "Opening Budget", description: `Navigating to ${insight.category} budget details` });
        break;
      case 'optimization':
        navigate('/transactions?filter=subscriptions');
        toast({ title: "Reviewing Subscriptions", description: "Opening subscription transactions" });
        break;
      case 'prediction':
        navigate('/dashboard');
        toast({ title: "Opening Budget Planning", description: "Review your budget forecast" });
        break;
      case 'anomaly':
        navigate('/transactions?highlight=large');
        toast({ title: "Reviewing Transactions", description: "Opening transaction details" });
        break;
      case 'budget_alert':
        navigate(`/dashboard?category=${insight.category}`);
        toast({ title: "Budget Alert", description: `Opening ${insight.category} budget` });
        break;
    }
  };

  // Mock AI insights generation (in real app, this would come from backend AI)
  const generateInsights = () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'spending_pattern',
          title: 'Dining Out Spike Detected',
          description: 'Your dining expenses increased by 45% this month compared to your 3-month average. Consider meal planning to optimize costs.',
          impact: 'medium',
          category: 'Food & Dining',
          amount: 180,
          percentage: 45,
          actionable: true,
          confidence: 0.87,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'optimization',
          title: 'Subscription Optimization Opportunity',
          description: 'You have 3 similar software subscriptions. Consolidating could save $45/month.',
          impact: 'high',
          amount: 45,
          actionable: true,
          confidence: 0.92,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'prediction',
          title: 'End-of-Month Budget Forecast',
          description: 'Based on current spending patterns, you\'re projected to exceed your monthly budget by $120.',
          impact: 'high',
          amount: 120,
          actionable: true,
          confidence: 0.79,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          type: 'anomaly',
          title: 'Unusual Large Transaction',
          description: 'A $500 business expense was detected, which is 3x your average transaction amount. Verify if this is legitimate.',
          impact: 'high',
          amount: 500,
          actionable: true,
          confidence: 0.95,
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          type: 'budget_alert',
          title: 'Travel Budget Alert',
          description: 'You\'ve used 85% of your travel budget with 10 days remaining in the month.',
          impact: 'medium',
          category: 'Travel',
          percentage: 85,
          actionable: true,
          confidence: 0.99,
          createdAt: new Date().toISOString()
        }
      ];

      const mockPatterns: SpendingPattern[] = [
        {
          category: 'Food & Dining',
          trend: 'increasing',
          amount: 580,
          change: 22,
          prediction: 650
        },
        {
          category: 'Transportation',
          trend: 'decreasing',
          amount: 340,
          change: -15,
          prediction: 290
        },
        {
          category: 'Entertainment',
          trend: 'stable',
          amount: 220,
          change: 3,
          prediction: 225
        },
        {
          category: 'Shopping',
          trend: 'increasing',
          amount: 450,
          change: 35,
          prediction: 520
        }
      ];

      setInsights(mockInsights);
      setSpendingPatterns(mockPatterns);
      setIsAnalyzing(false);
    }, 2000);
  };

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      generateInsights();
    }
  }, [transactions, timeRange]);

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'spending_pattern':
        return <PieChart className="h-5 w-5" />;
      case 'budget_alert':
        return <AlertTriangle className="h-5 w-5" />;
      case 'optimization':
        return <Lightbulb className="h-5 w-5" />;
      case 'prediction':
        return <Target className="h-5 w-5" />;
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = (trend: SpendingPattern['trend']) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="gradient-primary text-white dark:text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-heading font-bold mb-2 text-white dark:text-white">AI Financial Insights</h3>
              <p className="opacity-90 text-white/90 dark:text-white/90">Powered by machine learning to optimize your financial decisions</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Brain className="h-12 w-12 opacity-75" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-heading flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Insights ({insights.length})
            </CardTitle>
            <Button 
              variant="outline" 
              onClick={generateInsights}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnalyzing ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="border rounded-lg p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border rounded-lg p-4 ${getImpactColor(insight.impact)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {insight.impact} impact
                          </Badge>
                          {insight.confidence > 0.9 && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {insight.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs">
                          {insight.amount && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${insight.amount}
                            </span>
                          )}
                          {insight.percentage && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {insight.percentage}%
                            </span>
                          )}
                          {insight.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {insight.category}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {(insight.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {insight.actionable && (
                      <Button variant="outline" size="sm" onClick={() => handleTakeAction(insight)}>
                        Take Action
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Spending Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Spending Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spendingPatterns.map((pattern, index) => (
              <motion.div
                key={pattern.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getTrendIcon(pattern.trend)}
                  <div>
                    <p className="font-medium">{pattern.category}</p>
                    <p className="text-sm text-muted-foreground">
                      ${pattern.amount} current
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    pattern.change > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {pattern.change > 0 ? '+' : ''}{pattern.change}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pred: ${pattern.prediction}
                  </p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recommended Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate('/dashboard');
                  toast({ title: "Opening Budget", description: "Set up dining budget alerts" });
                }}
              >
                <Target className="h-4 w-4" />
                Set Dining Budget Alert
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate('/transactions?filter=subscriptions');
                  toast({ title: "Subscriptions", description: "Review recurring subscriptions" });
                }}
              >
                <Calendar className="h-4 w-4" />
                Schedule Subscription Review
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate('/dashboard');
                  toast({ title: "Financial Goals", description: "Create a new savings goal" });
                }}
              >
                <PieChart className="h-4 w-4" />
                Create Savings Goal
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate('/transactions?highlight=large');
                  toast({ title: "Large Expenses", description: "Review unusual transactions" });
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                Verify Large Expenses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIFinancialInsights;