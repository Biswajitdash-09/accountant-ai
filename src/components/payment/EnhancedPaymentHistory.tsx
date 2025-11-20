import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePayments } from "@/hooks/usePayments";
import { format } from "date-fns";
import { CreditCard, CheckCircle, XCircle, Clock, ChevronDown, Download } from "lucide-react";
import { paymentAnimations } from "@/lib/paymentAnimations";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";

export const EnhancedPaymentHistory = () => {
  const { payments, isLoading, totalAmountSpent, totalCreditspurchased } = usePayments();
  const { formatCurrency } = useCurrencyFormatter();
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="p-4 rounded-lg border"
              >
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-finance-positive" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-finance-negative" />;
      default:
        return <Clock className="h-5 w-5 text-finance-warning" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <motion.div
        variants={paymentAnimations.staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
        >
          <Card className="relative overflow-hidden">
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 opacity-10"
            />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-3xl font-bold gradient-text">
                    {formatCurrency(totalAmountSpent / 100)}
                  </p>
                </div>
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0px hsl(var(--primary))",
                      "0 0 20px hsl(var(--primary))",
                      "0 0 0px hsl(var(--primary))",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <CreditCard className="h-10 w-10 text-primary" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Credits Purchased</p>
                  <p className="text-3xl font-bold">{totalCreditspurchased.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <motion.span
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-primary text-xl font-bold"
                  >
                    C
                  </motion.span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-3xl font-bold">{payments.length}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-finance-positive" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading">Recent Transactions</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={paymentAnimations.staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                variants={paymentAnimations.fadeSlide}
                layout
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedPayment(expandedPayment === payment.id ? null : payment.id)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={
                        payment.status === "pending"
                          ? {
                              scale: [1, 1.1, 1],
                              opacity: [0.7, 1, 0.7],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: payment.status === "pending" ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                    >
                      {getStatusIcon(payment.status)}
                    </motion.div>
                    <div className="text-left">
                      <p className="font-semibold">{payment.plan_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(payment.amount / 100, payment.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">{payment.credits} credits</p>
                    </div>
                    <Badge variant={getStatusVariant(payment.status)}>{payment.status}</Badge>
                    <motion.div
                      animate={{ rotate: expandedPayment === payment.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedPayment === payment.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t bg-muted/30"
                    >
                      <div className="p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transaction ID:</span>
                          <span className="font-mono">{payment.id.slice(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="capitalize">{payment.payment_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Currency:</span>
                          <span className="uppercase">{payment.currency}</span>
                        </div>
                        {payment.stripe_session_id && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Session ID:</span>
                            <span className="font-mono text-xs">
                              {payment.stripe_session_id.slice(0, 20)}...
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {payments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No payment history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
