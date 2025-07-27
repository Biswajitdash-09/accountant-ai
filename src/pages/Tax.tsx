
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxDashboard } from "@/components/tax/TaxDashboard";
import { TaxDeductionManager } from "@/components/tax/TaxDeductionManager";
import { TaxCalculator } from "@/components/tax/TaxCalculator";
import { TaxCalendar } from "@/components/tax/TaxCalendar";
import { TaxSettings } from "@/components/tax/TaxSettings";
import { FileText, Calculator, TrendingUp, Settings, Calendar } from "lucide-react";

const Tax = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tax Management</h1>
        <p className="text-muted-foreground">
          Comprehensive tax planning, calculation, and compliance management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Deductions
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TaxDashboard />
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <TaxDeductionManager />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <TaxCalculator />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <TaxCalendar />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <TaxSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tax;
