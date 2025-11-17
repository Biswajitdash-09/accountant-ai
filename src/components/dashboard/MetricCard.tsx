
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { MultiCurrencyTooltip } from "@/components/currency/MultiCurrencyTooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  currency?: boolean;
  currencyId?: string;
  showCurrencyConversion?: boolean;
}

export const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  currency = false, 
  currencyId,
  showCurrencyConversion = false,
}: MetricCardProps) => {
  const { formatCurrency } = useCurrencyFormatter();

  const displayValue = currency && typeof value === 'number' 
    ? formatCurrency(value, currencyId, undefined, { showSymbol: true, showCode: false })
    : value;

  const numericValue = typeof value === 'number' ? value : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold">{displayValue}</div>
          {showCurrencyConversion && numericValue !== undefined && (
            <MultiCurrencyTooltip amount={numericValue} />
          )}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>{" "}
            {trend.period}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
