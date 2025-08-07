import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Tablet, MapPin, Clock, LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  lastActive: string;
  current: boolean;
  ipAddress: string;
}

const SessionManagement = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      deviceType: 'desktop',
      location: 'New York, NY',
      lastActive: '2 minutes ago',
      current: true,
      ipAddress: '192.168.1.1'
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      deviceType: 'mobile',
      location: 'New York, NY',
      lastActive: '1 hour ago',
      current: false,
      ipAddress: '192.168.1.2'
    },
    {
      id: '3',
      device: 'Chrome on Android',
      deviceType: 'mobile',
      location: 'Boston, MA',
      lastActive: '2 days ago',
      current: false,
      ipAddress: '10.0.0.1'
    }
  ]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    setSessions(sessions.filter(session => session.id !== sessionId));
    toast({
      title: "Session Terminated",
      description: "The selected session has been terminated successfully.",
    });
  };

  const handleTerminateAllOther = () => {
    setSessions(sessions.filter(session => session.current));
    toast({
      title: "All Other Sessions Terminated",
      description: "All other sessions have been terminated. Only your current session remains active.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Sessions</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleTerminateAllOther}
            disabled={sessions.length <= 1}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Terminate All Others
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.deviceType);
          
          return (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  session.current 
                    ? 'bg-green-100 dark:bg-green-900' 
                    : 'bg-muted'
                }`}>
                  <DeviceIcon className={`h-5 w-5 ${
                    session.current 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-muted-foreground'
                  }`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{session.device}</span>
                    {session.current && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {session.lastActive}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-1">
                    IP: {session.ipAddress}
                  </div>
                </div>
              </div>

              {!session.current && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                  className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No active sessions</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">Security Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Regularly review your active sessions</li>
            <li>• Terminate unknown or suspicious sessions immediately</li>
            <li>• Always log out from shared or public devices</li>
            <li>• Enable email alerts for new sign-ins</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManagement;