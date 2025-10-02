
import { FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";

const Reports = () => {
  const { toast } = useToast();
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const generateProfitLossReport = async () => {
    setGeneratingReport("Profit & Loss");
    
    try {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      
      // Title
      doc.setFontSize(20);
      doc.text("Profit & Loss Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${currentDate}`, 20, 30);
      
      // Calculate totals
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const profit = income - expenses;
      
      // Summary table
      const summaryData = [
        ['Total Income', `$${income.toFixed(2)}`],
        ['Total Expenses', `$${expenses.toFixed(2)}`],
        ['Net Profit/Loss', `$${profit.toFixed(2)}`]
      ];
      
      autoTable(doc, {
        startY: 40,
        head: [['Description', 'Amount']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Income breakdown
      const incomeTransactions = transactions.filter(t => t.type === 'income');
      if (incomeTransactions.length > 0) {
        const incomeData = incomeTransactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.description || 'N/A',
          t.category || 'N/A',
          `$${t.amount.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Date', 'Description', 'Category', 'Amount']],
          body: incomeData,
          theme: 'striped',
          headStyles: { fillColor: [34, 139, 34] }
        });
      }
      
      // Expense breakdown
      const expenseTransactions = transactions.filter(t => t.type === 'expense');
      if (expenseTransactions.length > 0) {
        const expenseData = expenseTransactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.description || 'N/A',
          t.category || 'N/A',
          `$${t.amount.toFixed(2)}`
        ]);
        
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [['Date', 'Description', 'Category', 'Amount']],
          body: expenseData,
          theme: 'striped',
          headStyles: { fillColor: [220, 20, 60] }
        });
      }
      
      doc.save('profit-loss-report.pdf');
      
      toast({
        title: "Report Generated",
        description: "Profit & Loss report has been downloaded",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const generateBalanceSheetReport = async () => {
    setGeneratingReport("Balance Sheet");
    
    try {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      
      // Title
      doc.setFontSize(20);
      doc.text("Balance Sheet Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${currentDate}`, 20, 30);
      
      // Account balances
      const accountData = accounts.map(account => [
        account.account_name,
        account.account_type,
        `$${account.balance.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [['Account Name', 'Type', 'Balance']],
        body: accountData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Total assets
      const totalAssets = accounts.reduce((sum, account) => sum + account.balance, 0);
      const totalData = [['Total Assets', '', `$${totalAssets.toFixed(2)}`]];
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        body: totalData,
        theme: 'plain',
        styles: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      });
      
      doc.save('balance-sheet-report.pdf');
      
      toast({
        title: "Report Generated",
        description: "Balance Sheet report has been downloaded",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const generateCashFlowReport = async () => {
    setGeneratingReport("Cash Flow");
    
    try {
      const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      
      // Title
      doc.setFontSize(20);
      doc.text("Cash Flow Report", 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${currentDate}`, 20, 30);
      
      // Sort transactions by date
      const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const cashFlowData = sortedTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.description || 'N/A',
        t.type === 'income' ? 'Inflow' : 'Outflow',
        `$${t.amount.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [['Date', 'Description', 'Type', 'Amount']],
        body: cashFlowData,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      doc.save('cash-flow-report.pdf');
      
      toast({
        title: "Report Generated",
        description: "Cash Flow report has been downloaded",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const generateCSVReport = (reportType: string) => {
    setGeneratingReport(reportType);
    
    try {
      let csvContent = '';
      let filename = '';
      
      if (reportType === 'Transactions') {
        csvContent = [
          ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes'],
          ...transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description || '',
            t.category || '',
            t.type || '',
            t.amount.toString(),
            t.notes || ''
          ])
        ].map(row => row.join(',')).join('\n');
        filename = 'transactions-report.csv';
      } else if (reportType === 'Accounts') {
        csvContent = [
          ['Account Name', 'Account Type', 'Balance', 'Created Date'],
          ...accounts.map(a => [
            a.account_name,
            a.account_type,
            a.balance.toString(),
            new Date(a.created_at).toLocaleDateString()
          ])
        ].map(row => row.join(',')).join('\n');
        filename = 'accounts-report.csv';
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Report Generated",
        description: `${reportType} CSV report has been downloaded`,
      });
    } catch (error) {
      console.error('CSV generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate CSV report",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(null);
    }
  };

  const availableReports = [
    {
      id: "r1",
      title: "Profit & Loss",
      description: "View your business's income, expenses, and profit over time",
      icon: <FileText className="h-8 w-8" />,
      action: generateProfitLossReport,
    },
    {
      id: "r2",
      title: "Balance Sheet",
      description: "See your business's assets, liabilities, and equity",
      icon: <FileText className="h-8 w-8" />,
      action: generateBalanceSheetReport,
    },
    {
      id: "r3",
      title: "Cash Flow",
      description: "Track the flow of cash in and out of your business",
      icon: <FileText className="h-8 w-8" />,
      action: generateCashFlowReport,
    },
    {
      id: "r4",
      title: "Transactions CSV",
      description: "Export all transactions in CSV format",
      icon: <FileText className="h-8 w-8" />,
      action: () => generateCSVReport('Transactions'),
    },
    {
      id: "r5",
      title: "Accounts CSV",
      description: "Export all accounts in CSV format",
      icon: <FileText className="h-8 w-8" />,
      action: () => generateCSVReport('Accounts'),
    },
  ];

  if (transactionsLoading || accountsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading data for reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Reports</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto"
          onClick={() => generateCSVReport('Transactions')}
          disabled={!!generatingReport}
        >
          <Download className="h-4 w-4 mr-2" />
          Export All Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {availableReports.map((report) => (
          <Card key={report.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{report.title}</CardTitle>
                  <CardDescription className="mt-2">{report.description}</CardDescription>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {report.icon}
                </div>
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button 
                className="w-full" 
                onClick={report.action}
                disabled={!!generatingReport}
              >
                {generatingReport === report.title ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
