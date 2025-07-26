
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, AlertTriangle } from "lucide-react";
import { useSecurityAuditLogs } from "@/hooks/useSecurityAuditLogs";

const AuthenticationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logSecurityEvent } = useSecurityAuditLogs();
  
  const [emailData, setEmailData] = useState({
    newEmail: "",
    isUpdating: false
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    isUpdating: false
  });

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailData.newEmail) return;

    setEmailData(prev => ({ ...prev, isUpdating: true }));
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: emailData.newEmail 
      });

      if (error) throw error;

      await logSecurityEvent.mutateAsync({
        action_type: 'email_change_request',
        action_description: `Email change requested to ${emailData.newEmail}`,
        metadata: { old_email: user?.email, new_email: emailData.newEmail }
      });

      toast({
        title: "Email Update Requested",
        description: "Please check both your old and new email addresses for confirmation links.",
      });

      setEmailData({ newEmail: "", isUpdating: false });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setEmailData(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error", 
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setPasswordData(prev => ({ ...prev, isUpdating: true }));
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: passwordData.newPassword 
      });

      if (error) throw error;

      await logSecurityEvent.mutateAsync({
        action_type: 'password_change',
        action_description: 'Password changed successfully'
      });

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        isUpdating: false
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setPasswordData(prev => ({ ...prev, isUpdating: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Settings
          </CardTitle>
          <CardDescription>
            Update your email address. You'll need to verify both your old and new email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">Current Email</Label>
              <Input
                id="current-email"
                type="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={emailData.newEmail}
                onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                placeholder="Enter new email address"
                required
              />
            </div>

            <Button type="submit" disabled={emailData.isUpdating || !emailData.newEmail}>
              {emailData.isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Email"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password Settings
          </CardTitle>
          <CardDescription>
            Change your account password. Choose a strong password with at least 8 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                required
                minLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                required
                minLength={8}
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Password Security Tips:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Use at least 8 characters</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Add numbers and special characters</li>
                  <li>• Don't reuse passwords from other accounts</li>
                </ul>
              </div>
            </div>

            <Button type="submit" disabled={passwordData.isUpdating || !passwordData.newPassword || !passwordData.confirmPassword}>
              {passwordData.isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationSettings;
