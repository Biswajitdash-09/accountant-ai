import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, TrendingUp } from "lucide-react";
import { calculateCorporateTax } from "@/lib/taxCalculations";

export const CorporateTaxCalculator = ({ country }: { country: 'USA' | 'UK' | 'India' | 'Nigeria' }) => {
  const [profit, setProfit] = useState<string>('500000');

  const result = calculateCorporateTax(parseFloat(profit) || 0, country);

  const formatCurrency = (value: number) => {
    const symbols: Record<typeof country, string> = {
      'USA': '$',
      'UK': '£',
      'India': '₹',
      'Nigeria': '₦'
    };
    return `${symbols[country]}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTaxInfo = () => {
    const info: Record<typeof country, { rate: string; details: string[] }> = {
      'USA': {
        rate: '21%',
        details: [
          'Flat 21% federal corporate income tax',
          'State corporate taxes vary (0% - 11.5%)',
          'Combined average rate: ~25.8%',
          'C-Corporations only (S-Corps pass through)'
        ]
      },
      'UK': {
        rate: '19% / 25%',
        details: [
          'Small Profits Rate: 19% (profits ≤ £50,000)',
          'Main Rate: 25% (profits > £250,000)',
          'Marginal relief: £50,000 - £250,000',
          'Lower rates for startups and innovation'
        ]
      },
      'India': {
        rate: '25% / 22%',
        details: [
          'Domestic companies: 25% (30% before 2019)',
          'With conditions: 22% (no exemptions/deductions)',
          'Manufacturing companies: 15% (new setup)',
          'Plus 4% Health & Education Cess on tax'
        ]
      },
      'Nigeria': {
        rate: '25%',
        details: [
          'Companies Income Tax: 25%',
          'Reduced rate for small companies',
          'Pioneer status available (tax holiday)',
          'Additional petroleum profits tax for oil/gas'
        ]
      }
    };
    return info[country];
  };

  const taxInfo = getTaxInfo();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Corporate Tax Calculator - {country}
          </CardTitle>
          <CardDescription>
            Calculate corporate income tax for businesses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="profit">Annual Taxable Profit</Label>
            <Input
              id="profit"
              type="number"
              value={profit}
              onChange={(e) => setProfit(e.target.value)}
              placeholder="Enter annual profit"
              className="mt-1 text-lg h-12"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Corporate Tax Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {result.rate.toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tax Payable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(result.tax)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Net Profit (After Tax)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(result.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Tax Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Gross Profit</span>
              <span className="text-xl font-semibold">{formatCurrency(parseFloat(profit) || 0)}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <span className="text-muted-foreground">Corporate Tax ({result.rate.toFixed(0)}%)</span>
              <span className="text-xl font-semibold text-red-600">
                -{formatCurrency(result.tax)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-500">
              <span className="font-semibold">Net Profit</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(result.netProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{country} Corporate Tax Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-semibold mb-2">Standard Rate: {taxInfo.rate}</p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              {taxInfo.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
