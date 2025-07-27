
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  to?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'ghost' | 'outline';
}

export const BackButton: React.FC<BackButtonProps> = ({
  to,
  className,
  children,
  variant = 'ghost'
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleBack}
      className={cn(
        "flex items-center gap-2 transition-all duration-200 hover:scale-105",
        "text-muted-foreground hover:text-foreground",
        "min-h-[44px] touch-manipulation", // Touch-friendly
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {children || "Back"}
    </Button>
  );
};
