
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useRevenueStreams } from "@/hooks/useRevenueStreams";

const RevenueDashboard = () => {
  const { revenueStreams, isLoading, error } = useRevenueStreams();

  if (isLoading) {
    return <div>Loading revenue streams...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const totalProjectedRevenue = revenueStreams.reduce((sum, stream) => sum + (stream.target_amount || 0), 0);
  const totalActualRevenue = revenueStreams.reduce((sum, stream) => sum + stream.actual_amount, 0);
  const revenueDifference = totalActualRevenue - totalProjectedRevenue;
  const revenueProgress = (totalActualRevenue / totalProjectedRevenue) * 100;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Projected Revenue"
            value={`$${totalProjectedRevenue.toLocaleString()}`}
            icon={DollarSign}
          />
          <MetricCard
            title="Actual Revenue"
            value={`$${totalActualRevenue.toLocaleString()}`}
            icon={TrendingUp}
          />
          <MetricCard
            title="Revenue Difference"
            value={`$${revenueDifference.toLocaleString()}`}
            icon={revenueDifference > 0 ? TrendingUp : TrendingDown}
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Progress</CardTitle>
            <CardDescription>
              {revenueProgress.toFixed(1)}% of projected revenue achieved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={revenueProgress} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="details" className="space-y-4">
        {revenueStreams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <CardTitle>{stream.stream_name}</CardTitle>
              <CardDescription>{stream.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Projected Revenue:</p>
                  <p className="text-lg">${(stream.target_amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Actual Revenue:</p>
                  <p className="text-lg">${stream.actual_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Progress:</p>
                  <Progress value={((stream.actual_amount / (stream.target_amount || 1)) * 100)} />
                </div>
                <div>
                  <p className="text-sm font-medium">Status:</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
};

export default RevenueDashboard;
