
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxDashboard } from "@/components/tax/TaxDashboard";
import { TaxDeductionManager } from "@/components/tax/TaxDeductionManager";
import { TaxCalculator } from "@/components/tax/TaxCalculator";
import { TaxCalendar } from "@/components/tax/TaxCalendar";
import { TaxSettings } from "@/components/tax/TaxSettings";
import { TaxComparison } from "@/components/tax/TaxComparison";
import { IndirectTaxCalculator } from "@/components/tax/IndirectTaxCalculator";
import { FileText, Calculator, TrendingUp, Settings, Calendar } from "lucide-react";
import { TaxCountrySelector } from "@/components/tax/TaxCountrySelector";

const Tax = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCountry, setSelectedCountry] = useState<'USA' | 'UK' | 'India' | 'Nigeria'>('USA');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-muted-foreground">
            Comprehensive tax planning, calculation, and compliance management
          </p>
        </div>
        <div className="md:text-right">
          <p className="text-sm text-muted-foreground mb-2">Tax country</p>
          <TaxCountrySelector value={selectedCountry} onChange={setSelectedCountry} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="deductions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Deductions</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Compare</span>
          </TabsTrigger>
          <TabsTrigger value="indirect" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">VAT/GST</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <TaxDashboard />
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <TaxDeductionManager />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <TaxCalculator selectedCountry={selectedCountry} />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <TaxComparison />
        </TabsContent>

        <TabsContent value="indirect" className="space-y-6">
          <IndirectTaxCalculator country={selectedCountry} />
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
