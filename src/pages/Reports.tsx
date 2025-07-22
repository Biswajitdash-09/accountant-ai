
import { FileText, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const { toast } = useToast();

  // Mock data for demonstration
  const availableReports = [
    {
      id: "r1",
      title: "Profit & Loss",
      description: "View your business's income, expenses, and profit over time",
      icon: <FileText className="h-8 w-8" />,
    },
    {
      id: "r2",
      title: "Balance Sheet",
      description: "See your business's assets, liabilities, and equity",
      icon: <FileText className="h-8 w-8" />,
    },
    {
      id: "r3",
      title: "Cash Flow",
      description: "Track the flow of cash in and out of your business",
      icon: <FileText className="h-8 w-8" />,
    },
    {
      id: "r4",
      title: "Tax Summary",
      description: "Prepare for tax filing with a comprehensive summary",
      icon: <FileText className="h-8 w-8" />,
    },
    {
      id: "r5",
      title: "Expense Analysis",
      description: "Analyze your spending patterns by category",
      icon: <FileText className="h-8 w-8" />,
    },
    {
      id: "r6",
      title: "Revenue Forecast",
      description: "AI-powered predictions of future revenue based on historical data",
      icon: <FileText className="h-8 w-8" />,
    },
  ];

  const handleGenerateReport = (reportTitle: string) => {
    toast({
      title: "Generating Report",
      description: `Creating ${reportTitle} report...`,
    });

    // Simulate report generation
    setTimeout(() => {
      toast({
        title: "Report Ready",
        description: `${reportTitle} has been generated successfully`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Reports</h1>
        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>
      
      {/* Mobile responsive grid - single column on mobile */}
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
                onClick={() => handleGenerateReport(report.title)}
              >
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
