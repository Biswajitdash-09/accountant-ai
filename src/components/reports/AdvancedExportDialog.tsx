import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, FileSpreadsheet, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdvancedExportDialogProps {
  trigger?: React.ReactNode;
}

const AdvancedExportDialog = ({ trigger }: AdvancedExportDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportType, setReportType] = useState<string>('profit_loss');
  const [format, setFormat] = useState<string>('pdf');
  const [emailReport, setEmailReport] = useState(false);

  const reportTypes = [
    { value: 'profit_loss', label: 'Profit & Loss Statement' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'cash_flow', label: 'Cash Flow Statement' },
    { value: 'tax_summary', label: 'Tax Summary Report' },
    { value: 'expense_breakdown', label: 'Expense Breakdown by Category' },
    { value: 'monthly_spending', label: 'Monthly Spending Report' },
    { value: 'annual_tax_package', label: 'Annual Tax Package' },
  ];

  const formats = [
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'excel', label: 'Excel (XLSX)', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet },
  ];

  const handleExport = async () => {
    if (!user) return;

    try {
      setExporting(true);

      toast({
        title: "Generating report",
        description: "This may take a few moments...",
      });

      // Call edge function to generate report
      const { data, error } = await supabase.functions.invoke('generate-financial-report', {
        body: {
          reportType,
          format,
          emailReport,
          year: new Date().getFullYear(),
        },
      });

      if (error) throw error;

      if (emailReport) {
        toast({
          title: "Report sent!",
          description: `${reportTypes.find(r => r.value === reportType)?.label} has been emailed to you.`,
        });
      } else {
        // Download the file
        toast({
          title: "Report generated!",
          description: "Your report is ready for download.",
        });
        
        // In a real implementation, you would handle the file download here
        // For now, we'll just show success
      }

      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Financial Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <Button
                    key={fmt.value}
                    variant={format === fmt.value ? 'default' : 'outline'}
                    className="flex flex-col h-auto py-3"
                    onClick={() => setFormat(fmt.value)}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs">{fmt.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Email Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={emailReport}
              onCheckedChange={(checked) => setEmailReport(checked as boolean)}
            />
            <Label
              htmlFor="email"
              className="text-sm font-normal cursor-pointer flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email report to my registered email
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedExportDialog;
