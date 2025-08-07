import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartInsightCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  priority?: 'high' | 'medium' | 'low';
  insight?: string;
  currency?: boolean;
  className?: string;
}

export const SmartInsightCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  trend = 'stable',
  priority = 'medium',
  insight,
  currency = false,
  className
}: SmartInsightCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return null;
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return 'text-finance-negative';
      case 'medium': return 'text-finance-warning';
      case 'low': return 'text-finance-positive';
      default: return 'text-finance-neutral';
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-finance-positive';
      case 'negative': return 'text-finance-negative';
      default: return 'text-finance-neutral';
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="relative overflow-hidden glass border border-white/20 hover:shadow-glow transition-all duration-300">
        {priority === 'high' && (
          <motion.div
            className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-finance-negative/20 to-transparent"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className={cn("p-2 rounded-lg bg-primary/10", getPriorityColor())}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <div>
                <h3 className="font-medium text-sm text-foreground/80">{title}</h3>
                {priority === 'high' && (
                  <Badge variant="destructive" className="text-xs mt-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    High Priority
                  </Badge>
                )}
              </div>
            </div>
            
            {TrendIcon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TrendIcon className={cn("h-4 w-4", getChangeColor())} />
              </motion.div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <AnimatedCounter
                value={value}
                prefix={currency ? "$" : ""}
                className="text-2xl font-bold"
                duration={1.5}
                decimals={currency ? 2 : 0}
              />
              
              {change !== undefined && (
                <motion.span
                  className={cn("text-sm font-medium", getChangeColor())}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </motion.span>
              )}
            </div>
            
            {insight && (
              <motion.p
                className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.8 }}
              >
                <CheckCircle className="h-3 w-3 inline mr-1 text-finance-positive" />
                {insight}
              </motion.p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};