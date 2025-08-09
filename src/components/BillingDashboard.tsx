import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCredits } from "@/hooks/useCredits";
import { usePayments } from "@/hooks/usePayments";
import { useCreditPlans } from "@/hooks/useCreditPlans";
import { CreditCard, Download, Bell, Settings, Zap } from "lucide-react";
import { motion } from "framer-motion";
import PaymentHistory from "./PaymentHistory";
import { EnhancedCreditPlans } from "./EnhancedCreditPlans";
import CreditAnalytics from "./CreditAnalytics";
import EnhancedCreditSettings from "./EnhancedCreditSettings";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
const BillingDashboard = () => {
  const { credits, availableCredits } = useCredits();
  const { totalAmountSpent } = usePayments();
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const { formatCurrency } = useCurrencyFormatter();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold">Billing & Credits</h1>
          <p className="text-muted-foreground">
            Manage your credits, payments, and billing preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-primary text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Available Credits</p>
                  <p className="text-2xl font-bold">{availableCredits}</p>
                </div>
                <Zap className="h-8 w-8 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold">{credits?.total_credits || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <span className="text-secondary font-bold text-sm">T</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Used</p>
                  <p className="text-2xl font-bold">{credits?.used_credits || 0}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">U</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${(totalAmountSpent / 100).toFixed(2)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Billing Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-recharge" className="text-base">Auto-recharge</Label>
              <p className="text-sm text-muted-foreground">
                Automatically purchase credits when balance is low
              </p>
            </div>
            <Switch
              id="auto-recharge"
              checked={autoRecharge}
              onCheckedChange={setAutoRecharge}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive payment confirmations and credit alerts
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          {autoRecharge && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="border rounded-lg p-4 bg-muted/50"
            >
              <p className="text-sm font-medium mb-2">Auto-recharge settings</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Trigger when below</Label>
                  <p className="text-sm">50 credits</p>
                </div>
                <div>
                  <Label className="text-xs">Purchase amount</Label>
                  <p className="text-sm">500 credits</p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Buy Credits</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-6">
          <EnhancedCreditPlans />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <PaymentHistory />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <CreditAnalytics />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6">
          <EnhancedCreditSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingDashboard;