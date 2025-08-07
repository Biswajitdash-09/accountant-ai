import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Key, UserCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import AuthenticationSettings from "@/components/AuthenticationSettings";
import SessionManagement from "@/components/SessionManagement";

const Security = () => {
  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">Security Center</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Manage your account security, authentication settings, and privacy preferences. 
          Keep your financial data safe and secure.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AuthenticationSettings />
        </motion.div>

        {/* Session Management */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SessionManagement />
        </motion.div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Data Encryption</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                All your financial data is encrypted using industry-standard AES-256 encryption.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Data at Rest</span>
                  <span className="text-green-600 dark:text-green-400">✓ Encrypted</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Data in Transit</span>
                  <span className="text-green-600 dark:text-green-400">✓ TLS 1.3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Privacy Controls</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Control what data is collected and how it's used for analytics and insights.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Analytics Opt-out</span>
                  <span className="text-blue-600 dark:text-blue-400">Available</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Data Export</span>
                  <span className="text-blue-600 dark:text-blue-400">Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Compliance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                We comply with major financial regulations and privacy standards.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>SOC 2 Type II</span>
                  <span className="text-purple-600 dark:text-purple-400">✓ Compliant</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>GDPR Ready</span>
                  <span className="text-purple-600 dark:text-purple-400">✓ Compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Security Best Practices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <CardTitle>Security Best Practices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Account Security</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Use a strong, unique password</li>
                  <li>• Enable two-factor authentication</li>
                  <li>• Review account activity regularly</li>
                  <li>• Keep your email secure</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Data Protection</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Don't share login credentials</li>
                  <li>• Log out from shared devices</li>
                  <li>• Report suspicious activity</li>
                  <li>• Keep your devices updated</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Security;