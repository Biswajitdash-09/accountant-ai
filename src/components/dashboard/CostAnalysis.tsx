import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertCircle, Plus } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useCostCenters } from "@/hooks/useCostCenters";

interface CostData {
  id: string;
  name: string;
  budgetedCost: number;
  actualCost: number;
}

const CostAnalysis = () => {
  const { costCenters } = useCostCenters();

  const totalBudgetedCost = costCenters.reduce((sum, costCenter) => sum + costCenter.budgeted_cost, 0);
  const totalActualCost = costCenters.reduce((sum, costCenter) => sum + costCenter.actual_cost, 0);
  const costVariance = totalActualCost - totalBudgetedCost;
  const costVariancePercentage = totalBudgetedCost !== 0 ? (costVariance / totalBudgetedCost) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Cost Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <MetricCard
            title="Total Budgeted Cost"
            value={`$${totalBudgetedCost.toLocaleString()}`}
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Actual Cost"
            value={`$${totalActualCost.toLocaleString()}`}
            icon={TrendingDown}
          />
          <MetricCard
            title="Cost Variance"
            value={`$${costVariance.toLocaleString()}`}
            icon={AlertCircle}
            trend={{
              value: Math.abs(costVariancePercentage),
              isPositive: costVariance <= 0,
              period: "vs Budget",
            }}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">Cost Centers</h3>
          <div className="space-y-3">
            {costCenters.map((costCenter) => (
              <div key={costCenter.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{costCenter.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Budget: ${costCenter.budgeted_cost.toLocaleString()} | Actual: ${costCenter.actual_cost.toLocaleString()}
                  </p>
                  <Progress
                    value={(costCenter.actual_cost / costCenter.budgeted_cost) * 100}
                  />
                </div>
                <Badge variant="secondary">
                  {(
                    ((costCenter.actual_cost - costCenter.budgeted_cost) /
                      costCenter.budgeted_cost) *
                    100
                  ).toFixed(1)}
                  %
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostAnalysis;
