
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Only show one sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
        isMobile ? (
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        ) : "translate-x-0"
      )}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : "ml-64"
      )}>
        <Header onMobileMenuToggle={toggleMobileMenu} />
        <main className={cn(
          "flex-1 overflow-auto",
          "p-4 sm:p-6 lg:p-8",
          "min-h-[calc(100vh-4rem)]"
        )}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
