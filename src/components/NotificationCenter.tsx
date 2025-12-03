
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationService } from "@/hooks/useNotificationService";
import { format } from "date-fns";

export const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { createNotification } = useNotificationService();

  // Set up real-time notification updates
  useEffect(() => {
    // This effect ensures the component re-renders when notifications change
  }, [notifications]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'default';
      case 'deadline': return 'destructive';
      case 'financial': return 'secondary';
      case 'system': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Stay updated with your important notifications
            </CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllAsRead.mutate()}
              className="w-full sm:w-auto min-h-[44px]"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`mobile-notification border rounded-lg transition-colors ${
                !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-background'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-base mb-2 break-words">{notification.title}</h4>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge variant={getTypeColor(notification.type)} className="text-xs">
                      {notification.type}
                    </Badge>
                    <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                      {notification.priority}
                    </Badge>
                    {!notification.is_read && (
                      <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 break-words">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), 'MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead.mutate(notification.id)}
                      className="min-h-[44px] min-w-[44px]"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification.mutate(notification.id)}
                    className="min-h-[44px] min-w-[44px]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No notifications yet. You're all caught up!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
