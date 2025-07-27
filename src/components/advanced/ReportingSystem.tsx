
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useCustomReports } from '@/hooks/useCustomReports';

export const ReportingSystem = () => {
  const { reports, executions, createReport, executeReport, isLoading } = useCustomReports();
  const [isCreating, setIsCreating] = useState(false);
  const [newReport, setNewReport] = useState({
    report_name: '',
    report_type: 'financial_summary',
    report_config: {}
  });

  const handleCreateReport = async () => {
    await createReport.mutateAsync({
      report_name: newReport.report_name,
      report_type: newReport.report_type,
      report_config: {
        includeCharts: true,
        period: 'monthly',
        format: 'pdf'
      }
    });
    setNewReport({ report_name: '', report_type: 'financial_summary', report_config: {} });
    setIsCreating(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'secondary',
      'running': 'default',
      'completed': 'default',
      'failed': 'destructive'
    } as const;

    const colors = {
      'pending': 'text-yellow-600',
      'running': 'text-blue-600',
      'completed': 'text-green-600',
      'failed': 'text-red-600'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    );
  };

  const reportTypes = [
    { value: 'financial_summary', label: 'Financial Summary' },
    { value: 'cash_flow', label: 'Cash Flow Report' },
    { value: 'profit_loss', label: 'Profit & Loss' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'tax_summary', label: 'Tax Summary' },
    { value: 'expense_analysis', label: 'Expense Analysis' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custom Reports</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage automated financial reports
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Report</DialogTitle>
              <DialogDescription>
                Set up a new automated report for your financial data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={newReport.report_name}
                  onChange={(e) => setNewReport({...newReport, report_name: e.target.value})}
                  placeholder="Monthly Financial Summary"
                />
              </div>
              <div>
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={newReport.report_type}
                  onValueChange={(value) => setNewReport({...newReport, report_type: value})}
                >
                  <SelectTrigger>
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
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateReport} disabled={!newReport.report_name}>
                  Create Report
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const latestExecution = executions
            .filter(exec => exec.report_id === report.id)
            .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0];

          return (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  {report.report_name}
                </CardTitle>
                <CardDescription>
                  {reportTypes.find(t => t.value === report.report_type)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestExecution && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last run:</span>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(latestExecution.execution_status)}
                        <span>{new Date(latestExecution.generated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => executeReport.mutate(report.id)}
                    disabled={executeReport.isPending}
                  >
                    <Play className="h-3 w-3" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executions.slice(0, 10).map((execution) => {
                const report = reports.find(r => r.id === execution.report_id);
                return (
                  <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{report?.report_name}</span>
                      {getStatusBadge(execution.execution_status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(execution.generated_at).toLocaleString()}
                      {execution.execution_time_ms && (
                        <span className="ml-2">({execution.execution_time_ms}ms)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
