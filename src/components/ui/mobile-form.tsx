
import React from 'react';
import { cn } from '@/lib/utils';

interface MobileFormProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileForm = ({ children, className }: MobileFormProps) => {
  return (
    <div className={cn(
      "space-y-6 p-4 sm:p-6",
      "max-w-full sm:max-w-2xl mx-auto",
      className
    )}>
      {children}
    </div>
  );
};

interface MobileFormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const MobileFormSection = ({ title, children, className }: MobileFormSectionProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface MobileFormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileFormRow = ({ children, className }: MobileFormRowProps) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4",
      className
    )}>
      {children}
    </div>
  );
};
