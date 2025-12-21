import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Trash2, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadSampleData, clearSampleData } from "@/utils/testData";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const SampleDataManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleLoadData = async () => {
    setIsLoading(true);
    try {
      await loadSampleData();
      toast({
        title: "Sample Data Loaded",
        description: "Sample transactions, investments, and goals have been added to your account.",
      });
      
      // Refresh page to show new data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error loading sample data:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to delete all sample data? This cannot be undone.")) {
      return;
    }

    setIsClearing(true);
    try {
      await clearSampleData();
      toast({
        title: "Sample Data Cleared",
        description: "All sample data has been removed from your account.",
      });
      
      // Refresh page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error clearing sample data:", error);
      toast({
        title: "Error Clearing Data",
        description: "Failed to clear sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Sample Data Manager
        </CardTitle>
        <CardDescription>
          Load realistic sample data to test features and explore the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sample data includes transactions, investments, and financial goals for testing purposes.
            You can clear this data at any time.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">What's included:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>23 sample transactions (income, expenses, business costs)</li>
              <li>5 investment holdings (stocks and ETFs)</li>
              <li>3 financial goals (savings, travel, debt reduction)</li>
              <li>Sample checking account with $5,000 balance</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleLoadData}
              disabled={isLoading || isClearing}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-pulse" />
                  Loading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Load Sample Data
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleClearData}
              disabled={isLoading || isClearing}
              className="flex-1"
            >
              {isClearing ? (
                <>
                  <Trash2 className="h-4 w-4 mr-2 animate-pulse" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Sample Data
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
