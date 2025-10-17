import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHMRCData } from "@/hooks/useHMRCData";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { SelfAssessmentData } from "@/types/hmrc";

export const HMRCTaxSummary = () => {
  const { taxData, isLoading } = useHMRCData();
  const { formatCurrency } = useCurrencyFormatter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const selfAssessmentData = taxData?.find(d => d.data_type === 'self_assessment');
  const saData = selfAssessmentData?.data as SelfAssessmentData | undefined;

  if (!selfAssessmentData || !saData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            HMRC Tax Summary
          </CardTitle>
          <CardDescription>Self Assessment information from HMRC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No self assessment data available</p>
            <p className="text-sm">Sync your HMRC account to view tax information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              HMRC Tax Summary
            </CardTitle>
            <CardDescription>
              Self Assessment for Tax Year {saData.taxYear || selfAssessmentData.tax_year}
            </CardDescription>
          </div>
          <Badge variant={saData.paymentStatus === 'paid' ? 'default' : 'secondary'}>
            {saData.paymentStatus || 'Pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Income & Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Total Income
            </div>
            <div className="text-2xl font-bold">
              {saData.totalIncome ? formatCurrency(saData.totalIncome) : 'N/A'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Total Deductions
            </div>
            <div className="text-2xl font-bold text-finance-secondary">
              {saData.totalDeductions ? formatCurrency(saData.totalDeductions) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Tax Due */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tax Due</p>
              <p className="text-3xl font-bold text-finance-highlight">
                {saData.taxDue ? formatCurrency(saData.taxDue) : 'N/A'}
              </p>
            </div>
            {saData.utr && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">UTR</p>
                <p className="text-sm font-mono">{saData.utr}</p>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            Last updated: {format(new Date(selfAssessmentData.updated_at), 'PPp')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
