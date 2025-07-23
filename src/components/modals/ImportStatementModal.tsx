
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { Account } from "@/hooks/useAccounts";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import Papa from "papaparse";

interface ImportStatementModalProps {
  account: Account;
  trigger: React.ReactNode;
}

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: string;
}

const ImportStatementModal = ({ account, trigger }: ImportStatementModalProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'parsed' | 'importing' | 'success' | 'error'>('idle');
  
  const { createTransaction } = useTransactions();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedTransactions([]);
      setImportStatus('idle');
    }
  };

  const parseCSV = () => {
    if (!file) return;

    setIsProcessing(true);
    setImportStatus('idle');

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const transactions: ParsedTransaction[] = results.data.map((row: any) => {
            // Try to parse common CSV formats
            const date = row.Date || row.date || row.Transaction_Date || row['Transaction Date'];
            const description = row.Description || row.description || row.Memo || row.memo || row.Details || row.details;
            const amount = parseFloat(row.Amount || row.amount || row.Credit || row.credit || row.Debit || row.debit || '0');
            const category = row.Category || row.category || row.Type || row.type;

            // Determine transaction type based on amount or specific columns
            let type: 'income' | 'expense' = 'expense';
            if (amount > 0) {
              type = 'income';
            } else if (row.Credit && parseFloat(row.Credit) > 0) {
              type = 'income';
            } else if (row.Debit && parseFloat(row.Debit) > 0) {
              type = 'expense';
            }

            return {
              date: date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              description: description || 'Imported Transaction',
              amount: Math.abs(amount),
              type,
              category: category || undefined,
            };
          }).filter(t => t.amount > 0); // Filter out invalid transactions

          setParsedTransactions(transactions);
          setImportStatus('parsed');
          toast({
            title: "File Parsed Successfully",
            description: `Found ${transactions.length} transactions to import`,
          });
        } catch (error) {
          console.error('Parsing error:', error);
          setImportStatus('error');
          toast({
            title: "Parse Error",
            description: "Failed to parse the CSV file. Please check the format.",
            variant: "destructive",
          });
        }
        setIsProcessing(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setImportStatus('error');
        setIsProcessing(false);
        toast({
          title: "File Error",
          description: "Failed to read the CSV file",
          variant: "destructive",
        });
      }
    });
  };

  const importTransactions = async () => {
    if (parsedTransactions.length === 0) return;

    setImportStatus('importing');
    
    try {
      for (const transaction of parsedTransactions) {
        await createTransaction.mutateAsync({
          account_id: account.id,
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
        });
      }

      setImportStatus('success');
      toast({
        title: "Import Successful",
        description: `Successfully imported ${parsedTransactions.length} transactions`,
      });

      // Reset state after successful import
      setTimeout(() => {
        setFile(null);
        setParsedTransactions([]);
        setImportStatus('idle');
        setOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      toast({
        title: "Import Error",
        description: "Failed to import some transactions",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = () => {
    switch (importStatus) {
      case 'parsed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Upload className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Bank Statement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className="font-medium">Import to: {account.account_name}</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="statement-file">Select CSV File</Label>
                  <Input
                    id="statement-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    disabled={isProcessing || importStatus === 'importing'}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file with columns: Date, Description, Amount (or Credit/Debit)
                  </p>
                </div>

                {file && (
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                )}

                {file && importStatus === 'idle' && (
                  <Button 
                    onClick={parseCSV} 
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Parsing...' : 'Parse CSV File'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {parsedTransactions.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Preview ({parsedTransactions.length} transactions)</h3>
                    <Button 
                      onClick={importTransactions}
                      disabled={importStatus === 'importing'}
                      size="sm"
                    >
                      {importStatus === 'importing' ? 'Importing...' : 'Import All'}
                    </Button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {parsedTransactions.slice(0, 10).map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{transaction.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                            {transaction.category && ` • ${transaction.category}`}
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                    {parsedTransactions.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground">
                        ... and {parsedTransactions.length - 10} more transactions
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {importStatus === 'success' && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Import completed successfully!</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportStatementModal;
