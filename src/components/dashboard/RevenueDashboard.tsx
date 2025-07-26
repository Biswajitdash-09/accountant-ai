
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useRevenueStreams } from "@/hooks/useRevenueStreams";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import RevenueStreamForm from "../RevenueStreamForm";

const RevenueDashboard = () => {
  const { revenueStreams, isLoading, error } = useRevenueStreams();
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>Error loading revenue streams</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalProjectedRevenue = revenueStreams.reduce((sum, stream) => sum + (stream.target_amount || 0), 0);
  const totalActualRevenue = revenueStreams.reduce((sum, stream) => sum + stream.actual_amount, 0);
  const revenueDifference = totalActualRevenue - totalProjectedRevenue;
  const revenueProgress = totalProjectedRevenue > 0 ? (totalActualRevenue / totalProjectedRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Revenue Dashboard</h2>
          <p className="text-muted-foreground">Track your revenue streams and performance</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Revenue Stream
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Projected Revenue"
              value={formatCurrency(totalProjectedRevenue, undefined, undefined, { showSymbol: true, decimals: 2 })}
              icon={DollarSign}
              trend={totalProjectedRevenue > 0 ? "up" : "neutral"}
            />
            <MetricCard
              title="Actual Revenue"
              value={formatCurrency(totalActualRevenue, undefined, undefined, { showSymbol: true, decimals: 2 })}
              icon={TrendingUp}
              trend={totalActualRevenue > 0 ? "up" : "neutral"}
            />
            <MetricCard
              title="Revenue Difference"
              value={formatCurrency(revenueDifference, undefined, undefined, { showSymbol: true, decimals: 2 })}
              icon={revenueDifference > 0 ? TrendingUp : TrendingDown}
              trend={revenueDifference > 0 ? "up" : revenueDifference < 0 ? "down" : "neutral"}
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
              <div className="space-y-2">
                <Progress value={Math.min(revenueProgress, 100)} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Actual: {formatCurrency(totalActualRevenue, undefined, undefined, { showSymbol: true, decimals: 0 })}</span>
                  <span>Target: {formatCurrency(totalProjectedRevenue, undefined, undefined, { showSymbol: true, decimals: 0 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="space-y-4">
          {revenueStreams.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No revenue streams yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first revenue stream to start tracking your income sources
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Revenue Stream
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
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {revenueStreams.map((stream) => (
                <Card key={stream.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{stream.stream_name}</CardTitle>
                        <CardDescription className="mt-1">
                          {stream.description}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {stream.stream_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Projected Revenue</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(stream.target_amount || 0, stream.currency_id, undefined, { showSymbol: true, decimals: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Actual Revenue</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(stream.actual_amount, stream.currency_id, undefined, { showSymbol: true, decimals: 2 })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>
                          {stream.target_amount ? 
                            `${((stream.actual_amount / stream.target_amount) * 100).toFixed(1)}%` : 
                            'No target set'
                          }
                        </span>
                      </div>
                      <Progress 
                        value={
                          stream.target_amount 
                            ? Math.min((stream.actual_amount / stream.target_amount) * 100, 100)
                            : 0
                        } 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Badge variant={stream.is_active ? "default" : "secondary"}>
                        {stream.is_active ? "Active" : "Inactive"}
                      </Badge>
                      
                      {stream.period_start && stream.period_end && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(stream.period_start).toLocaleDateString()} - {new Date(stream.period_end).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RevenueDashboard;
