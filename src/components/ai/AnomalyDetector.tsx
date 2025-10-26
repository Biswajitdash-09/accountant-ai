import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AlertTriangle, CheckCircle, XCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendation: string;
  transaction?: any;
  transactions?: any[];
}

const AnomalyDetector = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const scanForAnomalies = async () => {
    if (!user || scanning) return;

    try {
      setScanning(true);
      setLoading(true);

      toast({
        title: "Scanning for anomalies",
        description: "Analyzing your transactions...",
      });

      const { data, error } = await supabase.functions.invoke('ai-detect-anomalies');

      if (error) throw error;

      if (data?.success) {
        setAnomalies(data.anomalies || []);
        setSummary(data.summary || {});
        
        toast({
          title: "Scan complete",
          description: `Found ${data.anomalies?.length || 0} potential issues.`,
        });
      }
    } catch (error) {
      console.error('Error scanning anomalies:', error);
      toast({
        title: "Scan failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Anomaly Detection</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered fraud and error detection
          </p>
        </div>
        <Button
          onClick={scanForAnomalies}
          disabled={scanning}
        >
          <Search className={`h-4 w-4 mr-2 ${scanning ? 'animate-pulse' : ''}`} />
          {scanning ? 'Scanning...' : 'Scan Now'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Issues</p>
              <p className="text-2xl font-bold">{summary.total || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Duplicates</p>
              <p className="text-2xl font-bold">{summary.duplicates || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Unusual Amounts</p>
              <p className="text-2xl font-bold">{summary.unusualAmounts || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Suspicious Patterns</p>
              <p className="text-2xl font-bold">{summary.suspiciousPatterns || 0}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : anomalies.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {anomalies.map((anomaly, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <Badge variant={getSeverityColor(anomaly.severity)}>
                      {getSeverityIcon(anomaly.severity)}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{anomaly.message}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {anomaly.type.replace('_', ' ')} • {anomaly.severity} severity
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <div>
                      <p className="text-sm font-medium mb-1">Recommendation:</p>
                      <p className="text-sm text-muted-foreground">{anomaly.recommendation}</p>
                    </div>
                    
                    {anomaly.transaction && (
                      <div className="bg-muted p-3 rounded-lg space-y-1">
                        <p className="text-sm font-medium">Transaction Details:</p>
                        <p className="text-sm">{anomaly.transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Amount: ${Math.abs(anomaly.transaction.amount)} • 
                          Date: {new Date(anomaly.transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {anomaly.transactions && anomaly.transactions.length > 0 && (
                      <div className="bg-muted p-3 rounded-lg space-y-2">
                        <p className="text-sm font-medium">Related Transactions:</p>
                        {anomaly.transactions.map((tx, txIndex) => (
                          <div key={txIndex} className="text-sm border-l-2 border-primary pl-2">
                            <p>{tx.description}</p>
                            <p className="text-muted-foreground">
                              ${Math.abs(tx.amount)} • {new Date(tx.date).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <p className="font-medium">No anomalies detected</p>
            <p className="text-sm mt-1">Your transactions look clean!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnomalyDetector;
