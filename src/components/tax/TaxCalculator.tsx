
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, FileText, AlertTriangle } from "lucide-react";
import { useTaxCalculations } from "@/hooks/useTaxCalculations";
import { useTaxPeriods } from "@/hooks/useTaxPeriods";
import { useTaxDeductions } from "@/hooks/useTaxDeductions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTransactions } from "@/hooks/useTransactions";
import { useDemoMode } from "@/hooks/useDemoMode";
import { getDemoData } from "@/utils/demoData";
import { useToast } from "@/components/ui/use-toast";
import DemoAccountBadge from "@/components/DemoAccountBadge";
import { MobileForm, MobileFormSection, MobileFormRow } from "@/components/ui/mobile-form";

export const TaxCalculator = () => {
  const { taxPeriods } = useTaxPeriods();
  const currentPeriod = taxPeriods.find(p => p.status === 'active') || taxPeriods[0];
  const { taxCalculations, calculateTax, isLoading } = useTaxCalculations(currentPeriod?.id);
  const { taxDeductions } = useTaxDeductions(currentPeriod?.id);
  const { transactions } = useTransactions();
  const { formatCurrency } = useCurrencyFormatter();
  const { isDemo } = useDemoMode();
  const { toast } = useToast();

  const [grossIncome, setGrossIncome] = useState('');
  const [customDeductions, setCustomDeductions] = useState('');

  // Use demo data if in demo mode
  const displayTransactions = isDemo ? getDemoData('transactions') : transactions;

  const currentCalculation = taxCalculations[0];
  const approvedDeductions = taxDeductions.filter(d => d.is_approved).reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate income from transactions
  const periodIncome = displayTransactions
    .filter(t => t.type === 'income' && currentPeriod && 
      new Date(t.date) >= new Date(currentPeriod.start_date) && 
      new Date(t.date) <= new Date(currentPeriod.end_date))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCalculate = async () => {
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Tax calculation simulated in demo mode",
      });
      return;
    }

    if (!currentPeriod) return;

    const income = parseFloat(grossIncome) || periodIncome;
    const deductions = parseFloat(customDeductions) || approvedDeductions;

    await calculateTax.mutateAsync({
      taxPeriodId: currentPeriod.id,
      grossIncome: income,
      deductions: deductions,
      businessEntityId: currentPeriod.business_entity_id
    });
  };

  const taxBrackets = [
    { range: "$0 - $11,000", rate: "10%", color: "bg-green-100 text-green-800" },
    { range: "$11,000 - $44,725", rate: "12%", color: "bg-green-200 text-green-800" },
    { range: "$44,725 - $95,375", rate: "22%", color: "bg-yellow-100 text-yellow-800" },
    { range: "$95,375 - $182,050", rate: "24%", color: "bg-yellow-200 text-yellow-800" },
    { range: "$182,050 - $231,250", rate: "32%", color: "bg-orange-100 text-orange-800" },
    { range: "$231,250 - $578,125", rate: "35%", color: "bg-orange-200 text-orange-800" },
    { range: "$578,125+", rate: "37%", color: "bg-red-100 text-red-800" }
  ];

  // Demo calculation for display
  const demoCalculation = isDemo ? {
    gross_income: 75000,
    total_deductions: 15000,
    taxable_income: 60000,
    tax_liability: 9240,
    credits_applied: 1000,
    amount_owed: 8240,
    calculated_at: new Date().toISOString()
  } : null;

  const displayCalculation = isDemo ? demoCalculation : currentCalculation;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tax Calculator</h1>
          <p className="text-muted-foreground mt-2">
            Calculate your tax liability and plan your payments
          </p>
        </div>

        <DemoAccountBadge />

        <MobileForm>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tax Calculator
                </CardTitle>
                <CardDescription>
                  Calculate your tax liability for {currentPeriod?.period_type === 'quarterly' ? 
                    `Q${currentPeriod?.quarter} ${currentPeriod?.tax_year}` : 
                    `Tax Year ${currentPeriod?.tax_year || '2024'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileFormSection title="Income & Deductions">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="gross-income">Gross Income</Label>
                      <Input
                        id="gross-income"
                        type="number"
                        step="0.01"
                        value={grossIncome}
                        onChange={(e) => setGrossIncome(e.target.value)}
                        placeholder={`Auto-calculated: ${formatCurrency(periodIncome)}`}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Leave blank to use calculated income from transactions
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="deductions">Total Deductions</Label>
                      <Input
                        id="deductions"
                        type="number"
                        step="0.01"
                        value={customDeductions}
                        onChange={(e) => setCustomDeductions(e.target.value)}
                        placeholder={`Auto-calculated: ${formatCurrency(approvedDeductions)}`}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Leave blank to use approved deductions
                      </p>
                    </div>

                    <Button 
                      onClick={handleCalculate} 
                      disabled={isLoading} 
                      className="w-full h-12"
                    >
                      {isLoading ? 'Calculating...' : 'Calculate Tax'}
                    </Button>
                  </div>
                </MobileFormSection>
              </CardContent>
            </Card>

            {/* Tax Brackets */}
            <Card>
              <CardHeader>
                <CardTitle>2024 Tax Brackets</CardTitle>
                <CardDescription>Federal income tax rates for single filers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {taxBrackets.map((bracket, index) => (
                    <div key={index} className={`p-3 rounded-lg ${bracket.color}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm sm:text-base">{bracket.range}</span>
                        <span className="font-semibold">{bracket.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calculation Results */}
          {displayCalculation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tax Calculation Results
                  {isDemo && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (Demo Data)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Last calculated: {new Date(displayCalculation.calculated_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold">
                      {formatCurrency(displayCalculation.gross_income)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Gross Income</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      -{formatCurrency(displayCalculation.total_deductions)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Total Deductions</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold">
                      {formatCurrency(displayCalculation.taxable_income)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Taxable Income</div>
                  </div>
                  <div className="text-center p-4 bg-finance-highlight/10 rounded-lg border-2 border-finance-highlight">
                    <div className="text-xl sm:text-2xl font-bold text-finance-highlight">
                      {formatCurrency(displayCalculation.amount_owed)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Tax Owed</div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-semibold">Calculation Breakdown</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Tax Liability</p>
                      <p className="font-medium text-lg">
                        {formatCurrency(displayCalculation.tax_liability)}
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Credits Applied</p>
                      <p className="font-medium text-lg">
                        {formatCurrency(displayCalculation.credits_applied)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coming Soon Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Advanced Tax Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Quarterly Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    Track and manage your quarterly tax payments with automatic reminders.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Tax Form Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Auto-generate tax forms based on your financial data and calculations.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Multi-State Filing</h4>
                  <p className="text-sm text-muted-foreground">
                    Support for filing taxes in multiple states with proper allocations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MobileForm>
      </div>
    </div>
  );
};
