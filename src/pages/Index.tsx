
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Accounts from "./Accounts";
import Reports from "./Reports";
import Tax from "./Tax";
import Upload from "./Upload";
import Assistant from "./Assistant";
import Profile from "./Profile";
import FinancialManagement from "./FinancialManagement";

const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/tax" element={<Tax />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/financial-management" element={<FinancialManagement />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
