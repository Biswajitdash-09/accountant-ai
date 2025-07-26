
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRevenueStreams } from "@/hooks/useRevenueStreams";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { MetricCard } from "./MetricCard";
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import RevenueStreamForm from "../RevenueStreamForm";

const RevenueDashboard = () => {
  const { revenueStreams, isLoading } = useRevenueStreams();
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalActual = revenueStreams.reduce((sum, stream) => sum + (stream.actual_amount || 0), 0);
  const totalTarget = revenueStreams.reduce((sum, stream) => sum + (stream.target_amount || 0), 0);
  const activeStreams = revenueStreams.filter(stream => stream.is_active).length;
  const achievementRate = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

  const streamsByType = revenueStreams.reduce((acc, stream) => {
    const type = stream.stream_type;
    if (!acc[type]) {
      acc[type] = { streams: [], total: 0, target: 0 };
    }
    acc[type].streams.push(stream);
    acc[type].total += stream.actual_amount || 0;
    acc[type].target += stream.target_amount || 0;
    return acc;
  }, {} as Record<string, { streams: typeof revenueStreams; total: number; target: number }>);

  // Calculate proper trend data for metrics
  const totalActualTrend = {
    value: achievementRate - 100,
    isPositive: achievementRate >= 100,
    period: "vs target"
  };

  const totalTargetFormatted = formatCurrency(totalTarget, undefined, undefined, { showSymbol: true, decimals: 0 });
  
  const activeStreamsTrend = {
    value: 0,
    isPositive: true,
    period: "active streams"
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={totalActual}
          icon={DollarSign}
          currency={true}
          trend={totalActualTrend}
        />
        <MetricCard
          title="Target Revenue"
          value={totalTarget}
          icon={Target}
          currency={true}
        />
        <MetricCard
          title="Active Streams"
          value={activeStreams}
          icon={Activity}
          trend={activeStreamsTrend}
        />
        <MetricCard
          title="Achievement Rate"
          value={`${achievementRate.toFixed(1)}%`}
          icon={achievementRate >= 100 ? TrendingUp : TrendingDown}
        />
      </div>

      {/* Revenue Streams by Type */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Revenue Streams</CardTitle>
              <CardDescription>Performance by stream type</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Stream
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Revenue Stream</DialogTitle>
                </DialogHeader>
                <RevenueStreamForm />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {revenueStreams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No revenue streams yet</p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Your First Stream
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Revenue Stream</DialogTitle>
                  </DialogHeader>
                  <RevenueStreamForm />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(streamsByType).map(([type, data]) => (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize flex items-center gap-2">
                      {type.replace(/_/g, ' ')}
                      <Badge variant="secondary">{data.streams.length}</Badge>
                    </h4>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(data.total, undefined, undefined, { showSymbol: true, decimals: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        of {formatCurrency(data.target, undefined, undefined, { showSymbol: true, decimals: 2 })} target
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {data.streams.map((stream) => (
                      <div key={stream.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium">{stream.stream_name}</div>
                          <div className="text-sm text-muted-foreground">{stream.description}</div>
                          {!stream.is_active && (
                            <Badge variant="outline" className="mt-1">Inactive</Badge>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(
                              stream.actual_amount || 0, 
                              stream.currency_id,
                              undefined,
                              { showSymbol: true, decimals: 2 }
                            )}
                          </div>
                          {stream.target_amount && (
                            <div className="text-xs text-muted-foreground">
                              Target: {formatCurrency(
                                stream.target_amount, 
                                stream.currency_id,
                                undefined,
                                { showSymbol: true, decimals: 0 }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueDashboard;
