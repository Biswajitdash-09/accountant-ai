import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Building2, Info } from "lucide-react";
import { calculateNigeriaTax2026, calculateNigeriaBusinessTax } from "@/lib/nigeriaTaxCalculations";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const NigeriaTaxCalculator = () => {
  // Individual Tax State (2026 Updated)
  const [grossIncome, setGrossIncome] = useState<number>(0);
  const [annualRent, setAnnualRent] = useState<number>(0);
  const [pension, setPension] = useState<number>(0);
  const [nhis, setNhis] = useState<number>(0);
  const [nhf, setNhf] = useState<number>(0);
  const [lifeInsurance, setLifeInsurance] = useState<number>(0);
  const [housingLoanInterest, setHousingLoanInterest] = useState<number>(0);
  const [childEducation, setChildEducation] = useState<number>(0);
  const [disability, setDisability] = useState<number>(0);
  const [individualResult, setIndividualResult] = useState<ReturnType<typeof calculateNigeriaTax2026> | null>(null);

  // Business Tax State
  const [revenue, setRevenue] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [isSmallCompany, setIsSmallCompany] = useState<boolean>(false);
  const [businessResult, setBusinessResult] = useState<ReturnType<typeof calculateNigeriaBusinessTax> | null>(null);

  const handleIndividualCalculate = () => {
    const result = calculateNigeriaTax2026({
      grossIncome,
      annualRent,
      pension,
      nhis,
      nhf,
      lifeInsurance,
      housingLoanInterest,
      otherDeductions: childEducation + disability
    });
    setIndividualResult(result);
  };

  const handleBusinessCalculate = () => {
    const result = calculateNigeriaBusinessTax(revenue, expenses, isSmallCompany);
    setBusinessResult(result);
  };

  const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Nigeria Tax Calculator
        </CardTitle>
        <CardDescription>
          Calculate individual and corporate taxes based on Nigerian tax laws
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual Tax</TabsTrigger>
            <TabsTrigger value="business">Business Tax</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="grossIncome">Gross Annual Income (₦)</Label>
                <Input
                  id="grossIncome"
                  type="number"
                  value={grossIncome || ''}
                  onChange={(e) => setGrossIncome(parseFloat(e.target.value) || 0)}
                  placeholder="Enter gross income"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Allowable Deductions (2026 Updated)</Label>
                
                <TooltipProvider>
                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="annualRent" className="text-sm text-muted-foreground">Annual Rent Paid</Label>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent>20% of rent paid, capped at ₦500,000</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="annualRent"
                      type="number"
                      value={annualRent || ''}
                      onChange={(e) => setAnnualRent(parseFloat(e.target.value) || 0)}
                      placeholder="Enter annual rent paid"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="pension" className="text-sm text-muted-foreground">Pension Contribution (8% minimum)</Label>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent>Mandatory 8% of basic salary</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="pension"
                      type="number"
                      value={pension || ''}
                      onChange={(e) => setPension(parseFloat(e.target.value) || 0)}
                      placeholder="Enter pension contribution"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="nhis" className="text-sm text-muted-foreground">NHIS Contribution</Label>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent>National Health Insurance Scheme contribution</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="nhis"
                      type="number"
                      value={nhis || ''}
                      onChange={(e) => setNhis(parseFloat(e.target.value) || 0)}
                      placeholder="Enter NHIS contribution"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="nhf" className="text-sm text-muted-foreground">National Housing Fund (NHF) - 2.5%</Label>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent>2.5% of basic salary for NHF</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="nhf"
                      type="number"
                      value={nhf || ''}
                      onChange={(e) => setNhf(parseFloat(e.target.value) || 0)}
                      placeholder="Enter NHF contribution"
                    />
                  </div>

                  <div>
                    <Label htmlFor="insurance" className="text-sm text-muted-foreground">Life Insurance Premium</Label>
                    <Input
                      id="insurance"
                      type="number"
                      value={lifeInsurance || ''}
                      onChange={(e) => setLifeInsurance(parseFloat(e.target.value) || 0)}
                      placeholder="Enter insurance premium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="housingLoan" className="text-sm text-muted-foreground">Housing Loan Interest</Label>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent>Interest paid on housing/mortgage loans</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="housingLoan"
                      type="number"
                      value={housingLoanInterest || ''}
                      onChange={(e) => setHousingLoanInterest(parseFloat(e.target.value) || 0)}
                      placeholder="Enter housing loan interest"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="childEducation" className="text-sm text-muted-foreground">Child Education Allowance</Label>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent>Education expenses for dependent children</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="childEducation"
                      type="number"
                      value={childEducation || ''}
                      onChange={(e) => setChildEducation(parseFloat(e.target.value) || 0)}
                      placeholder="Enter child education expenses"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="disability" className="text-sm text-muted-foreground">Disability Allowance</Label>
                      <Tooltip>
                        <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                        <TooltipContent>Allowance for disability-related expenses</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="disability"
                      type="number"
                      value={disability || ''}
                      onChange={(e) => setDisability(parseFloat(e.target.value) || 0)}
                      placeholder="Enter disability allowance"
                    />
                  </div>
                </TooltipProvider>
              </div>

              <Button onClick={handleIndividualCalculate} className="w-full">
                Calculate Tax
              </Button>

              {individualResult && (
                <div className="space-y-4 pt-4">
                  <Separator />
                  <Badge variant="secondary" className="mb-2">2026 Tax Calculation</Badge>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taxable Income:</span>
                      <span className="text-sm font-semibold">{formatNaira(individualResult.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Deductions:</span>
                      <span className="text-sm text-green-600">-{formatNaira(individualResult.totalDeductions)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Annual Tax:</span>
                      <Badge variant="destructive" className="text-base">{formatNaira(individualResult.taxPayable)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Monthly Tax:</span>
                      <Badge variant="secondary" className="text-base">{formatNaira(individualResult.monthlyTax)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Effective Tax Rate:</span>
                      <span className="text-sm">{individualResult.effectiveRate}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="revenue">Annual Revenue (₦)</Label>
                <Input
                  id="revenue"
                  type="number"
                  value={revenue || ''}
                  onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                  placeholder="Enter annual revenue"
                />
              </div>

              <div>
                <Label htmlFor="expenses">Annual Expenses (₦)</Label>
                <Input
                  id="expenses"
                  type="number"
                  value={expenses || ''}
                  onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                  placeholder="Enter annual expenses"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smallCompany"
                  checked={isSmallCompany}
                  onChange={(e) => setIsSmallCompany(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="smallCompany" className="text-sm">
                  Small Company (Turnover &lt; ₦25M) - 20% rate instead of 30%
                </Label>
              </div>

              <Button onClick={handleBusinessCalculate} className="w-full">
                <Building2 className="mr-2 h-4 w-4" />
                Calculate Corporate Tax
              </Button>

              {businessResult && (
                <div className="space-y-4 pt-4">
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Revenue:</span>
                      <span className="text-sm">{formatNaira(businessResult.revenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Expenses:</span>
                      <span className="text-sm text-destructive">-{formatNaira(businessResult.expenses)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taxable Profit:</span>
                      <span className="text-sm font-semibold">{formatNaira(businessResult.profit)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tax Rate:</span>
                      <Badge variant="secondary">{businessResult.taxRate}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Corporate Tax:</span>
                      <Badge variant="destructive" className="text-base">{formatNaira(businessResult.corporateTax)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Net Profit:</span>
                      <Badge variant="default" className="text-base">{formatNaira(businessResult.netProfit)}</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
