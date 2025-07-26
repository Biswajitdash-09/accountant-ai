
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/ProfileSettings";
import AuthenticationSettings from "@/components/AuthenticationSettings";
import SessionManagement from "@/components/SessionManagement";
import CurrencySelector from "@/components/CurrencySelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useSecurityAuditLogs } from "@/hooks/useSecurityAuditLogs";
import { User, Settings, Shield, LogOut, Clock, Calendar, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Profile = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const { preferences, updatePreferences } = useUserPreferences();
  const { auditLogs, isLoading: auditLoading } = useSecurityAuditLogs();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!preferences?.notification_preferences) return;
    
    const updatedPreferences = {
      ...preferences.notification_preferences,
      [key]: value
    };
    
    await updatePreferences.mutateAsync({
      notification_preferences: updatedPreferences
    });
  };

  const handleTimezoneChange = async (timezone: string) => {
    await updatePreferences.mutateAsync({ timezone });
  };

  const handleDateFormatChange = async (date_format: string) => {
    await updatePreferences.mutateAsync({ date_format });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Set your default currency for financial data display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrencySelector />
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>
                Configure timezone and date format preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={preferences?.timezone || 'UTC'} 
                  onValueChange={handleTimezoneChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai (CST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select 
                  value={preferences?.date_format || 'MM/DD/YYYY'} 
                  onValueChange={handleDateFormatChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences?.notification_preferences?.email_notifications ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences?.notification_preferences?.push_notifications ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="tax-reminders">Tax Reminders</Label>
                  <p className="text-sm text-muted-foreground">Important tax deadline notifications</p>
                </div>
                <Switch
                  id="tax-reminders"
                  checked={preferences?.notification_preferences?.tax_reminders ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('tax_reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="goal-updates">Goal Updates</Label>
                  <p className="text-sm text-muted-foreground">Progress updates on financial goals</p>
                </div>
                <Switch
                  id="goal-updates"
                  checked={preferences?.notification_preferences?.goal_updates ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('goal_updates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="security-alerts">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Important security and account changes</p>
                </div>
                <Switch
                  id="security-alerts"
                  checked={preferences?.notification_preferences?.security_alerts ?? true}
                  onCheckedChange={(checked) => handleNotificationChange('security_alerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Authentication Settings */}
          <AuthenticationSettings />

          {/* Session Management */}
          <SessionManagement />

          {/* Security Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle>Security Activity</CardTitle>
              <CardDescription>
                Recent security events and account activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className="text-center py-4">Loading security activity...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No security activity recorded
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {auditLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{log.action_description}</p>
                        <div className="text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                          {log.ip_address && <span> • IP: {log.ip_address}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account access and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pt-4 border-t">
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
