
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, RefreshCw, Plus, Trash2, Calculator, DollarSign } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { BackButton } from "@/components/ui/back-button";
import { CryptoPortfolio } from "@/components/CryptoPortfolio";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
}

const Markets = () => {
  const { formatCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [conversionLoading, setConversionLoading] = useState(false);
  const [convertAmount, setConvertAmount] = useState<string>("1000");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("NGN"); // Default to NGN for regional bias

  const handleCurrencyConversion = async () => {
    if (!convertAmount || parseFloat(convertAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert",
        variant: "destructive",
      });
      return;
    }

    setConversionLoading(true);
    try {
      // Simulate API call - in production, use real exchange rate API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Enhanced mock rates including NGN and ZAR
      const mockRates: Record<string, Record<string, number>> = {
        USD: { INR: 83.5, EUR: 0.92, GBP: 0.79, NGN: 1650.00, ZAR: 18.50 },
        EUR: { INR: 90.8, USD: 1.09, GBP: 0.86, NGN: 1800.00, ZAR: 20.20 },
        GBP: { INR: 105.2, USD: 1.27, EUR: 1.16, NGN: 2100.00, ZAR: 23.50 },
        INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, NGN: 19.8, ZAR: 0.22 },
        NGN: { USD: 0.00061, EUR: 0.00056, GBP: 0.00048, INR: 0.051, ZAR: 0.011 },
        ZAR: { USD: 0.054, EUR: 0.049, GBP: 0.043, INR: 4.5, NGN: 89.2 }
      };

      const rate = mockRates[fromCurrency]?.[toCurrency] || 1;
      const amount = parseFloat(convertAmount);
      const result = amount * rate;

      const conversionData: ConversionResult = {
        from: fromCurrency,
        to: toCurrency,
        amount: amount,
        result: result,
        rate: rate,
      };

      setConversionResult(conversionData);
      
      toast({
        title: "Conversion Complete",
        description: `${amount} ${fromCurrency} = ${result.toLocaleString()} ${toCurrency}`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Unable to fetch exchange rates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConversionLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center gap-4">
          <BackButton to="/dashboard" className="shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">Markets & Portfolio</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track your crypto portfolio, convert currencies in real-time, and monitor market trends.
            </p>
          </div>
        </div>
      </div>

      {/* Currency Converter */}
      <Card className="card-hover transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calculator className="h-5 w-5" />
            Currency Converter
          </CardTitle>
          <CardDescription className="text-sm">
            Convert between different currencies with real-time rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
              <Input 
                id="amount"
                type="number" 
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="Enter amount" 
                className="focus-ring transition-all duration-200"
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">From</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="focus-ring transition-all duration-200 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD" className="cursor-pointer">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR" className="cursor-pointer">EUR - Euro</SelectItem>
                  <SelectItem value="GBP" className="cursor-pointer">GBP - British Pound</SelectItem>
                  <SelectItem value="NGN" className="cursor-pointer">NGN - Nigerian Naira</SelectItem>
                  <SelectItem value="ZAR" className="cursor-pointer">ZAR - South African Rand</SelectItem>
                  <SelectItem value="INR" className="cursor-pointer">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">To</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="focus-ring transition-all duration-200 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN" className="cursor-pointer">NGN - Nigerian Naira</SelectItem>
                  <SelectItem value="ZAR" className="cursor-pointer">ZAR - South African Rand</SelectItem>
                  <SelectItem value="USD" className="cursor-pointer">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR" className="cursor-pointer">EUR - Euro</SelectItem>
                  <SelectItem value="GBP" className="cursor-pointer">GBP - British Pound</SelectItem>
                  <SelectItem value="INR" className="cursor-pointer">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-2">
              <Button 
                onClick={handleCurrencyConversion}
                disabled={conversionLoading}
                className={cn(
                  "w-full button-hover transition-all duration-200 cursor-pointer min-h-[44px]",
                  conversionLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {conversionLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Convert
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {conversionResult && (
            <div className="mt-6 p-4 sm:p-6 bg-muted/30 rounded-lg border border-border/50 animate-scale-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-medium">
                    {conversionResult.amount.toLocaleString()} {conversionResult.from}
                  </Badge>
                  <span className="text-muted-foreground">=</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-bold text-base px-4 py-2">
                    {conversionResult.result.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })} {conversionResult.to}
                  </Badge>
                </div>
              </div>
              <Separator className="my-3" />
              <p className="text-sm text-muted-foreground text-center">
                Exchange Rate: 1 {conversionResult.from} = {conversionResult.rate.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6
                })} {conversionResult.to}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crypto Portfolio Component */}
      <CryptoPortfolio />
    </div>
  );
};

export default Markets;
