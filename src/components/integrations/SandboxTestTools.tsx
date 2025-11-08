import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, FileUp, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SandboxTestTools = () => {
  const { toast } = useToast();

  const sampleDatasets = [
    {
      name: "Retail Banking Transactions",
      description: "100 sample transactions with various categories",
      count: 100,
    },
    {
      name: "Crypto Portfolio",
      description: "5 wallets with 20 transactions each",
      count: 5,
    },
    {
      name: "Investment Portfolio",
      description: "Mix of stocks, bonds, and ETFs",
      count: 15,
    },
    {
      name: "Business Expenses",
      description: "Business-related transactions and receipts",
      count: 50,
    },
  ];

  const handleLoadSampleData = (datasetName: string) => {
    toast({
      title: "Loading Sample Data",
      description: `Loading "${datasetName}" into your sandbox...`,
    });

    // Simulate loading
    setTimeout(() => {
      toast({
        title: "Success",
        description: `${datasetName} loaded successfully!`,
      });
    }, 1500);
  };

  const handleResetSandbox = () => {
    toast({
      title: "Resetting Sandbox",
      description: "All test data will be removed...",
      variant: "destructive",
    });

    setTimeout(() => {
      toast({
        title: "Sandbox Reset",
        description: "All test data has been cleared.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sandbox Test Data Manager
          </CardTitle>
          <CardDescription>
            Load sample datasets to test features and integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {sampleDatasets.map((dataset) => (
              <Card key={dataset.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{dataset.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {dataset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Records:</span>
                    <Badge variant="secondary">{dataset.count}</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleLoadSampleData(dataset.name)}
                  >
                    <FileUp className="h-4 w-4 mr-2" />
                    Load Dataset
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All Data
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleResetSandbox}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Sandbox
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
