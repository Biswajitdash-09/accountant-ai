
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Brain, TrendingUp, Target, ArrowLeft, PieChart, TrendingDown, Shield } from "lucide-react";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import { PredictiveInsights } from "@/components/analytics/PredictiveInsights";
import { AllSourcesOverview } from "@/components/analytics/AllSourcesOverview";
import { SourceComparison } from "@/components/analytics/SourceComparison";
import { InvestmentPerformanceChart } from "@/components/analytics/InvestmentPerformanceChart";
import { TaxImpactAnalyzer } from "@/components/analytics/TaxImpactAnalyzer";
import AnomalyDetector from "@/components/ai/AnomalyDetector";


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

        

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mobile-tabs-scroll">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-7 gap-1 p-1">
              <TabsTrigger value="overview" className="gap-2 min-h-[44px] whitespace-nowrap">
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="gap-2 min-h-[44px] whitespace-nowrap">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Compare</span>
              </TabsTrigger>
              <TabsTrigger value="investments" className="gap-2 min-h-[44px] whitespace-nowrap">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Investments</span>
              </TabsTrigger>
              <TabsTrigger value="tax" className="gap-2 min-h-[44px] whitespace-nowrap">
                <TrendingDown className="h-4 w-4" />
                <span className="hidden sm:inline">Tax</span>
              </TabsTrigger>
              <TabsTrigger value="predictions" className="gap-2 min-h-[44px] whitespace-nowrap">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Predictions</span>
              </TabsTrigger>
              <TabsTrigger value="anomalies" className="gap-2 min-h-[44px] whitespace-nowrap">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Anomalies</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2 min-h-[44px] whitespace-nowrap">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>
          </div>

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

          <TabsContent value="predictions" className="space-y-6">
            <PredictiveInsights />
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-6">
            <AnomalyDetector />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
