
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaxDashboard } from "@/components/tax/TaxDashboard";
import { TaxDeductionManager } from "@/components/tax/TaxDeductionManager";
import { TaxCalculator } from "@/components/tax/TaxCalculator";
import { TaxCalendar } from "@/components/tax/TaxCalendar";
import { TaxSettings } from "@/components/tax/TaxSettings";
import { TaxComparison } from "@/components/tax/TaxComparison";
import { IndirectTaxCalculator } from "@/components/tax/IndirectTaxCalculator";
import { CorporateTaxCalculator } from "@/components/tax/CorporateTaxCalculator";
import { NigeriaTaxCalculator } from "@/components/tax/NigeriaTaxCalculator";
import TaxFilingWidget from "@/components/tax/TaxFilingWidget";
import { FileText, Calculator, TrendingUp, Settings, Calendar, Building2, Send } from "lucide-react";
import { TaxCountrySelector } from "@/components/tax/TaxCountrySelector";
import { useHMRCConnection } from "@/hooks/useHMRCConnection";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const Tax = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCountry, setSelectedCountry] = useState<'USA' | 'UK' | 'India' | 'Nigeria'>('USA');
  const { isConnected } = useHMRCConnection();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Tax Management</h1>
            {selectedCountry === 'UK' && isConnected && (
              <Badge variant="default" className="gap-1">
                <ExternalLink className="h-3 w-3" />
                HMRC Connected
              </Badge>
            )}
          </div>
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
        <div className="mobile-tabs-scroll">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-9 gap-1 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="filing" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Filing</span>
            </TabsTrigger>
            <TabsTrigger value="deductions" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Deductions</span>
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Calculator</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="indirect" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">VAT/GST</span>
            </TabsTrigger>
            <TabsTrigger value="corporate" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Corporate</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 min-h-[44px] whitespace-nowrap">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="space-y-6">
          <TaxDashboard />
        </TabsContent>

        <TabsContent value="filing" className="space-y-6">
          <TaxFilingWidget />
        </TabsContent>

        <TabsContent value="deductions" className="space-y-6">
          <TaxDeductionManager />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          {selectedCountry === 'Nigeria' ? (
            <NigeriaTaxCalculator />
          ) : (
            <TaxCalculator selectedCountry={selectedCountry} />
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <TaxComparison />
        </TabsContent>

        <TabsContent value="indirect" className="space-y-6">
          <IndirectTaxCalculator country={selectedCountry} />
        </TabsContent>

        <TabsContent value="corporate" className="space-y-6">
          <CorporateTaxCalculator country={selectedCountry} />
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
