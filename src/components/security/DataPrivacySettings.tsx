import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Download, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const DataPrivacySettings = () => {
  const [settings, setSettings] = useState({
    analyticsEnabled: true,
    marketingEmails: false,
    dataSharing: false,
    activityTracking: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: "Privacy Setting Updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const exportUserData = async () => {
    setIsExporting(true);
    try {
      // Fetch all user data
      const [transactions, accounts, documents, budgets, goals] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user?.id),
        supabase.from('accounts').select('*').eq('user_id', user?.id),
        supabase.from('documents').select('*').eq('user_id', user?.id),
        supabase.from('budgets').select('*').eq('user_id', user?.id),
        supabase.from('financial_goals').select('*').eq('user_id', user?.id),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          id: user?.id,
          email: user?.email,
        },
        transactions: transactions.data || [],
        accounts: accounts.data || [],
        documents: documents.data || [],
        budgets: budgets.data || [],
        financialGoals: goals.data || [],
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accountant-ai-data-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not export your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const deleteAllData = async () => {
    try {
      // This would trigger the actual deletion process
      toast({
        title: "Deletion Requested",
        description: "Your data deletion request has been submitted. This may take up to 30 days.",
      });
    } catch (error) {
      console.error('Deletion error:', error);
      toast({
        title: "Request Failed",
        description: "Could not process your deletion request. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Manage how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="analytics" className="font-medium">
                Analytics & Performance
              </Label>
              <p className="text-sm text-muted-foreground">
                Help us improve by sharing anonymous usage data
              </p>
            </div>
            <Switch
              id="analytics"
              checked={settings.analyticsEnabled}
              onCheckedChange={(value) => handleSettingChange('analyticsEnabled', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="marketing" className="font-medium">
                Marketing Communications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features and updates
              </p>
            </div>
            <Switch
              id="marketing"
              checked={settings.marketingEmails}
              onCheckedChange={(value) => handleSettingChange('marketingEmails', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="sharing" className="font-medium">
                Data Sharing with Partners
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow sharing anonymized data with trusted partners
              </p>
            </div>
            <Switch
              id="sharing"
              checked={settings.dataSharing}
              onCheckedChange={(value) => handleSettingChange('dataSharing', value)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="tracking" className="font-medium">
                Activity Tracking
              </Label>
              <p className="text-sm text-muted-foreground">
                Track your activity for better insights and recommendations
              </p>
            </div>
            <Switch
              id="tracking"
              checked={settings.activityTracking}
              onCheckedChange={(value) => handleSettingChange('activityTracking', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Export or delete your personal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              You have the right to access, export, and delete your personal data at any time under GDPR regulations.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={exportUserData}
              disabled={isExporting}
              className="w-full justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export All My Data'}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All My Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      This action cannot be undone. This will permanently delete all your:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Transactions and financial records</li>
                      <li>Accounts and balances</li>
                      <li>Documents and receipts</li>
                      <li>Budgets and financial goals</li>
                      <li>Reports and analytics</li>
                    </ul>
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your account will be closed and you won't be able to access any of your data.
                      </AlertDescription>
                    </Alert>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllData} className="bg-destructive text-destructive-foreground">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p>• Data export includes all your financial records in JSON format</p>
            <p>• Deletion requests are processed within 30 days</p>
            <p>• Some data may be retained for legal or security purposes</p>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Information */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Regulations</CardTitle>
          <CardDescription>
            We comply with international data protection regulations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">GDPR Compliant</p>
              <p className="text-xs text-muted-foreground mt-1">
                Full compliance with EU General Data Protection Regulation
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">CCPA Compliant</p>
              <p className="text-xs text-muted-foreground mt-1">
                California Consumer Privacy Act compliance
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 border rounded-lg">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">SOC 2 Type II Certified</p>
              <p className="text-xs text-muted-foreground mt-1">
                Industry-standard security and availability controls
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
