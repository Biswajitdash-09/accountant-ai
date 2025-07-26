
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { formatDistanceToNow } from "date-fns";
import { Monitor, Smartphone, Tablet, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const SessionManagement = () => {
  const { sessions, isLoading, revokeSession, revokeAllSessions } = useSessionManagement();

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-4 w-4" />;
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return 'Unknown Device';
    
    if (userAgent.includes('Chrome')) return 'Chrome Browser';
    if (userAgent.includes('Firefox')) return 'Firefox Browser';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari Browser';
    if (userAgent.includes('Edge')) return 'Edge Browser';
    
    return 'Web Browser';
  };

  const isCurrentSession = (sessionToken: string) => {
    // This is a simplified check - in a real app you'd compare with actual current session
    return sessions.findIndex(s => s.session_token === sessionToken) === 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions across devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>
          Manage your active login sessions across devices. Revoke sessions you don't recognize.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.user_agent)}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getDeviceInfo(session.user_agent)}
                        </span>
                        {isCurrentSession(session.session_token) && (
                          <Badge variant="secondary">Current Session</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {session.ip_address && (
                          <p>IP Address: {session.ip_address}</p>
                        )}
                        <p>
                          Last active: {formatDistanceToNow(new Date(session.last_active), { addSuffix: true })}
                        </p>
                        <p>
                          Created: {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {!isCurrentSession(session.session_token) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke this session? The user will be logged out from this device.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => revokeSession.mutate(session.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Revoke Session
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>

            {sessions.length > 1 && (
              <div className="pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Revoke All Other Sessions
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will log you out from all devices except the current one. You'll need to sign in again on other devices.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => revokeAllSessions.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Revoke All Sessions
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionManagement;
