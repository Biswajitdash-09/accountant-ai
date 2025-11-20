import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { Calendar, CreditCard, AlertCircle, Pause, Play, X } from "lucide-react";
import { paymentAnimations } from "@/lib/paymentAnimations";

export const SubscriptionDashboard = () => {
  const {
    subscriptions,
    activeSubscription,
    isLoading,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
  } = useSubscription();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active subscription</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-finance-positive text-white";
      case "paused":
        return "bg-finance-warning text-white";
      case "cancelled":
        return "bg-finance-negative text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={paymentAnimations.staggerContainer}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Subscription</CardTitle>
            <Badge className={getStatusColor(activeSubscription.status)}>
              {activeSubscription.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Details */}
          <motion.div variants={paymentAnimations.fadeSlide} className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-lg">{activeSubscription.plan_id}</p>
                <p className="text-sm text-muted-foreground">
                  ${activeSubscription.amount / 100} / {activeSubscription.billing_cycle}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Billing Info */}
          <motion.div variants={paymentAnimations.fadeSlide} className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Next billing date:</span>
              <span className="font-medium">
                {format(new Date(activeSubscription.current_period_end), "MMMM d, yyyy")}
              </span>
            </div>
            {activeSubscription.cancelled_at && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-finance-warning" />
                <span className="text-muted-foreground">Cancels on:</span>
                <span className="font-medium text-finance-warning">
                  {format(new Date(activeSubscription.current_period_end), "MMMM d, yyyy")}
                </span>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={paymentAnimations.fadeSlide}
            className="flex flex-wrap gap-2 pt-4 border-t"
          >
            {activeSubscription.status === "active" && !activeSubscription.cancelled_at && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pauseSubscription.mutate(activeSubscription.id)}
                  disabled={pauseSubscription.isPending}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelSubscription.mutate(activeSubscription.id)}
                  disabled={cancelSubscription.isPending}
                  className="text-finance-negative hover:text-finance-negative"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
            {activeSubscription.status === "paused" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resumeSubscription.mutate(activeSubscription.id)}
                disabled={resumeSubscription.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      {subscriptions && subscriptions.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subscriptions.slice(1).map((sub) => (
                <motion.div
                  key={sub.id}
                  variants={paymentAnimations.fadeSlide}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{sub.plan_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sub.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant="outline">{sub.status}</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
