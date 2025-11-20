import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnimatedPaymentCardProps {
  planId: string;
  name: string;
  price: number;
  currency?: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  icon?: React.ReactNode;
  gradientColors?: string;
  credits?: number;
  children?: React.ReactNode;
}

export const AnimatedPaymentCard = ({
  planId,
  name,
  price,
  currency = "USD",
  billingCycle,
  features,
  isPopular,
  isSelected,
  onSelect,
  icon,
  gradientColors,
  credits,
  children,
}: AnimatedPaymentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{ perspective: "1000px" }}
      className="relative"
    >
      <Card className={`p-6 relative overflow-hidden ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : ''
      }`}>
        {children}
        
        {/* Animated background gradient */}
        <motion.div
          className={`absolute inset-0 opacity-10 bg-gradient-to-br ${
            gradientColors || "from-primary to-accent"
          }`}
          style={{
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Popular badge with pulse */}
        {isPopular && (
          <motion.div
            className="absolute -right-2 -top-2"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.8, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" as any,
            }}
          >
            <Badge className="bg-gradient-to-r from-primary to-accent">
              <Sparkles className="h-3 w-3 mr-1" />
              Popular
            </Badge>
          </motion.div>
        )}

        {/* Content */}
        <div className="relative z-10">
          <motion.h3 
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: "easeOut" as any }}
          >
            {name}
          </motion.h3>

          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" as any }}
          >
            <span className="text-4xl font-bold">
              {currency === 'usd' ? '$' : currency.toUpperCase()}{price}
            </span>
            <span className="text-muted-foreground">
              /{billingCycle === 'monthly' ? 'mo' : 'yr'}
            </span>
          </motion.div>

          {/* Features list with stagger */}
          <motion.ul 
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, ease: "easeOut" as any }}
                className="flex items-start gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, type: "spring" as any }}
                >
                  <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                </motion.div>
                <span className="text-sm">{feature}</span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Animated button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onSelect}
              className="w-full relative overflow-hidden group"
              variant={isSelected ? "default" : "outline"}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative z-10">
                {isSelected ? 'Selected' : 'Select Plan'}
              </span>
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};
