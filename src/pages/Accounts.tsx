
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
import { useState } from "react";
import AddAccountModal from "@/components/modals/AddAccountModal";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  limit?: number;
  icon: React.ReactNode;
}

const Accounts = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

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

  const handleAddAccount = () => {
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (accountName: string) => {
    toast({
      title: "Account Details",
      description: `Opening details for ${accountName}`,
    });
  };

  const handleAddTransaction = (accountName: string) => {
    toast({
      title: "Add Transaction",
      description: `Opening transaction form for ${accountName}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold">Accounts</h1>
        <Button size="sm" onClick={handleAddAccount} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Mobile responsive grid - single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{account.name}</CardTitle>
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
                      <DropdownMenuItem onClick={() => handleViewDetails(account.name)}>
                        View Transactions
                      </DropdownMenuItem>
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
            <CardFooter className="border-t pt-4 flex flex-col sm:flex-row justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full sm:w-auto"
                onClick={() => handleViewDetails(account.name)}
              >
                View Details
              </Button>
              <Button 
                size="sm" 
                className="w-full sm:w-auto"
                onClick={() => handleAddTransaction(account.name)}
              >
                Add Transaction
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AddAccountModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
};

export default Accounts;
