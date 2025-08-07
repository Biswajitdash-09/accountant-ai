import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useCredits } from "@/hooks/useCredits";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  Zap, 
  Settings, 
  Bell,
  Shield,
  Smartphone,
  Mail,
  Globe,
  Wallet,
  RefreshCcw,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

interface AutoRechargeSettings {
  enabled: boolean;
  threshold: number;
  amount: number;
  maxMonthlySpend: number;
}

interface NotificationSettings {
  lowBalance: boolean;
  purchaseConfirmation: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  securityAlerts: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const EnhancedCreditSettings = () => {
  const { credits, availableCredits } = useCredits();
  const { selectedCurrency } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();

  const [autoRecharge, setAutoRecharge] = useState<AutoRechargeSettings>({
    enabled: false,
    threshold: 50,
    amount: 500,
    maxMonthlySpend: 100
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    lowBalance: true,
    purchaseConfirmation: true,
    weeklyReport: false,
    monthlyReport: true,
    securityAlerts: true,
    email: true,
    push: true,
    sms: false
  });

  const [paymentMethods] = useState([
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, enabled: true },
    { id: 'wallet', name: 'Digital Wallet', icon: Wallet, enabled: true },
    { id: 'bank', name: 'Bank Transfer', icon: Globe, enabled: false }
  ]);

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          notification_preferences: {
            ...notifications,
            auto_recharge: autoRecharge as any
          } as any
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your credit settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    const symbol = selectedCurrency?.code === 'USD' ? '$' : selectedCurrency?.code === 'INR' ? '₹' : '₦';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold">Credit Settings</h2>
          <p className="text-muted-foreground">
            Configure auto-recharge, notifications, and payment preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSaveSettings} className="gap-2">
            <Settings className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Current Status */}
      <Card className="gradient-primary text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm opacity-90">Available Credits</p>
              <p className="text-3xl font-bold">{availableCredits}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90">Auto-recharge</p>
              <p className="text-lg font-semibold">
                {autoRecharge.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90">Monthly Limit</p>
              <p className="text-lg font-semibold">
                {formatCurrency(autoRecharge.maxMonthlySpend)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Recharge Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <RefreshCcw className="h-5 w-5" />
              Auto-Recharge Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-recharge-enabled" className="text-base font-medium">
                  Enable Auto-Recharge
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically purchase credits when balance is low
                </p>
              </div>
              <Switch
                id="auto-recharge-enabled"
                checked={autoRecharge.enabled}
                onCheckedChange={(checked) => 
                  setAutoRecharge(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>

            {autoRecharge.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-6 pt-4 border-t"
              >
                <div className="space-y-2">
                  <Label>Trigger Threshold: {autoRecharge.threshold} credits</Label>
                  <Slider
                    value={[autoRecharge.threshold]}
                    onValueChange={([value]) => 
                      setAutoRecharge(prev => ({ ...prev, threshold: value }))
                    }
                    max={200}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-purchase will trigger when credits fall below this amount
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recharge-amount">Purchase Amount</Label>
                  <Select
                    value={autoRecharge.amount.toString()}
                    onValueChange={(value) => 
                      setAutoRecharge(prev => ({ ...prev, amount: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">100 credits</SelectItem>
                      <SelectItem value="250">250 credits</SelectItem>
                      <SelectItem value="500">500 credits</SelectItem>
                      <SelectItem value="1000">1000 credits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-limit">Monthly Spending Limit</Label>
                  <Input
                    id="monthly-limit"
                    type="number"
                    value={autoRecharge.maxMonthlySpend}
                    onChange={(e) => 
                      setAutoRecharge(prev => ({ 
                        ...prev, 
                        maxMonthlySpend: parseFloat(e.target.value) || 0 
                      }))
                    }
                    placeholder="100.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum amount to spend on auto-recharges per month
                  </p>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Safety Notice
                      </p>
                      <p className="text-orange-700 dark:text-orange-300">
                        Auto-recharge will stop if monthly limit is reached. You can adjust limits anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Low Balance Alerts</Label>
                  <p className="text-xs text-muted-foreground">When credits are running low</p>
                </div>
                <Switch
                  checked={notifications.lowBalance}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, lowBalance: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Purchase Confirmations</Label>
                  <p className="text-xs text-muted-foreground">Credit purchase receipts</p>
                </div>
                <Switch
                  checked={notifications.purchaseConfirmation}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, purchaseConfirmation: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Weekly Reports</Label>
                  <p className="text-xs text-muted-foreground">Usage summary every week</p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Monthly Reports</Label>
                  <p className="text-xs text-muted-foreground">Detailed monthly analytics</p>
                </div>
                <Switch
                  checked={notifications.monthlyReport}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, monthlyReport: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Security Alerts</Label>
                  <p className="text-xs text-muted-foreground">Account security notifications</p>
                </div>
                <Switch
                  checked={notifications.securityAlerts}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, securityAlerts: checked }))
                  }
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Delivery Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label className="text-sm">Email</Label>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label className="text-sm">Push Notifications</Label>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, push: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg transition-colors ${
                  method.enabled 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <method.icon className={`h-5 w-5 ${
                      method.enabled ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {method.enabled ? 'Available' : 'Coming soon'}
                      </p>
                    </div>
                  </div>
                  {method.enabled && (
                    <Badge variant="secondary" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCreditSettings;