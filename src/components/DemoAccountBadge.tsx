
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut } from "lucide-react";
import { useDemoMode } from "@/hooks/useDemoMode";

interface DemoAccountBadgeProps {
  variant?: 'default' | 'compact';
  showExitButton?: boolean;
}

const DemoAccountBadge = ({ variant = 'default', showExitButton = false }: DemoAccountBadgeProps) => {
  const { isDemo, exitDemoMode } = useDemoMode();

  if (!isDemo) return null;

  if (variant === 'compact') {
    return (
      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Demo
      </Badge>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-orange-800">You are using Demo Mode</p>
          <p className="text-xs text-orange-700">
            Your data will not be saved permanently. <span className="font-medium">Sign up to keep your records.</span>
          </p>
        </div>
      </div>
      {showExitButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={exitDemoMode}
          className="border-orange-300 text-orange-700 hover:bg-orange-100 text-xs sm:text-sm min-h-[32px] shrink-0 font-medium"
        >
          <LogOut className="h-3 w-3 mr-1" />
          Sign Up
        </Button>
      )}
    </div>
  );
};

export default DemoAccountBadge;
