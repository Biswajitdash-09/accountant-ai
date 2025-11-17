import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PredictiveInsights } from "@/components/analytics/PredictiveInsights";
import AnomalyDetector from "@/components/ai/AnomalyDetector";
import { TrendingUp, Shield, BarChart3 } from "lucide-react";

const AdvancedAnalytics = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          AI-powered insights, predictions, and anomaly detection for your finances
        </p>
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <PredictiveInsights />
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <AnomalyDetector />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Coming soon: Advanced trend analysis and pattern recognition</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
