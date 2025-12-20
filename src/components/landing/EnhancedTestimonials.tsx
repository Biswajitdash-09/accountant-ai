import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Founder & CEO",
    company: "TechStart Ltd",
    content: "Accountant AI transformed how we manage our finances. The AI insights helped us identify cost savings of over £50,000 in the first year alone.",
    rating: 5,
    metrics: { before: "Manual tracking", after: "90% automated" },
    initials: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Finance Director",
    company: "Global Exports Inc",
    content: "The multi-currency support and real-time exchange rates saved us countless hours. We now process international transactions in seconds instead of hours.",
    rating: 5,
    metrics: { before: "4 hours/day", after: "30 minutes/day" },
    initials: "MC"
  },
  {
    name: "Aisha Patel",
    role: "Small Business Owner",
    company: "Patel's Boutique",
    content: "As someone with no accounting background, Arnold AI made everything so simple. I can now focus on growing my business instead of worrying about the books.",
    rating: 5,
    metrics: { before: "£500/month accountant", after: "£50/month" },
    initials: "AP"
  },
  {
    name: "James Williams",
    role: "Crypto Trader",
    company: "Independent",
    content: "The crypto portfolio tracking is a game-changer. It automatically calculates my tax obligations across multiple wallets and exchanges. Worth every penny!",
    rating: 5,
    metrics: { before: "Manual spreadsheets", after: "Fully automated" },
    initials: "JW"
  }
];

export const EnhancedTestimonials = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Businesses Worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Accountant AI is transforming financial management for our users
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow border border-border bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.company}
                      </p>
                    </div>
                    <div className="flex shrink-0">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.content}"
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Before</p>
                      <p className="font-semibold text-foreground">{testimonial.metrics.before}</p>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">After</p>
                      <p className="font-semibold text-primary">{testimonial.metrics.after}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
