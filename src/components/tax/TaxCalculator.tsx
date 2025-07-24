
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingUp, FileText } from "lucide-react";
import { useTaxCalculations } from "@/hooks/useTaxCalculations";
import { useTaxPeriods } from "@/hooks/useTaxPeriods";
import { useTaxDeductions } from "@/hooks/useTaxDeductions";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTransactions } from "@/hooks/useTransactions";

export const TaxCalculator = () => {
  const { taxPeriods } = useTaxPeriods();
  const currentPeriod = taxPeriods.find(p => p.status === 'active') || taxPeriods[0];
  const { taxCalculations, calculateTax, isLoading } = useTaxCalculations(currentPeriod?.id);
  const { taxDeductions } = useTaxDeductions(currentPeriod?.id);
  const { transactions } = useTransactions();
  const { formatCurrency } = useCurrencyFormatter();

  const [grossIncome, setGrossIncome] = useState('');
  const [customDeductions, setCustomDeductions] = useState('');

  const currentCalculation = taxCalculations[0];
  const approvedDeductions = taxDeductions.filter(d => d.is_approved).reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate income from transactions
  const periodIncome = transactions
    .filter(t => t.type === 'income' && currentPeriod && 
      new Date(t.date) >= new Date(currentPeriod.start_date) && 
      new Date(t.date) <= new Date(currentPeriod.end_date))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCalculate = async () => {
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
    { range: "$0 - $11,000", rate: "10%", color: "bg-green-100" },
    { range: "$11,000 - $44,725", rate: "12%", color: "bg-green-200" },
    { range: "$44,725 - $95,375", rate: "22%", color: "bg-yellow-100" },
    { range: "$95,375 - $182,050", rate: "24%", color: "bg-yellow-200" },
    { range: "$182,050 - $231,250", rate: "32%", color: "bg-orange-100" },
    { range: "$231,250 - $578,125", rate: "35%", color: "bg-orange-200" },
    { range: "$578,125+", rate: "37%", color: "bg-red-100" }
  ];

  return (
    <div className="space-y-6">
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
                `Tax Year ${currentPeriod?.tax_year}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gross-income">Gross Income</Label>
              <Input
                id="gross-income"
                type="number"
                step="0.01"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                placeholder={`Auto-calculated: ${formatCurrency(periodIncome)}`}
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
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave blank to use approved deductions
              </p>
            </div>

            <Button onClick={handleCalculate} disabled={isLoading} className="w-full">
              {isLoading ? 'Calculating...' : 'Calculate Tax'}
            </Button>
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
                    <span className="font-medium">{bracket.range}</span>
                    <span className="font-semibold">{bracket.rate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculation Results */}
      {currentCalculation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tax Calculation Results
            </CardTitle>
            <CardDescription>
              Last calculated: {new Date(currentCalculation.calculated_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{formatCurrency(currentCalculation.gross_income)}</div>
                <div className="text-sm text-muted-foreground">Gross Income</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">-{formatCurrency(currentCalculation.total_deductions)}</div>
                <div className="text-sm text-muted-foreground">Total Deductions</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{formatCurrency(currentCalculation.taxable_income)}</div>
                <div className="text-sm text-muted-foreground">Taxable Income</div>
              </div>
              <div className="text-center p-4 bg-finance-highlight/10 rounded-lg border-2 border-finance-highlight">
                <div className="text-2xl font-bold text-finance-highlight">{formatCurrency(currentCalculation.amount_owed)}</div>
                <div className="text-sm text-muted-foreground">Tax Owed</div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h4 className="font-semibold">Calculation Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tax Liability</p>
                  <p className="font-medium">{formatCurrency(currentCalculation.tax_liability)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Credits Applied</p>
                  <p className="font-medium">{formatCurrency(currentCalculation.credits_applied)}</p>
                </div>
              </div>
              
              {currentCalculation.calculation_details?.taxBrackets && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Applicable Tax Brackets</p>
                  <div className="space-y-1">
                    {currentCalculation.calculation_details.taxBrackets
                      .filter((bracket: any) => bracket.applicable)
                      .map((bracket: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{bracket.range}</span>
                          <span>{bracket.rate}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
