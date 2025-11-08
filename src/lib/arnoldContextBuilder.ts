import { UnifiedFinancialData } from "@/hooks/useFinancialDataHub";

export interface ArnoldFinancialContext {
  user: {
    name?: string;
    region?: string;
    currency: string;
    riskTolerance?: string;
  };
  accounts: {
    traditional: any[];
    crypto: any[];
    investment: any[];
  };
  netWorth: {
    total: number;
    breakdown: {
      traditional: number;
      crypto: number;
      investments: number;
    };
    trend: number;
  };
  cashFlow: {
    income: number;
    expenses: number;
    savings: number;
    sources: string[];
  };
  transactions: {
    recent: any[];
    patterns: string[];
    anomalies: any[];
  };
  investments: {
    stocks: any[];
    crypto: any[];
    realEstate: any[];
  };
  taxSituation?: {
    region: string;
    obligations: any[];
    deductions: any[];
    optimization: string[];
  };
  documents: {
    uploaded: any[];
    insights: string[];
  };
  goals: {
    active: any[];
    progress: Record<string, number>;
    recommendations: string[];
  };
}

export const buildArnoldContext = (
  financialData: UnifiedFinancialData | null,
  userProfile?: any,
  goals?: any[],
  documents?: any[]
): ArnoldFinancialContext => {
  if (!financialData) {
    return {
      user: {
        name: userProfile?.full_name,
        region: userProfile?.region,
        currency: "USD",
      },
      accounts: { traditional: [], crypto: [], investment: [] },
      netWorth: {
        total: 0,
        breakdown: { traditional: 0, crypto: 0, investments: 0 },
        trend: 0,
      },
      cashFlow: { income: 0, expenses: 0, savings: 0, sources: [] },
      transactions: { recent: [], patterns: [], anomalies: [] },
      investments: { stocks: [], crypto: [], realEstate: [] },
      documents: { uploaded: [], insights: [] },
      goals: { active: [], progress: {}, recommendations: [] },
    };
  }

  // Analyze spending patterns
  const patterns = analyzeSpendingPatterns(financialData.transactions);

  // Detect anomalies
  const anomalies = detectAnomalies(financialData.transactions);

  // Calculate goal progress
  const goalProgress: Record<string, number> = {};
  if (goals) {
    goals.forEach((goal) => {
      const current = goal.current_amount || 0;
      const target = goal.target_amount || 1;
      goalProgress[goal.id] = (current / target) * 100;
    });
  }

  return {
    user: {
      name: userProfile?.full_name,
      region: userProfile?.region || "US",
      currency: userProfile?.currency || "USD",
      riskTolerance: userProfile?.risk_tolerance,
    },
    accounts: financialData.accounts,
    netWorth: financialData.netWorth,
    cashFlow: financialData.cashFlow,
    transactions: {
      recent: financialData.transactions.slice(0, 20),
      patterns,
      anomalies,
    },
    investments: financialData.investments,
    documents: {
      uploaded: documents || [],
      insights: extractDocumentInsights(documents || []),
    },
    goals: {
      active: goals || [],
      progress: goalProgress,
      recommendations: generateGoalRecommendations(goals || [], financialData),
    },
  };
};

const analyzeSpendingPatterns = (transactions: any[]): string[] => {
  const patterns: string[] = [];

  // Group by category
  const categorySpending: Record<string, number> = {};
  transactions.forEach((t) => {
    if (t.type === "expense") {
      const category = t.category || "uncategorized";
      categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
    }
  });

  // Find top spending category
  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    patterns.push(`Highest spending in ${topCategory[0]}: $${topCategory[1].toFixed(2)}`);
  }

  // Check for recurring expenses
  const recurringCount = transactions.filter((t) => t.metadata?.recurring).length;
  if (recurringCount > 0) {
    patterns.push(`${recurringCount} recurring expenses detected`);
  }

  return patterns;
};

const detectAnomalies = (transactions: any[]): any[] => {
  const anomalies: any[] = [];

  // Calculate average transaction amount
  const amounts = transactions.map((t) => Math.abs(t.amount));
  const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
  const threshold = avg * 3;

  // Find unusually large transactions
  transactions.forEach((t) => {
    if (Math.abs(t.amount) > threshold) {
      anomalies.push({
        transaction: t,
        reason: "Unusually large amount",
        amount: t.amount,
      });
    }
  });

  return anomalies;
};

const extractDocumentInsights = (documents: any[]): string[] => {
  const insights: string[] = [];

  if (documents.length > 0) {
    insights.push(`${documents.length} documents uploaded for analysis`);
  }

  // Check for tax documents
  const taxDocs = documents.filter((d) =>
    d.type?.toLowerCase().includes("tax") || d.name?.toLowerCase().includes("tax")
  );
  if (taxDocs.length > 0) {
    insights.push(`${taxDocs.length} tax-related documents found`);
  }

  return insights;
};

const generateGoalRecommendations = (goals: any[], financialData: UnifiedFinancialData): string[] => {
  const recommendations: string[] = [];

  if (goals.length === 0) {
    recommendations.push("Consider setting financial goals to track your progress");
    return recommendations;
  }

  goals.forEach((goal) => {
    const current = goal.current_amount || 0;
    const target = goal.target_amount || 1;
    const progress = (current / target) * 100;

    if (progress < 25) {
      recommendations.push(`${goal.goal_name}: Needs attention - only ${progress.toFixed(1)}% complete`);
    } else if (progress >= 75) {
      recommendations.push(`${goal.goal_name}: Almost there - ${progress.toFixed(1)}% complete!`);
    }
  });

  // Savings recommendation based on cash flow
  if (financialData.cashFlow.savings > 0) {
    const monthlySavings = financialData.cashFlow.savings;
    recommendations.push(`You're saving $${monthlySavings.toFixed(2)}/month - consider increasing contributions to goals`);
  }

  return recommendations;
};
