import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How secure is my financial data?",
    answer: "We use bank-level 256-bit SSL encryption and are SOC 2 certified. Your data is encrypted at rest and in transit. We never sell or share your data with third parties."
  },
  {
    question: "Can I import data from my current accounting software?",
    answer: "Yes! We support importing from Excel, CSV, QuickBooks, Xero, and many other formats. Our AI can automatically categorize and organize your existing data."
  },
  {
    question: "Do you offer customer support?",
    answer: "Absolutely! We offer 24/7 AI-powered support through Arnold, our intelligent assistant. Plus, Pro and Business plan users get priority email support with response times under 4 hours."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and support multiple payment gateways including Stripe, Cashfree, and UPI for Indian users."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time with no penalties. You'll retain access until the end of your billing period, and you can export all your data."
  },
  {
    question: "Does it work with cryptocurrency transactions?",
    answer: "Yes! We have full crypto portfolio tracking with support for multiple wallets, NFTs, and automated tax calculations for crypto gains and losses."
  },
  {
    question: "Is there a mobile app?",
    answer: "Accountant AI is a Progressive Web App (PWA) that works seamlessly on mobile devices. You can install it on your phone and use it just like a native app with offline capabilities."
  },
  {
    question: "How does the AI analysis work?",
    answer: "Our AI analyzes your financial patterns, identifies trends, detects anomalies, and provides actionable insights. It learns from your business over time to give you increasingly personalized recommendations."
  }
];

export const FAQSection = () => {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions? We've got answers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
