
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
    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <div>
          <p className="text-sm font-medium text-orange-800">Demo Account</p>
          <p className="text-xs text-orange-700">
            You're exploring with sample data. Sign up to save your actual data.
          </p>
        </div>
      </div>
      {showExitButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={exitDemoMode}
          className="border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          <LogOut className="h-3 w-3 mr-1" />
          Exit Demo
        </Button>
      )}
    </div>
  );
};

export default DemoAccountBadge;
