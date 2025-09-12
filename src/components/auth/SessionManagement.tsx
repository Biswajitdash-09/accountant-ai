import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { ChatHistoryExport } from '@/components/ChatHistoryExport';
import BusinessDataExport from '@/components/BusinessDataExport';
import { Smartphone, Monitor, Tablet } from 'lucide-react';
import { format } from 'date-fns';

const SessionManagement = () => {
  const { toast } = useToast();
  const { sessions, revokeSession, revokeAllSessions } = useSessionManagement();
  const [keepLoggedIn, setKeepLoggedIn] = useState(() => 
    localStorage.getItem('keepLoggedIn') === 'true'
  );

  const handleKeepLoggedInToggle = (checked: boolean) => {
    setKeepLoggedIn(checked);
    localStorage.setItem('keepLoggedIn', checked.toString());
    
    if (!checked) {
      // Also clear remembered email when disabling keep logged in
      localStorage.removeItem('rememberedEmail');
    }
    
    toast({
      title: checked ? "Keep me logged in enabled" : "Keep me logged in disabled",
      description: checked 
        ? "Your email will be remembered for future logins" 
        : "Your login information will not be saved",
    });
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="h-4 w-4 text-muted-foreground" />;
    if (userAgent.includes('Tablet')) return <Tablet className="h-4 w-4 text-muted-foreground" />;
    return <Monitor className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Keep Me Logged In */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Login Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="keep-logged-in" className="text-sm font-medium">
                Keep me logged in
              </Label>
              <p className="text-xs text-muted-foreground">
                Remember your email for faster login
              </p>
            </div>
            <Switch
              id="keep-logged-in"
              checked={keepLoggedIn}
              onCheckedChange={handleKeepLoggedInToggle}
            />
          </div>
          {keepLoggedIn && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                ✓ Your email will be remembered (password remains secure)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat History & Export */}
      <ChatHistoryExport />

      {/* Business Data Export */}
      <BusinessDataExport />

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">No active sessions found.</p>
              <p className="text-xs text-muted-foreground">
                Sessions will appear here when you log in from different devices.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {getDeviceIcon(session.user_agent || '')}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {session.user_agent?.includes('Mobile') ? 'Mobile Device' : 
                             session.user_agent?.includes('Tablet') ? 'Tablet' : 'Desktop'}
                          </p>
                          {session.id.includes('current-session') && (
                            <Badge variant="secondary" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last active: {format(new Date(session.last_active), 'MMM d, yyyy HH:mm')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          IP: {session.ip_address || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    {!session.id.includes('current-session') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession.mutate(session.id)}
                        disabled={revokeSession.isPending}
                        className="ml-2 shrink-0"
                      >
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {sessions.length > 1 ? `${sessions.length} active sessions` : '1 active session'}
                </p>
                {sessions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeAllSessions.mutate()}
                    disabled={revokeAllSessions.isPending}
                    className="self-start sm:self-auto"
                  >
                    Terminate All Others
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;
