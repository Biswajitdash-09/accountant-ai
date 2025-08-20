import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { Smartphone, Monitor, Tablet, Download, Mail, History } from 'lucide-react';
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
    toast({
      title: checked ? "Keep me logged in enabled" : "Keep me logged in disabled",
      description: checked 
        ? "You'll stay logged in across browser sessions" 
        : "You'll need to log in each time",
    });
  };

  const exportChatHistory = async (format: 'email' | 'download') => {
    try {
      const chatHistory = localStorage.getItem('chatHistory') || '[]';
      const messages = JSON.parse(chatHistory);
      
      const exportData = {
        exportDate: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages
      };

      if (format === 'email') {
        const subject = `Chat History Export - ${new Date().toLocaleDateString()}`;
        const body = `Your chat history export:\n\n${JSON.stringify(exportData, null, 2)}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      } else {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Chat history exported",
        description: format === 'email' 
          ? "Email client opened with your chat history" 
          : "Chat history downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export chat history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return <Smartphone className="h-4 w-4" />;
    if (userAgent.includes('Tablet')) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
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
            <Label htmlFor="keep-logged-in" className="text-sm font-medium">
              Keep me logged in
            </Label>
            <Switch
              id="keep-logged-in"
              checked={keepLoggedIn}
              onCheckedChange={handleKeepLoggedInToggle}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Stay logged in across browser sessions for convenience
          </p>
        </CardContent>
      </Card>

      {/* Session History & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Chat History & Export
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your chat history for your records
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportChatHistory('download')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportChatHistory('email')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Active Sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            <>
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(session.user_agent || '')}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {session.user_agent?.includes('Mobile') ? 'Mobile Device' : 
                           session.user_agent?.includes('Tablet') ? 'Tablet' : 'Desktop'}
                        </p>
                        {session.id === 'current-session' && (
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
                  {session.id !== 'current-session' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSession.mutate(session.id)}
                      disabled={revokeSession.isPending}
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {sessions.length > 1 ? `${sessions.length} active sessions` : '1 active session'}
                </p>
                {sessions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeAllSessions.mutate()}
                    disabled={revokeAllSessions.isPending}
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
