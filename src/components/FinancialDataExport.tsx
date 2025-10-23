import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Download, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";

interface DataType {
  id: string;
  label: string;
  description: string;
}

const dataTypes: DataType[] = [
  { id: 'accounts', label: 'Accounts', description: 'All account balances and details' },
  { id: 'transactions', label: 'Transactions', description: 'Transaction history' },
  { id: 'budgets', label: 'Budgets', description: 'Budget plans and spending' },
  { id: 'goals', label: 'Financial Goals', description: 'Savings goals and progress' },
  { id: 'tax', label: 'Tax Data', description: 'Tax calculations and deductions' },
  { id: 'documents', label: 'Documents', description: 'Uploaded financial documents' },
];

export const FinancialDataExport = () => {
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['accounts', 'transactions']);
  const [email, setEmail] = useState('');
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel' | 'html'>('html');
  const [reportName, setReportName] = useState(`Financial Report ${format(new Date(), 'MMM yyyy')}`);
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDataType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleSendReport = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (selectedTypes.length === 0) {
      toast({
        title: "Select Data",
        description: "Please select at least one data type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-financial-report', {
        body: {
          email,
          reportName,
          dataTypes: selectedTypes,
          startDate,
          endDate,
          format: reportFormat,
        },
      });

      if (error) throw error;

      // If scheduling is enabled, save to database
      if (frequency !== 'once') {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const nextSendDate = calculateNextSendDate(frequency);
          const { error: schedError } = await supabase.from('scheduled_reports').insert([{
            user_id: currentUser.id,
            report_name: reportName,
            data_types: selectedTypes,
            frequency,
            email,
            format: reportFormat,
            next_send_at: nextSendDate,
            filters: { startDate, endDate } as any,
          }]);
          
          if (schedError) {
            console.error('Schedule error:', schedError);
          }
        }
      }

      toast({
        title: "Report Sent!",
        description: `Financial report has been sent to ${email}`,
      });

      // Reset form
      setEmail('');
      setSelectedTypes(['accounts', 'transactions']);
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to send report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNextSendDate = (freq: string): string => {
    const now = new Date();
    switch (freq) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Export Financial Data
        </CardTitle>
        <CardDescription>
          Send your financial data directly to your email. Choose what to include and how often to receive reports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Name */}
        <div className="space-y-2">
          <Label htmlFor="report-name">Report Name</Label>
          <Input
            id="report-name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Monthly Financial Summary"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
        </div>

        {/* Data Types */}
        <div className="space-y-3">
          <Label>Select Data to Export</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataTypes.map((type) => (
              <div key={type.id} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <Checkbox
                  id={type.id}
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => toggleDataType(type.id)}
                />
                <div className="flex-1">
                  <label
                    htmlFor={type.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.label}
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        {selectedTypes.includes('transactions') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date (Optional)</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Format */}
        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={reportFormat} onValueChange={(val: any) => setReportFormat(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="html">HTML Email</SelectItem>
              <SelectItem value="pdf">PDF Attachment</SelectItem>
              <SelectItem value="excel">Excel Spreadsheet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="once">Send Once</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSendReport} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>Sending Report...</>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              {frequency === 'once' ? 'Send Report Now' : `Schedule ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Reports`}
            </>
          )}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Reports will include all selected data with professional formatting and charts. 
            Scheduled reports will be sent automatically at the selected frequency.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
