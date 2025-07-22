
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Download, Filter } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}

const Transactions = () => {
  // Mock data for demonstration
  const [transactions] = useState<Transaction[]>([
    {
      id: "tx1",
      date: "Jul 20, 2025",
      description: "Client Payment - XYZ Corp",
      category: "Income",
      amount: 2500,
      type: "income",
    },
    {
      id: "tx2",
      date: "Jul 19, 2025",
      description: "Office Rent",
      category: "Rent",
      amount: 1200,
      type: "expense",
    },
    {
      id: "tx3",
      date: "Jul 17, 2025",
      description: "Software Subscription",
      category: "Software",
      amount: 49.99,
      type: "expense",
    },
    {
      id: "tx4",
      date: "Jul 15, 2025",
      description: "Client Payment - ABC Inc",
      category: "Income",
      amount: 3500,
      type: "income",
    },
    {
      id: "tx5",
      date: "Jul 12, 2025",
      description: "Utility Bills",
      category: "Utilities",
      amount: 175.25,
      type: "expense",
    },
    {
      id: "tx6",
      date: "Jul 10, 2025",
      description: "Office Supplies",
      category: "Supplies",
      amount: 87.5,
      type: "expense",
    },
    {
      id: "tx7",
      date: "Jul 8, 2025",
      description: "Marketing Campaign",
      category: "Marketing",
      amount: 350,
      type: "expense",
    },
    {
      id: "tx8",
      date: "Jul 5, 2025",
      description: "Client Payment - DEF Ltd",
      category: "Income",
      amount: 1800,
      type: "income",
    },
    {
      id: "tx9",
      date: "Jul 3, 2025",
      description: "Employee Salaries",
      category: "Salary",
      amount: 4500,
      type: "expense",
    },
    {
      id: "tx10",
      date: "Jul 1, 2025",
      description: "Consulting Fee",
      category: "Income",
      amount: 1200,
      type: "income",
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search transactions..."
              className="md:w-1/3"
            />
            <div className="flex items-center gap-2 md:w-2/3">
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-1/3">
                  <SelectValue placeholder="Transaction Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-1/3">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
