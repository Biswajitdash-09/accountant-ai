
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDemoMode } from "@/contexts/DemoModeContext";
import DemoBadge from "@/components/demo/DemoBadge";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const { isDemoMode } = useDemoMode();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle>Recent Transactions</CardTitle>
          {isDemoMode && <DemoBadge size="sm" />}
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop table view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell 
                    className={cn(
                      "text-right font-medium",
                      transaction.type === "income" 
                        ? "text-finance-positive" 
                        : "text-finance-negative"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile card view */}
        <div className="block md:hidden space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-3 border rounded-lg bg-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {transaction.date}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium line-clamp-2 break-words">
                    {transaction.description}
                  </p>
                </div>
                <div className={cn(
                  "text-right font-medium ml-3 whitespace-nowrap",
                  transaction.type === "income" 
                    ? "text-finance-positive" 
                    : "text-finance-negative"
                )}>
                  {transaction.type === "income" ? "+" : "-"}
                  ${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
