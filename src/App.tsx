import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Accounts from "@/pages/Accounts";
import Reports from "@/pages/Reports";
import Analytics from "@/pages/Analytics";
import Tax from "@/pages/Tax";
import Upload from "@/pages/Upload";
import Assistant from "@/pages/Assistant";
import Markets from "@/pages/Markets";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdvancedFeatures from "@/pages/AdvancedFeatures";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <QueryClient>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout
                      sidebarCollapsed={sidebarCollapsed}
                      onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/advanced-features" element={<AdvancedFeatures />} />
                        <Route path="/tax" element={<Tax />} />
                        <Route path="/upload" element={<Upload />} />
                        <Route path="/assistant" element={<Assistant />} />
                        <Route path="/markets" element={<Markets />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
