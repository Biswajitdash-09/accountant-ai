import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancialDataHub } from "@/hooks/useFinancialDataHub";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useProfile } from "@/hooks/useProfile";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const TaxImpactAnalyzer = () => {
  const { financialData, isLoading } = useFinancialDataHub();
  const { formatCurrency } = useCurrencyFormatter();
  const { profile } = useProfile();

  if (isLoading) return <div className="animate-pulse">Loading tax analysis...</div>;
  if (!financialData) return <div>No data available</div>;

  // Estimate tax impact by source (simplified)
  const taxableIncome = {
    traditional: financialData.cashFlow.income * 0.3, // Assume 30% of traditional income is taxable
    crypto: financialData.netWorth.breakdown.crypto * 0.2, // Capital gains estimate
    investment: financialData.netWorth.breakdown.investments * 0.15, // Capital gains
  };

  const totalTaxLiability = Object.values(taxableIncome).reduce((sum, val) => sum + val, 0);

  const taxData = [
    { source: 'Traditional Income', liability: taxableIncome.traditional, rate: '30%' },
    { source: 'Crypto Gains', liability: taxableIncome.crypto, rate: '20%' },
    { source: 'Investment Gains', liability: taxableIncome.investment, rate: '15%' },
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Tax Estimates</AlertTitle>
        <AlertDescription>
          These are estimates based on your selected region. Consult a tax professional for accurate calculations.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estimated Tax Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatCurrency(totalTaxLiability)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total across all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Traditional Income Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(taxableIncome.traditional)}</div>
            <p className="text-xs text-muted-foreground mt-1">~30% of income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Capital Gains Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(taxableIncome.crypto + taxableIncome.investment)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Crypto + Investments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Liability by Source</CardTitle>
          <CardDescription>Estimated tax impact from each financial source</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taxData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="liability" fill="hsl(var(--destructive))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Tax Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <div>
                  <p className="font-medium">Hold crypto longer</p>
                  <p className="text-sm text-muted-foreground">
                    Consider long-term capital gains rates by holding for 12+ months
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <div>
                  <p className="font-medium">Max out retirement contributions</p>
                  <p className="text-sm text-muted-foreground">
                    Reduce taxable income by contributing to tax-advantaged accounts
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <div>
                  <p className="font-medium">Track deductible expenses</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure you're capturing all business and investment-related deductions
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Tax Risks to Monitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <div>
                  <p className="font-medium">High crypto transaction volume</p>
                  <p className="text-sm text-muted-foreground">
                    Frequent trading may trigger short-term capital gains at higher rates
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <div>
                  <p className="font-medium">Missing transaction records</p>
                  <p className="text-sm text-muted-foreground">
                    Ensure all transactions are properly documented for audit purposes
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-1">•</span>
                <div>
                  <p className="font-medium">Multi-jurisdiction income</p>
                  <p className="text-sm text-muted-foreground">
                    Income from multiple countries may require additional filings
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};