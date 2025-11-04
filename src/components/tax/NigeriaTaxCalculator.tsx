import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Building2 } from "lucide-react";
import { calculateNigeriaTax, calculateNigeriaBusinessTax, type NigeriaDeductions } from "@/lib/nigeriaTaxCalculations";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const NigeriaTaxCalculator = () => {
  // Individual Tax State
  const [grossIncome, setGrossIncome] = useState<number>(0);
  const [deductions, setDeductions] = useState<NigeriaDeductions>({
    rentAllowance: 0,
    pensionContribution: 0,
    nhfContribution: 0,
    lifeInsurance: 0,
    medicalExpenses: 0,
  });
  const [individualResult, setIndividualResult] = useState<ReturnType<typeof calculateNigeriaTax> | null>(null);

  // Business Tax State
  const [revenue, setRevenue] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);
  const [isSmallCompany, setIsSmallCompany] = useState<boolean>(false);
  const [businessResult, setBusinessResult] = useState<ReturnType<typeof calculateNigeriaBusinessTax> | null>(null);

  const handleIndividualCalculate = () => {
    const result = calculateNigeriaTax(grossIncome, deductions);
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
                <Label className="text-base font-semibold">Allowable Deductions</Label>
                
                <div>
                  <Label htmlFor="rentAllowance" className="text-sm text-muted-foreground">Rent Allowance/Relief</Label>
                  <Input
                    id="rentAllowance"
                    type="number"
                    value={deductions.rentAllowance || ''}
                    onChange={(e) => setDeductions({...deductions, rentAllowance: parseFloat(e.target.value) || 0})}
                    placeholder="Enter rent allowance"
                  />
                </div>

                <div>
                  <Label htmlFor="pension" className="text-sm text-muted-foreground">Pension Contribution (8% minimum)</Label>
                  <Input
                    id="pension"
                    type="number"
                    value={deductions.pensionContribution || ''}
                    onChange={(e) => setDeductions({...deductions, pensionContribution: parseFloat(e.target.value) || 0})}
                    placeholder="Enter pension contribution"
                  />
                </div>

                <div>
                  <Label htmlFor="nhf" className="text-sm text-muted-foreground">National Housing Fund (NHF) - 2.5%</Label>
                  <Input
                    id="nhf"
                    type="number"
                    value={deductions.nhfContribution || ''}
                    onChange={(e) => setDeductions({...deductions, nhfContribution: parseFloat(e.target.value) || 0})}
                    placeholder="Enter NHF contribution"
                  />
                </div>

                <div>
                  <Label htmlFor="insurance" className="text-sm text-muted-foreground">Life Insurance Premium</Label>
                  <Input
                    id="insurance"
                    type="number"
                    value={deductions.lifeInsurance || ''}
                    onChange={(e) => setDeductions({...deductions, lifeInsurance: parseFloat(e.target.value) || 0})}
                    placeholder="Enter insurance premium"
                  />
                </div>

                <div>
                  <Label htmlFor="medical" className="text-sm text-muted-foreground">Medical/Health Insurance</Label>
                  <Input
                    id="medical"
                    type="number"
                    value={deductions.medicalExpenses || ''}
                    onChange={(e) => setDeductions({...deductions, medicalExpenses: parseFloat(e.target.value) || 0})}
                    placeholder="Enter medical expenses"
                  />
                </div>
              </div>

              <Button onClick={handleIndividualCalculate} className="w-full">
                Calculate Tax
              </Button>

              {individualResult && (
                <div className="space-y-4 pt-4">
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Gross Income:</span>
                      <span className="text-sm">{formatNaira(individualResult.grossIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Deductions:</span>
                      <span className="text-sm text-destructive">-{formatNaira(individualResult.totalDeductions)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Taxable Income:</span>
                      <span className="text-sm font-semibold">{formatNaira(individualResult.taxableIncome)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Tax Breakdown by Bracket:</Label>
                      {individualResult.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm pl-4">
                          <span className="text-muted-foreground">
                            {item.bracket} @ {item.rate}%:
                          </span>
                          <span>{formatNaira(item.tax)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Total Tax:</span>
                      <Badge variant="destructive" className="text-base">{formatNaira(individualResult.totalTax)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Net Income:</span>
                      <Badge variant="default" className="text-base">{formatNaira(individualResult.netIncome)}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Effective Tax Rate:</span>
                      <span className="text-sm">{individualResult.effectiveRate.toFixed(2)}%</span>
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
