
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Reports = () => {
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map((report) => (
          <Card key={report.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription className="mt-2">{report.description}</CardDescription>
                </div>
                {report.icon}
              </div>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
