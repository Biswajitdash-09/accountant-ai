import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, TrendingDown, TrendingUp } from "lucide-react";
import { calculateUSATax, calculateUKTax, calculateIndiaTax, calculateNigeriaTax } from "@/lib/taxCalculations";

export const TaxComparison = () => {
  const [income, setIncome] = useState<string>('75000');

  const compareAllCountries = () => {
    const incomeNum = parseFloat(income) || 0;
    
    const results = [
      {
        country: 'USA',
        flag: '🇺🇸',
        currency: '$',
        ...calculateUSATax(incomeNum, 'single')
      },
      {
        country: 'UK',
        flag: '🇬🇧',
        currency: '£',
        ...calculateUKTax(incomeNum)
      },
      {
        country: 'India',
        flag: '🇮🇳',
        currency: '₹',
        ...calculateIndiaTax(incomeNum)
      },
      {
        country: 'Nigeria',
        flag: '🇳🇬',
        currency: '₦',
        ...calculateNigeriaTax(incomeNum)
      }
    ];

    // Sort by lowest tax
    return results.sort((a, b) => a.totalTax - b.totalTax);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const results = compareAllCountries();
  const lowestTax = results[0];
  const highestTax = results[results.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cross-Country Tax Comparison
          </CardTitle>
          <CardDescription>
            Compare your tax liability across different regions instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="max-w-md">
              <Label htmlFor="comparison-income">Annual Income (use base currency value)</Label>
              <Input
                id="comparison-income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="Enter your annual income"
                className="mt-1 text-lg h-12"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Enter amount in USD equivalent for fair comparison
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map((result, index) => {
          const isLowest = result.country === lowestTax.country;
          const isHighest = result.country === highestTax.country;
          
          return (
            <Card 
              key={result.country} 
              className={`relative ${isLowest ? 'border-2 border-green-500' : ''} ${isHighest ? 'border-2 border-red-500' : ''}`}
            >
              {isLowest && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Lowest Tax
                </Badge>
              )}
              {isHighest && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Highest Tax
                </Badge>
              )}
              
              <CardHeader className="text-center pb-3">
                <div className="text-4xl mb-2">{result.flag}</div>
                <CardTitle className="text-lg">{result.country}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(result.totalTax, result.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Tax</div>
                </div>
                
                <div className="space-y-2 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Effective Rate</span>
                    <span className="font-semibold">{result.effectiveRate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Marginal Rate</span>
                    <span className="font-semibold">{result.marginalRate.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Take Home</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(parseFloat(income) - result.totalTax, result.currency)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Savings Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Savings Analysis</CardTitle>
          <CardDescription>
            How much you could save by choosing a different region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Best Option</div>
              <div className="text-xl font-bold text-green-600">
                {lowestTax.flag} {lowestTax.country}
              </div>
              <div className="text-sm mt-2">
                Pay only {formatCurrency(lowestTax.totalTax, lowestTax.currency)} in tax
              </div>
            </div>
            
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Potential Savings</div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(highestTax.totalTax - lowestTax.totalTax, highestTax.currency)}
              </div>
              <div className="text-sm mt-2">
                Save by moving from {highestTax.country} to {lowestTax.country}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
