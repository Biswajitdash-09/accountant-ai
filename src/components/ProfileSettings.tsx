
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useDemoMode } from "@/hooks/useDemoMode";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Mail, Shield, Camera, AlertTriangle } from "lucide-react";
import DemoAccountBadge from "./DemoAccountBadge";

const ProfileSettings = () => {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const { isDemo } = useDemoMode();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || user?.email || "",
  });
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Profile changes are not saved in demo mode. Sign up to save your data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateProfile.mutateAsync(formData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Avatar upload is not available in demo mode. Sign up to upload your avatar.",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setAvatarUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      await updateProfile.mutateAsync({
        avatar_url: urlData.publicUrl,
      });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  if (isLoading && !isDemo) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const displayName = isDemo ? "Demo User" : profile?.full_name || "Welcome!";
  const displayEmail = isDemo ? "demo@example.com" : profile?.email || user?.email;
  const displayRole = isDemo ? "Demo" : profile?.role || 'user';

  return (
    <div className="space-y-6">
      <DemoAccountBadge showExitButton={true} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            {isDemo 
              ? "This is a demo profile with sample data. Sign up to create your real profile."
              : "Manage your personal information and account settings"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={isDemo ? undefined : profile?.avatar_url} />
                <AvatarFallback className="text-lg">
                  {displayName.split(' ').map(n => n[0]).join('') || displayEmail?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isDemo && (
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="h-3 w-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={avatarUploading}
                  />
                </label>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{displayName}</h3>
                {isDemo && <DemoAccountBadge variant="compact" />}
              </div>
              <p className="text-sm text-muted-foreground">{displayEmail}</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-3 w-3" />
                <span className="text-xs text-muted-foreground capitalize">{displayRole}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  disabled={isDemo}
                />
                {isDemo && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Changes not saved in demo mode
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="pl-10"
                    disabled={true}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isDemo 
                    ? "Email cannot be changed in demo mode"
                    : "Email cannot be changed here. Contact support if needed."
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateProfile.isPending || isDemo}
                variant={isDemo ? "secondary" : "default"}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  isDemo ? "Demo Mode - Changes Not Saved" : "Update Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
          <CardDescription>
            {isDemo 
              ? "Sample account statistics for demo purposes"
              : "Your account activity and usage statistics"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {isDemo 
                  ? "Jan 1, 2024"
                  : (profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A')
                }
              </div>
              <div className="text-sm text-muted-foreground">Member Since</div>
            </div>
            <div className="text-center p-4 bg-green-500/5 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {isDemo ? "Demo" : "Active"}
              </div>
              <div className="text-sm text-muted-foreground">Account Status</div>
            </div>
            <div className="text-center p-4 bg-blue-500/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 capitalize">
                {displayRole}
              </div>
              <div className="text-sm text-muted-foreground">Account Role</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
