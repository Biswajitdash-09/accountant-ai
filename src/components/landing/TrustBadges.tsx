import { motion } from "framer-motion";
import { Shield, Lock, Award, CheckCircle } from "lucide-react";

const badges = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "256-bit SSL encryption"
  },
  {
    icon: Lock,
    title: "GDPR Compliant",
    description: "Your data is protected"
  },
  {
    icon: Award,
    title: "SOC 2 Certified",
    description: "Industry-standard security"
  },
  {
    icon: CheckCircle,
    title: "99.9% Uptime",
    description: "Always available"
  }
];

export const TrustBadges = () => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h3 className="text-lg font-semibold text-muted-foreground">
            Trusted by businesses worldwide
          </h3>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border hover:shadow-lg transition-shadow"
            >
              <badge.icon className="h-10 w-10 text-primary mb-3" />
              <h4 className="font-semibold mb-1">{badge.title}</h4>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
