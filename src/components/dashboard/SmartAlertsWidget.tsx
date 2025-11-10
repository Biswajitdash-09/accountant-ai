import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSmartAlerts } from "@/hooks/useSmartAlerts";
import { AlertTriangle, Bell, TrendingUp, Calendar, Target, Lightbulb, ExternalLink, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const SmartAlertsWidget = () => {
  const { alerts, loading } = useSmartAlerts();
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>(() => {
    const stored = localStorage.getItem('dismissedAlerts');
    return stored ? JSON.parse(stored) : [];
  });

  const dismissAlert = (id: string) => {
    const updated = [...dismissedAlerts, id];
    setDismissedAlerts(updated);
    localStorage.setItem('dismissedAlerts', JSON.stringify(updated));
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'budget_warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'tax_deadline':
        return <Calendar className="h-4 w-4" />;
      case 'unusual_spending':
        return <AlertTriangle className="h-4 w-4" />;
      case 'bill_reminder':
        return <Bell className="h-4 w-4" />;
      case 'goal_milestone':
        return <Target className="h-4 w-4" />;
      case 'savings_opportunity':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Smart Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Smart Alerts
          </CardTitle>
          {visibleAlerts.length > 0 && (
            <Badge variant="secondary">{visibleAlerts.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p className="font-medium">All clear!</p>
            <p className="text-sm mt-1">No alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors relative group"
              >
                <Badge variant={getSeverityVariant(alert.severity)} className="mt-0.5">
                  {getAlertIcon(alert.type)}
                </Badge>
                <div className="flex-1 min-w-0 pr-8">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                  {alert.actionUrl && (
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 mt-1"
                      onClick={() => navigate(alert.actionUrl!)}
                    >
                      Take Action <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {visibleAlerts.length > 5 && (
              <Button
                variant="outline"
                className="w-full min-h-[44px] touch-manipulation"
                onClick={() => navigate('/notifications')}
              >
                View All {visibleAlerts.length} Alerts
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartAlertsWidget;
