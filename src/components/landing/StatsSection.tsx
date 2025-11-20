import { AnimatedCounter } from "@/components/ui/animated-counter";
import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, Shield } from "lucide-react";
import { useReducedMotion, getAnimationConfig } from "@/hooks/useReducedMotion";

const stats = [
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Active Users",
    color: "text-primary"
  },
  {
    icon: DollarSign,
    value: 5,
    suffix: "M+",
    label: "Managed Funds",
    prefix: "$",
    color: "text-green-500"
  },
  {
    icon: TrendingUp,
    value: 99.9,
    suffix: "%",
    label: "Uptime",
    decimals: 1,
    color: "text-blue-500"
  },
  {
    icon: Shield,
    value: 100,
    suffix: "%",
    label: "Secure",
    color: "text-purple-500"
  }
];

export const StatsSection = () => {
  const prefersReducedMotion = useReducedMotion();
  const containerAnim = getAnimationConfig(prefersReducedMotion);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          {...containerAnim}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center space-y-3"
            >
              <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                decimals={stat.decimals || 0}
                className="text-3xl md:text-4xl font-bold"
              />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
