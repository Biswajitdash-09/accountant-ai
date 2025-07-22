
import { CreditCard, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  limit?: number;
  icon: React.ReactNode;
}

const Accounts = () => {
  // Mock data for demonstration
  const accounts: Account[] = [
    {
      id: "acc1",
      name: "Business Checking",
      type: "Checking",
      balance: 12500.75,
      icon: <CreditCard className="h-8 w-8 text-primary" />,
    },
    {
      id: "acc2",
      name: "Business Savings",
      type: "Savings",
      balance: 8750.25,
      icon: <CreditCard className="h-8 w-8 text-primary" />,
    },
    {
      id: "acc3",
      name: "Business Credit Card",
      type: "Credit",
      balance: 3250.15,
      limit: 10000,
      icon: <CreditCard className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle>{account.name}</CardTitle>
                  <CardDescription>{account.type}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {account.icon}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Transactions</DropdownMenuItem>
                      <DropdownMenuItem>Edit Account</DropdownMenuItem>
                      <DropdownMenuItem>Reconcile</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${account.balance.toFixed(2)}
              </div>
              
              {account.limit && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Credit Used</span>
                    <span>
                      ${account.balance.toFixed(2)} / ${account.limit.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={(account.balance / account.limit) * 100} />
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm">View Details</Button>
              <Button size="sm">Add Transaction</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Accounts;
