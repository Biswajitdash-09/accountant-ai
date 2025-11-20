import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const comparisonData = [
  {
    feature: "AI-Powered Insights",
    accountantAI: true,
    traditional: false
  },
  {
    feature: "Real-Time Analysis",
    accountantAI: true,
    traditional: false
  },
  {
    feature: "Automated Categorization",
    accountantAI: true,
    traditional: true
  },
  {
    feature: "Multi-Currency Support",
    accountantAI: true,
    traditional: false
  },
  {
    feature: "Crypto Portfolio Tracking",
    accountantAI: true,
    traditional: false
  },
  {
    feature: "24/7 AI Assistant",
    accountantAI: true,
    traditional: false
  },
  {
    feature: "HMRC Integration",
    accountantAI: true,
    traditional: false
  },
  {
    feature: "Mobile-First Design",
    accountantAI: true,
    traditional: false
  }
];

export const ComparisonSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Accountant AI?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how we compare to traditional accounting software
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div />
                <CardTitle className="text-primary">Accountant AI</CardTitle>
                <CardTitle className="text-muted-foreground">Traditional Software</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparisonData.map((item, index) => (
                  <motion.div
                    key={item.feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-3 gap-4 items-center py-3 border-b border-border last:border-0"
                  >
                    <div className="text-sm font-medium">{item.feature}</div>
                    <div className="flex justify-center">
                      {item.accountantAI ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex justify-center">
                      {item.traditional ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
