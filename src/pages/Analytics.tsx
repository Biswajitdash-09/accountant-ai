
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Brain, TrendingUp, Target, ArrowLeft } from "lucide-react";
import { AdvancedAnalytics } from "@/components/analytics/AdvancedAnalytics";
import { PredictiveInsights } from "@/components/analytics/PredictiveInsights";
import DemoAccountBadge from "@/components/DemoAccountBadge";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("advanced");
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="advanced" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Advanced Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

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
