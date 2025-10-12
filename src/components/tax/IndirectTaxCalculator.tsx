import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, ShoppingCart } from "lucide-react";
import { calculateIndirectTax } from "@/lib/taxCalculations";

export const IndirectTaxCalculator = ({ country }: { country: 'USA' | 'UK' | 'India' | 'Nigeria' }) => {
  const [amount, setAmount] = useState<string>('1000');
  const [category, setCategory] = useState<string>('standard');

  const result = calculateIndirectTax(parseFloat(amount) || 0, country, category);

  const getCategories = () => {
    if (country === 'India') {
      return [
        { value: 'essential', label: 'Essential Goods (0%)', rate: '0%' },
        { value: 'basic', label: 'Basic Necessities (5%)', rate: '5%' },
        { value: 'standard', label: 'Standard Goods (12%)', rate: '12%' },
        { value: 'luxury', label: 'Luxury Items (18%)', rate: '18%' },
        { value: 'sin', label: 'Sin Goods (28%)', rate: '28%' }
      ];
    }
    return [{ value: 'standard', label: 'Standard Rate', rate: `${result.rate}%` }];
  };

  const getTaxName = () => {
    const names: Record<typeof country, string> = {
      'USA': 'Sales Tax',
      'UK': 'VAT',
      'India': 'GST',
      'Nigeria': 'VAT'
    };
    return names[country];
  };

  const formatCurrency = (value: number) => {
    const symbols: Record<typeof country, string> = {
      'USA': '$',
      'UK': '£',
      'India': '₹',
      'Nigeria': '₦'
    };
    return `${symbols[country]}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {getTaxName()} Calculator - {country}
          </CardTitle>
          <CardDescription>
            Calculate {getTaxName()} on goods and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="net-amount">Net Amount (before tax)</Label>
              <Input
                id="net-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1"
              />
            </div>

            {country === 'India' && (
              <div>
                <Label htmlFor="category">GST Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories().map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="text-muted-foreground">Net Amount</span>
              <span className="text-xl font-semibold">{formatCurrency(result.netAmount)}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <span className="text-muted-foreground">
                {getTaxName()} ({result.rate}%)
              </span>
              <span className="text-xl font-semibold text-orange-600">
                +{formatCurrency(result.taxAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <span className="font-semibold">Total (Gross Amount)</span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(result.grossAmount)}
              </span>
            </div>
          </div>

          {country === 'India' && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-2">GST Breakdown (CGST + SGST):</p>
              <div className="space-y-1 text-muted-foreground">
                <p>• CGST: {formatCurrency(result.taxAmount / 2)} ({(result.rate / 2).toFixed(2)}%)</p>
                <p>• SGST: {formatCurrency(result.taxAmount / 2)} ({(result.rate / 2).toFixed(2)}%)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4 w-4" />
            Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {country === 'UK' && (
              <>
                <p>• Standard Rate: 20% VAT on most goods and services</p>
                <p>• Zero-rated: Food, books, children's clothes, medical supplies</p>
                <p>• Exempt: Education, healthcare, financial services</p>
              </>
            )}
            {country === 'India' && (
              <>
                <p>• 0% GST: Unprocessed food, healthcare, education</p>
                <p>• 5% GST: Essential items, transport, small restaurants</p>
                <p>• 12% GST: Computers, processed food</p>
                <p>• 18% GST: Most goods and services</p>
                <p>• 28% GST: Luxury items, tobacco, automobiles</p>
              </>
            )}
            {country === 'Nigeria' && (
              <>
                <p>• Standard Rate: 7.5% VAT on most goods and services</p>
                <p>• Exempt: Medical services, basic food items, educational materials</p>
                <p>• Zero-rated: Exports, goods for diplomatic missions</p>
              </>
            )}
            {country === 'USA' && (
              <>
                <p>• Sales tax varies by state (0% - 10%)</p>
                <p>• Average combined rate: ~7%</p>
                <p>• Some states have no sales tax</p>
                <p>• Exempt: Groceries (in most states), prescription drugs</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
