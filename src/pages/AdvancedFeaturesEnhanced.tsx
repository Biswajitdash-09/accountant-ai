import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Link as LinkIcon, Gauge, Brain } from "lucide-react";
import { motion } from "framer-motion";
import IntegrationManagement from "@/components/IntegrationManagement";
import PWAEnhancements from "@/components/PWAEnhancements";
import AnomalyDetector from "@/components/ai/AnomalyDetector";

const AdvancedFeaturesPage = () => {
  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Settings className="h-10 w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">Advanced Features</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pro-level integrations, performance monitoring, and enterprise features
        </p>
      </motion.div>

      {/* Advanced Features Tabs */}
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="integrations" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="ai-security" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Gauge className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationManagement />
        </TabsContent>

        <TabsContent value="ai-security" className="space-y-6">
          <AnomalyDetector />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PWAEnhancements />
        </TabsContent>
      </Tabs>

      {/* Enterprise Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-center">Enterprise Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
                <LinkIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading font-semibold">Third-Party Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Connect with banks, payment processors, and accounting software for seamless workflows
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
                <Gauge className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading font-semibold">Performance Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Real-time performance metrics, PWA features, and mobile optimization tools
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto gradient-primary rounded-full flex items-center justify-center">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading font-semibold">Enterprise Controls</h3>
              <p className="text-sm text-muted-foreground">
                Advanced configuration, security settings, and administrative controls
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFeaturesPage;