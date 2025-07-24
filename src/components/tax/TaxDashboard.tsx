
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Calculator, FileText } from "lucide-react";
import { useTaxPeriods } from "@/hooks/useTaxPeriods";
import { useTaxCalculations } from "@/hooks/useTaxCalculations";
import { useTaxDeductions } from "@/hooks/useTaxDeductions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export const TaxDashboard = () => {
  const { taxPeriods, isLoading: periodsLoading } = useTaxPeriods();
  const { taxCalculations, isLoading: calculationsLoading } = useTaxCalculations();
  const { taxDeductions, isLoading: deductionsLoading } = useTaxDeductions();
  const { formatCurrency } = useCurrencyFormatter();

  const currentPeriod = taxPeriods.find(p => p.status === 'active') || taxPeriods[0];
  const currentCalculation = taxCalculations.find(c => c.tax_period_id === currentPeriod?.id);
  const currentDeductions = taxDeductions.filter(d => d.tax_period_id === currentPeriod?.id);

  const totalDeductions = currentDeductions.reduce((sum, d) => sum + d.amount, 0);
  const approvedDeductions = currentDeductions.filter(d => d.is_approved).reduce((sum, d) => sum + d.amount, 0);
  const pendingDeductions = totalDeductions - approvedDeductions;

  if (periodsLoading || calculationsLoading || deductionsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tax Liability Card */}
        <Card className="border-finance-highlight border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Tax Liability</CardTitle>
                <CardDescription>
                  {currentPeriod?.period_type === 'quarterly' ? 
                    `Q${currentPeriod?.quarter} ${currentPeriod?.tax_year}` : 
                    `Tax Year ${currentPeriod?.tax_year}`
                  }
                </CardDescription>
              </div>
              <AlertTriangle className="h-6 w-6 text-finance-highlight" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatCurrency(currentCalculation?.amount_owed || currentPeriod?.estimated_tax_due || 0)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Payment Progress</span>
                <span>{Math.round(((currentPeriod?.amount_paid || 0) / (currentPeriod?.estimated_tax_due || 1)) * 100)}%</span>
              </div>
              <Progress 
                value={Math.min(100, ((currentPeriod?.amount_paid || 0) / (currentPeriod?.estimated_tax_due || 1)) * 100)} 
                className="h-2" 
              />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Paid: {formatCurrency(currentPeriod?.amount_paid || 0)}
            </div>
          </CardContent>
        </Card>

        {/* Deductions Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Tax Deductions</CardTitle>
                <CardDescription>Identified savings opportunities</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-finance-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {formatCurrency(totalDeductions)}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Approved</span>
                <Badge variant="secondary">{formatCurrency(approvedDeductions)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Review</span>
                <Badge variant="outline">{formatCurrency(pendingDeductions)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Efficiency Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Tax Efficiency</CardTitle>
                <CardDescription>Optimization score</CardDescription>
              </div>
              <Calculator className="h-5 w-5 text-finance-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {Math.round(((approvedDeductions / (currentCalculation?.gross_income || 1)) * 100) || 0)}%
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Deduction Utilization</span>
                <span>Good</span>
              </div>
              <Progress 
                value={Math.min(100, ((approvedDeductions / (currentCalculation?.gross_income || 1)) * 100) || 0)} 
                className="h-2" 
              />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Gross Income: {formatCurrency(currentCalculation?.gross_income || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tax management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <FileText className="h-6 w-6 mb-2 text-finance-highlight" />
              <h4 className="font-medium">Review Deductions</h4>
              <p className="text-sm text-muted-foreground">Check pending expense categories</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <Calculator className="h-6 w-6 mb-2 text-finance-secondary" />
              <h4 className="font-medium">Calculate Tax</h4>
              <p className="text-sm text-muted-foreground">Run current period calculation</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <TrendingUp className="h-6 w-6 mb-2 text-finance-accent" />
              <h4 className="font-medium">View Reports</h4>
              <p className="text-sm text-muted-foreground">Generate tax reports</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
              <AlertTriangle className="h-6 w-6 mb-2 text-finance-highlight" />
              <h4 className="font-medium">Upcoming Deadlines</h4>
              <p className="text-sm text-muted-foreground">View tax calendar</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
