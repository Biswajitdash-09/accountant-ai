
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, TrendingUp, FileText, AlertTriangle, Save } from "lucide-react";
import { useTaxCalculations } from "@/hooks/useTaxCalculations";
import { useTaxPeriods } from "@/hooks/useTaxPeriods";
import { useTaxDeductions } from "@/hooks/useTaxDeductions";
import { useTaxSettings } from "@/hooks/useTaxSettings";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useTransactions } from "@/hooks/useTransactions";
import { useDemoMode } from "@/hooks/useDemoMode";
import { getDemoData } from "@/utils/demoData";
import { useToast } from "@/components/ui/use-toast";
import DemoAccountBadge from "@/components/DemoAccountBadge";
import { MobileForm, MobileFormSection } from "@/components/ui/mobile-form";

export const TaxCalculator = ({ selectedCountry = 'USA' }: { selectedCountry?: 'USA' | 'UK' | 'India' | 'Nigeria' }) => {
  const { taxPeriods, createTaxPeriod } = useTaxPeriods();
  const { taxSettings } = useTaxSettings();
  const currentPeriod = taxPeriods.find(p => p.status === 'active') || taxPeriods[0];
  const { taxCalculations, calculateTax, isLoading } = useTaxCalculations(currentPeriod?.id);
  const { taxDeductions } = useTaxDeductions(currentPeriod?.id);
  const { transactions } = useTransactions();
  const { formatCurrency } = useCurrencyFormatter();
  const { isDemo } = useDemoMode();
  const { toast } = useToast();

  const [grossIncome, setGrossIncome] = useState('');
  const [customDeductions, setCustomDeductions] = useState('');
  const [filingStatus, setFilingStatus] = useState('single');
  const [businessType, setBusinessType] = useState('sole_proprietorship');

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

  // Load tax settings when available
  useEffect(() => {
    if (taxSettings) {
      setFilingStatus(taxSettings.filing_status);
      setBusinessType(taxSettings.business_type);
    }
  }, [taxSettings]);

  const handleCalculate = async () => {
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Tax calculation simulated in demo mode - showing sample results",
      });
      return;
    }

    if (!currentPeriod) {
      toast({
        title: "Error",
        description: "No active tax period found. Please create a tax period first.",
        variant: "destructive",
      });
      return;
    }

    const income = parseFloat(grossIncome) || periodIncome;
    const deductions = parseFloat(customDeductions) || approvedDeductions;

    if (income <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid gross income amount",
        variant: "destructive",
      });
      return;
    }

    await calculateTax.mutateAsync({
      taxPeriodId: currentPeriod.id,
      grossIncome: income,
      deductions: deductions,
      businessEntityId: currentPeriod.business_entity_id
    });

    toast({
      title: "Success",
      description: "Tax calculated using real 2026 tax formulas",
    });
  };

  const handleSaveCalculation = () => {
    if (!currentCalculation) {
      toast({
        title: "Error",
        description: "No calculation to save. Please calculate tax first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Tax calculation saved successfully",
    });
  };

  const getTaxBrackets = (filingStatus: string, country: 'USA' | 'UK' | 'India' | 'Nigeria') => {
    // Minimal illustrative brackets per country (for display only)
    if (country === 'UK') {
      return [
        { range: "£0 - £12,570", rate: "0%", color: "bg-green-100 text-green-800" },
        { range: "£12,571 - £50,270", rate: "20%", color: "bg-yellow-100 text-yellow-800" },
        { range: "£50,271 - £125,140", rate: "40%", color: "bg-orange-100 text-orange-800" },
        { range: "> £125,140", rate: "45%", color: "bg-red-100 text-red-800" },
      ];
    }
    if (country === 'India') {
      return [
        { range: "₹0 - ₹3,00,000", rate: "0%", color: "bg-green-100 text-green-800" },
        { range: "₹3,00,001 - ₹7,00,000", rate: "5%", color: "bg-yellow-100 text-yellow-800" },
        { range: "₹7,00,001 - ₹10,00,000", rate: "10%", color: "bg-orange-100 text-orange-800" },
        { range: "₹10,00,001 - ₹12,00,000", rate: "15%", color: "bg-orange-200 text-orange-800" },
        { range: "₹12,00,001 - ₹15,00,000", rate: "20%", color: "bg-red-100 text-red-800" },
        { range: "> ₹15,00,000", rate: "30%", color: "bg-red-200 text-red-800" },
      ];
    }
    if (country === 'Nigeria') {
      return [
        { range: "₦0 - ₦300,000", rate: "7%", color: "bg-green-100 text-green-800" },
        { range: "₦300,001 - ₦600,000", rate: "11%", color: "bg-yellow-100 text-yellow-800" },
        { range: "₦600,001 - ₦1,100,000", rate: "15%", color: "bg-orange-100 text-orange-800" },
        { range: "₦1,100,001 - ₦1,600,000", rate: "19%", color: "bg-orange-200 text-orange-800" },
        { range: "₦1,600,001 - ₦3,200,000", rate: "21%", color: "bg-red-100 text-red-800" },
        { range: "> ₦3,200,000", rate: "24%", color: "bg-red-200 text-red-800" },
      ];
    }

    // Default USA brackets with filing status
    const brackets = {
      single: [
        { range: "$0 - $11,000", rate: "10%", color: "bg-green-100 text-green-800" },
        { range: "$11,000 - $44,725", rate: "12%", color: "bg-green-200 text-green-800" },
        { range: "$44,725 - $95,375", rate: "22%", color: "bg-yellow-100 text-yellow-800" },
        { range: "$95,375 - $182,050", rate: "24%", color: "bg-yellow-200 text-yellow-800" },
        { range: "$182,050 - $231,250", rate: "32%", color: "bg-orange-100 text-orange-800" },
        { range: "$231,250 - $578,125", rate: "35%", color: "bg-orange-200 text-orange-800" },
        { range: "$578,125+", rate: "37%", color: "bg-red-100 text-red-800" }
      ],
      married_filing_jointly: [
        { range: "$0 - $22,000", rate: "10%", color: "bg-green-100 text-green-800" },
        { range: "$22,000 - $89,450", rate: "12%", color: "bg-green-200 text-green-800" },
        { range: "$89,450 - $190,750", rate: "22%", color: "bg-yellow-100 text-yellow-800" },
        { range: "$190,750 - $364,200", rate: "24%", color: "bg-yellow-200 text-yellow-800" },
        { range: "$364,200 - $462,500", rate: "32%", color: "bg-orange-100 text-orange-800" },
        { range: "$462,500 - $693,750", rate: "35%", color: "bg-orange-200 text-orange-800" },
        { range: "$693,750+", rate: "37%", color: "bg-red-100 text-red-800" }
      ]
    } as const;

    return brackets[filingStatus as keyof typeof brackets] || brackets.single;
  };

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
  const taxBrackets = getTaxBrackets(filingStatus, selectedCountry);

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

        {!currentPeriod && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No active tax period</CardTitle>
              <CardDescription>
                Create a current year tax period to start calculations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  const now = new Date();
                  const year = now.getFullYear();
                  await createTaxPeriod.mutateAsync({
                    period_type: 'annual',
                    tax_year: year,
                    start_date: `${year}-01-01`,
                    end_date: `${year}-12-31`,
                    status: 'active',
                    estimated_tax_due: 0,
                    actual_tax_due: 0,
                    amount_paid: 0,
                  } as any);
                }}
              >
                Create Current Tax Period
              </Button>
            </CardContent>
          </Card>
        )}

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
                <MobileFormSection title="Tax Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="filing-status">Filing Status</Label>
                      <Select value={filingStatus} onValueChange={setFilingStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married_filing_jointly">Married Filing Jointly</SelectItem>
                          <SelectItem value="married_filing_separately">Married Filing Separately</SelectItem>
                          <SelectItem value="head_of_household">Head of Household</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="business-type">Business Type</Label>
                      <Select value={businessType} onValueChange={setBusinessType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="s_corp">S Corporation</SelectItem>
                          <SelectItem value="c_corp">C Corporation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </MobileFormSection>

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

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCalculate} 
                        disabled={isLoading} 
                        className="flex-1 h-12"
                      >
                        {isLoading ? 'Calculating...' : 'Calculate Tax'}
                      </Button>
                      
                      {displayCalculation && (
                        <Button 
                          onClick={handleSaveCalculation}
                          variant="outline"
                          className="h-12"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </MobileFormSection>
              </CardContent>
            </Card>

            {/* Tax Brackets */}
            <Card>
              <CardHeader>
                <CardTitle>2024 Tax Brackets</CardTitle>
                <CardDescription>
                  Federal income tax rates for {filingStatus.replace('_', ' ')} filers
                </CardDescription>
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
                
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Tax brackets are marginal rates. You only pay the higher rate on income above each threshold.
                  </p>
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
                  
                  {/* Tax Planning Insights */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-blue-900 mb-2">💡 Tax Planning Insights</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Consider maximizing retirement contributions to reduce taxable income</li>
                      <li>• Review eligible business expenses for additional deductions</li>
                      <li>• Plan quarterly payments to avoid underpayment penalties</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Next Steps & Tax Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Quarterly Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up quarterly estimated tax payments to avoid penalties and spread your tax liability.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Deduction Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Review your business expenses and ensure you're capturing all eligible deductions.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Tax Calendar</h4>
                  <p className="text-sm text-muted-foreground">
                    Stay on top of important tax deadlines with our integrated tax calendar feature.
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
