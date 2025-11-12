
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Brain, TrendingUp, Target, ArrowLeft, PieChart, TrendingDown } from "lucide-react";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import { PredictiveInsights } from "@/components/analytics/PredictiveInsights";
import { AllSourcesOverview } from "@/components/analytics/AllSourcesOverview";
import { SourceComparison } from "@/components/analytics/SourceComparison";
import { InvestmentPerformanceChart } from "@/components/analytics/InvestmentPerformanceChart";
import { TaxImpactAnalyzer } from "@/components/analytics/TaxImpactAnalyzer";
import DemoAccountBadge from "@/components/DemoAccountBadge";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics & Insights
            </h1>
            <p className="text-muted-foreground">
              Deep dive into your financial data with advanced analytics and AI-powered insights.
            </p>
          </div>
        </div>

        <DemoAccountBadge />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="overview" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">All Sources</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Comparison</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Investments</span>
            </TabsTrigger>
            <TabsTrigger value="tax" className="gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Tax Impact</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AllSourcesOverview />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <SourceComparison />
          </TabsContent>

          <TabsContent value="investments" className="space-y-6">
            <InvestmentPerformanceChart />
          </TabsContent>

          <TabsContent value="tax" className="space-y-6">
            <TaxImpactAnalyzer />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <PredictiveInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
