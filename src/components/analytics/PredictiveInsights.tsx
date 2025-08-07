
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  TrendingUp, TrendingDown, Target, AlertTriangle, 
  Lightbulb, Calendar, DollarSign 
} from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

interface Prediction {
  id: string;
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  value?: number;
  trend: 'up' | 'down' | 'stable';
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  potentialSavings?: number;
}

export const PredictiveInsights = () => {
  const { formatCurrency } = useCurrencyFormatter();

  const predictions: Prediction[] = [
    {
      id: "1",
      title: "Monthly Expenses Forecast",
      description: "Based on current trends, your monthly expenses are likely to increase by 5% next month due to seasonal factors.",
      confidence: 85,
      impact: 'medium',
      category: 'Expenses',
      value: 6510,
      trend: 'up'
    },
    {
      id: "2",
      title: "Savings Goal Achievement",
      description: "You're on track to achieve your emergency fund goal 2 months ahead of schedule.",
      confidence: 92,
      impact: 'high',
      category: 'Savings',
      trend: 'up'
    },
    {
      id: "3",
      title: "Cash Flow Projection",
      description: "Your cash flow is expected to remain positive with a projected surplus of $2,800 next month.",
      confidence: 78,
      impact: 'high',
      category: 'Cash Flow',
      value: 2800,
      trend: 'up'
    }
  ];

  const recommendations: Recommendation[] = [
    {
      id: "1",
      title: "Optimize Subscription Costs",
      description: "You have 3 overlapping streaming services. Consider consolidating to save money.",
      priority: 'medium',
      category: 'Cost Reduction',
      potentialSavings: 25
    },
    {
      id: "2",
      title: "Increase Emergency Fund",
      description: "Your emergency fund covers 4.2 months of expenses. Consider increasing to 6 months for better security.",
      priority: 'high',
      category: 'Risk Management'
    },
    {
      id: "3",
      title: "Investment Opportunity",
      description: "Your cash reserves are high. Consider investing excess funds in your portfolio.",
      priority: 'medium',
      category: 'Investment',
      potentialSavings: 120
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Predictive Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Predictive Insights
          </CardTitle>
          <CardDescription>
            AI-powered predictions based on your financial patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">{prediction.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {prediction.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getImpactColor(prediction.impact)}>
                    {prediction.impact} impact
                  </Badge>
                  {prediction.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : prediction.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Progress value={prediction.confidence} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">
                    {prediction.confidence}%
                  </span>
                </div>
                {prediction.value && (
                  <div className="text-sm font-medium">
                    {formatCurrency(prediction.value)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Smart Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Smart Recommendations
          </CardTitle>
          <CardDescription>
            Personalized suggestions to optimize your finances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((recommendation) => (
            <Alert key={recommendation.id}>
              <div className="flex items-start justify-between w-full">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTitle className="text-base">{recommendation.title}</AlertTitle>
                    <Badge variant={getPriorityColor(recommendation.priority)}>
                      {recommendation.priority} priority
                    </Badge>
                  </div>
                  <AlertDescription>{recommendation.description}</AlertDescription>
                  {recommendation.potentialSavings && (
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                      <DollarSign className="h-4 w-4" />
                      Potential monthly savings: {formatCurrency(recommendation.potentialSavings)}
                    </div>
                  )}
                </div>
                {recommendation.priority === 'high' && (
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
                )}
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Financial Health Score
          </CardTitle>
          <CardDescription>
            Overall assessment of your financial well-being
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">82/100</div>
              <p className="text-muted-foreground">Good Financial Health</p>
            </div>
            
            <div className="space-y-4">
              {[
                { metric: "Emergency Fund", score: 85, description: "4.2 months of expenses covered" },
                { metric: "Debt-to-Income Ratio", score: 90, description: "Low debt burden" },
                { metric: "Savings Rate", score: 75, description: "24% monthly savings rate" },
                { metric: "Investment Diversification", score: 80, description: "Well diversified portfolio" }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.metric}</span>
                    <span className="text-sm text-muted-foreground">{item.score}/100</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
