import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge, Smartphone, Palette, Settings } from "lucide-react";
import { motion } from "framer-motion";
import PWAEnhancements from "@/components/PWAEnhancements";

const PerformancePage = () => {
  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <Gauge className="h-10 w-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold">Performance & Mobile</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Progressive Web App features, mobile optimization, and performance monitoring
        </p>
      </motion.div>

      {/* Performance Content */}
      <PWAEnhancements />

      {/* Additional Performance Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-center">Optimization Features</CardTitle>
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
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-heading font-semibold">Mobile First</h3>
              <p className="text-sm text-muted-foreground">
                Designed and optimized for mobile devices with touch-friendly interfaces
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
              <h3 className="font-heading font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Code splitting, lazy loading, and optimized bundling for maximum performance
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
              <h3 className="font-heading font-semibold">PWA Ready</h3>
              <p className="text-sm text-muted-foreground">
                Install as an app, work offline, and receive push notifications
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformancePage;