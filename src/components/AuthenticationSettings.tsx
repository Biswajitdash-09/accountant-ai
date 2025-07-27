import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Loader2, Mail, Lock, AlertTriangle } from "lucide-react";
import { useSecurityAuditLogs } from "@/hooks/useSecurityAuditLogs";

const AuthenticationSettings = () => {
  const { user } = useAuth();
  const { isDemo } = useDemoMode();
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
    
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Email changes are not available in demo mode. Sign up to manage your email.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Password changes are not available in demo mode. Sign up to manage your password.",
        variant: "destructive",
      });
      return;
    }
    
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

  const displayEmail = isDemo ? "demo@example.com" : user?.email || "";

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
            {isDemo 
              ? "Email changes are not available in demo mode. Sign up to manage your email."
              : "Update your email address. You'll need to verify both your old and new email."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">Current Email</Label>
              <Input
                id="current-email"
                type="email"
                value={displayEmail}
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
                disabled={isDemo}
              />
              {isDemo && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Email changes not available in demo mode
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={emailData.isUpdating || !emailData.newEmail || isDemo}
              variant={isDemo ? "secondary" : "default"}
            >
              {emailData.isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                isDemo ? "Demo Mode - Not Available" : "Update Email"
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
            {isDemo 
              ? "Password changes are not available in demo mode. Sign up to manage your password."
              : "Change your account password. Choose a strong password with at least 8 characters."
            }
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
                disabled={isDemo}
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
                disabled={isDemo}
              />
            </div>

            {isDemo && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Demo Mode Restriction:</p>
                  <p className="text-xs mt-1">
                    Password changes are not available in demo mode. Sign up to create a real account.
                  </p>
                </div>
              </div>
            )}

            {!isDemo && (
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
            )}

            <Button 
              type="submit" 
              disabled={passwordData.isUpdating || !passwordData.newPassword || !passwordData.confirmPassword || isDemo}
              variant={isDemo ? "secondary" : "default"}
            >
              {passwordData.isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                isDemo ? "Demo Mode - Not Available" : "Change Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthenticationSettings;
