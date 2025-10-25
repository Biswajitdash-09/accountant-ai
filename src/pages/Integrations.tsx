import { motion } from "framer-motion";
import IntegrationManagement from "@/components/IntegrationManagement";
import { Link } from "lucide-react";

const Integrations = () => {
  return (
    <div className="container mx-auto p-4 max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Link className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
            <p className="text-muted-foreground">
              Connect your banking, accounting, and payment platforms
            </p>
          </div>
        </div>
      </motion.div>

      {/* Integration Management Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <IntegrationManagement />
      </motion.div>
    </div>
  );
};

export default Integrations;
