import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTaxCalculations } from '@/hooks/useTaxCalculations';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Download, 
  Mail, 
  FileText, 
  Calculator, 
  Bot, 
  TrendingUp, 
  Loader2,
  CheckCircle 
} from 'lucide-react';

interface ExportData {
  taxCalculations: boolean;
  aiVerdicts: boolean;
  businessAnalysis: boolean;
  transactions: boolean;
}

const BusinessDataExport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { taxCalculations } = useTaxCalculations();
  const { sessions } = useChatHistory();
  const { transactions } = useTransactions();
  
  const [isExporting, setIsExporting] = useState(false);
  const [emailAddress, setEmailAddress] = useState(user?.email || '');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportData, setExportData] = useState<ExportData>({
    taxCalculations: true,
    aiVerdicts: true,
    businessAnalysis: true,
    transactions: false,
  });

  const handleExportDataChange = (field: keyof ExportData, checked: boolean) => {
    setExportData(prev => ({ ...prev, [field]: checked }));
  };

  const getExportStats = () => {
    const aiMessages = sessions.reduce((total, session) => total + session.messages.length, 0);
    const businessAnalysisCount = sessions.filter(session => 
      session.title.toLowerCase().includes('analysis') || 
      session.title.toLowerCase().includes('business')
    ).length;
    
    return {
      taxCalculations: taxCalculations.length,
      aiVerdicts: aiMessages,
      businessAnalysis: businessAnalysisCount,
      transactions: transactions.length,
    };
  };

  const prepareExportData = () => {
    const data: any = {
      exportDate: new Date().toISOString(),
      userId: user?.id,
      userEmail: user?.email,
    };

    if (exportData.taxCalculations) {
      data.taxCalculations = taxCalculations.map(calc => ({
        id: calc.id,
        calculationType: calc.calculation_type,
        grossIncome: calc.gross_income,
        totalDeductions: calc.total_deductions,
        taxableIncome: calc.taxable_income,
        taxLiability: calc.tax_liability,
        amountOwed: calc.amount_owed,
        calculatedAt: calc.calculated_at,
        details: calc.calculation_details,
      }));
    }

    if (exportData.aiVerdicts || exportData.businessAnalysis) {
      const relevantSessions = exportData.businessAnalysis
        ? sessions.filter(session => 
            session.title.toLowerCase().includes('analysis') ||
            session.title.toLowerCase().includes('business') ||
            session.title.toLowerCase().includes('tax') ||
            session.title.toLowerCase().includes('financial')
          )
        : sessions;

      data.aiInteractions = relevantSessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        messages: session.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      }));
    }

    if (exportData.transactions) {
      data.transactions = transactions.map(transaction => ({
        id: transaction.id,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        createdAt: transaction.created_at,
      }));
    }

    return data;
  };

  const generateCSVContent = (data: any): string => {
    let csvContent = '';

    if (data.taxCalculations) {
      csvContent += 'TAX CALCULATIONS\n';
      csvContent += 'ID,Type,Gross Income,Total Deductions,Taxable Income,Tax Liability,Amount Owed,Calculated At\n';
      data.taxCalculations.forEach((calc: any) => {
        csvContent += `${calc.id},${calc.calculationType},${calc.grossIncome},${calc.totalDeductions},${calc.taxableIncome},${calc.taxLiability},${calc.amountOwed},${calc.calculatedAt}\n`;
      });
      csvContent += '\n';
    }

    if (data.aiInteractions) {
      csvContent += 'AI INTERACTIONS\n';
      csvContent += 'Session ID,Title,Created At,Role,Message,Timestamp\n';
      data.aiInteractions.forEach((session: any) => {
        session.messages.forEach((msg: any) => {
          const cleanContent = msg.content.replace(/"/g, '""').replace(/\n/g, ' ');
          csvContent += `${session.id},"${session.title}",${session.createdAt},${msg.role},"${cleanContent}",${msg.timestamp}\n`;
        });
      });
      csvContent += '\n';
    }

    if (data.transactions) {
      csvContent += 'TRANSACTIONS\n';
      csvContent += 'ID,Description,Amount,Type,Category,Date,Created At\n';
      data.transactions.forEach((transaction: any) => {
        csvContent += `${transaction.id},"${transaction.description}",${transaction.amount},${transaction.type},"${transaction.category}",${transaction.date},${transaction.createdAt}\n`;
      });
    }

    return csvContent;
  };

  const handleDownloadExport = () => {
    try {
      const data = prepareExportData();
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'csv') {
        content = generateCSVContent(data);
        filename = `business-data-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(data, null, 2);
        filename = `business-data-export-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Complete',
        description: `Your business data has been downloaded as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export business data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEmailExport = async () => {
    if (!emailAddress) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address to send the export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const data = prepareExportData();
      
      const { error } = await supabase.functions.invoke('send-business-export', {
        body: {
          email: emailAddress,
          data,
          format: exportFormat,
          exportOptions: exportData,
        },
      });

      if (error) throw error;

      toast({
        title: 'Export Sent',
        description: `Your business data export has been sent to ${emailAddress}.`,
      });
      
    } catch (error) {
      console.error('Email export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to send business data via email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const stats = getExportStats();
  const selectedCount = Object.values(exportData).filter(Boolean).length;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Business Data Export</CardTitle>
        </div>
        <CardDescription>
          Export your tax calculations, AI verdicts, and business analysis data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Select Data to Export</h3>
            <Badge variant="outline">{selectedCount} selected</Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="tax-calculations"
                  checked={exportData.taxCalculations}
                  onCheckedChange={(checked) => handleExportDataChange('taxCalculations', checked as boolean)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    <Label htmlFor="tax-calculations" className="font-medium cursor-pointer">
                      Tax Calculations
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{stats.taxCalculations} calculations</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="ai-verdicts"
                  checked={exportData.aiVerdicts}
                  onCheckedChange={(checked) => handleExportDataChange('aiVerdicts', checked as boolean)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <Label htmlFor="ai-verdicts" className="font-medium cursor-pointer">
                      AI Verdicts & Responses
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{stats.aiVerdicts} messages</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="business-analysis"
                  checked={exportData.businessAnalysis}
                  onCheckedChange={(checked) => handleExportDataChange('businessAnalysis', checked as boolean)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <Label htmlFor="business-analysis" className="font-medium cursor-pointer">
                      Business Analysis
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{stats.businessAnalysis} sessions</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="transactions"
                  checked={exportData.transactions}
                  onCheckedChange={(checked) => handleExportDataChange('transactions', checked as boolean)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <Label htmlFor="transactions" className="font-medium cursor-pointer">
                      Transactions
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">{stats.transactions} transactions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Export Format */}
        <div className="space-y-3">
          <Label htmlFor="export-format">Export Format</Label>
          <Select value={exportFormat} onValueChange={(value: 'pdf' | 'csv') => setExportFormat(value)}>
            <SelectTrigger id="export-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF Report</SelectItem>
              <SelectItem value="csv">CSV Spreadsheet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Download Option */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Export
          </h3>
          <Button
            onClick={handleDownloadExport}
            variant="outline"
            className="w-full"
            disabled={selectedCount === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download {exportFormat.toUpperCase()} Export
          </Button>
        </div>

        <Separator />

        {/* Email Option */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Export
          </h3>
          <div className="space-y-2">
            <Label htmlFor="export-email">Email Address</Label>
            <Input
              id="export-email"
              type="email"
              placeholder="your@email.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
          <Button
            onClick={handleEmailExport}
            className="w-full"
            disabled={isExporting || selectedCount === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Export...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send {exportFormat.toUpperCase()} via Email
              </>
            )}
          </Button>
        </div>

        {selectedCount === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Please select at least one data type to export.</p>
          </div>
        )}

        {selectedCount > 0 && (
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-primary">Ready to Export</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCount} data type{selectedCount > 1 ? 's' : ''} selected for export as {exportFormat.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessDataExport;