
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

export const ResponsiveTable = ({ children, className, minWidth = "800px" }: ResponsiveTableProps) => {
  return (
    <div className="w-full border rounded-lg">
      <ScrollArea className="w-full">
        <div className={cn("w-full overflow-auto", className)} style={{ minWidth }}>
          <Table>
            {children}
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
};

export { TableBody, TableCell, TableHead, TableHeader, TableRow };
