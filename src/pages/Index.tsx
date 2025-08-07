
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Accounts from "./Accounts";
import Reports from "./Reports";
import Analytics from "./Analytics";
import AdvancedFeatures from "./AdvancedFeatures";
import Pricing from "./Pricing";
import Tax from "./Tax";
import Upload from "./Upload";
import Assistant from "./Assistant";
import Markets from "./Markets";
import Profile from "./Profile";
import Notifications from "./Notifications";
import Performance from "./Performance";
import Security from "./Security";
import NotFound from "./NotFound";

const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/advanced-features" element={<AdvancedFeatures />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/tax" element={<Tax />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/markets" element={<Markets />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/security" element={<Security />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
