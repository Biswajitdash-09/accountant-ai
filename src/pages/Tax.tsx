
import { FileText, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const Tax = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tax Management</h1>
      
      <Card className="border-finance-highlight border-2">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Quarterly Tax Due</CardTitle>
              <CardDescription>Next payment due: Aug 15, 2025</CardDescription>
            </div>
            <AlertTriangle className="h-6 w-6 text-finance-highlight" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">$1,543.25</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Tax Filing Readiness</span>
              <span>75% Complete</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button>Prepare Filing</Button>
            <Button variant="outline">Review Calculations</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tax Forms</CardTitle>
            <CardDescription>Access and file your tax forms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Income Tax Return
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                GST/HST Return
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Payroll Tax Forms
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Calendar</CardTitle>
            <CardDescription>Important tax dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-finance-highlight pl-3 py-1">
                <div className="font-medium">August 15, 2025</div>
                <div className="text-sm text-muted-foreground">Quarterly Tax Payment Due</div>
              </div>
              <div className="border-l-4 border-muted pl-3 py-1">
                <div className="font-medium">October 15, 2025</div>
                <div className="text-sm text-muted-foreground">Extended Tax Filing Deadline</div>
              </div>
              <div className="border-l-4 border-muted pl-3 py-1">
                <div className="font-medium">January 31, 2026</div>
                <div className="text-sm text-muted-foreground">W-2 and 1099 Forms Due</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tax Deductions</CardTitle>
            <CardDescription>AI-identified potential deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Home Office Expenses</span>
                <span className="font-medium">$750.00</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Business Travel</span>
                <span className="font-medium">$1,250.00</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>Software Subscriptions</span>
                <span className="font-medium">$450.00</span>
              </div>
              <Button variant="link" className="px-0">View All Deductions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tax;
