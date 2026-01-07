import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Key, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AuthenticationSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message || "Could not update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <CardTitle>Authentication Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Password Change */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <h3 className="font-semibold">Change Password</h3>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button 
              onClick={handlePasswordChange}
              disabled={!newPassword || !confirmPassword || isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <h3 className="font-semibold">Security Notifications</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Email security alerts</span>
              <p className="text-xs text-muted-foreground">
                Get notified of suspicious account activity
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
        </div>

        {/* Account Info */}
        <div className="p-3 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium">Account Information</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Email: {user?.email || 'Not available'}</p>
            <p>Last sign in: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Unknown'}</p>
          </div>
        </div>

        {/* Security Tips */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Security Tips
            </span>
          </div>
          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1 list-disc list-inside">
            <li>Use a strong, unique password</li>
            <li>Enable 2FA for extra protection</li>
            <li>Review active sessions regularly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthenticationSettings;
