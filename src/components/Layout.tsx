
import { useState, useEffect, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileHeader from "./mobile/MobileHeader";
import MobileBottomNav from "./mobile/MobileBottomNav";
import { NavigationBreadcrumbs } from "./Navigation/Breadcrumbs";
import { useIsMobile } from "@/hooks/use-mobile-enhanced";
import { cn } from "@/lib/utils";
import DemoAccountBadge from "./DemoAccountBadge";
import { GlobalSearch } from "@/components/advanced/GlobalSearch";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import PWAEnhancements from "@/components/PWAEnhancements";
import { FloatingArnoldButton } from "@/components/ai/FloatingArnoldButton";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { isOpen: isSearchOpen, openSearch, closeSearch } = useGlobalSearch();

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background w-full overflow-x-hidden relative">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-all duration-300 animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <Sidebar 
          isCollapsed={false}
          onToggle={() => {}}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={toggleMobileMenu}
        />

        {/* Mobile Header */}
        <MobileHeader 
          onMenuToggle={toggleMobileMenu}
          onSearchToggle={openSearch}
        />
        
        {/* Main Content with Bottom Navigation Space */}
        <main className="min-h-[calc(100vh-5rem)] pb-36 mobile-scroll bg-background">
          {/* PWA Enhancements */}
          <div className="px-5 pt-3">
            <PWAEnhancements />
          </div>
          
          {/* Demo Badge */}
          <div className="px-5 pt-4">
            <DemoAccountBadge showExitButton />
          </div>
          
          {/* Breadcrumbs - Hidden on mobile by default */}
          <div className="px-5 hidden sm:block pt-2">
            <NavigationBreadcrumbs />
          </div>
          
          {/* Page Content */}
          <div className="px-5 pb-10 pt-4">
            <div className="max-w-screen-xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
        
        {/* Global Search */}
        <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Sidebar - Desktop */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          isMobileOpen={false}
          onMobileToggle={() => {}}
        />
      </div>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out w-full",
        isSidebarCollapsed ? "ml-16" : "ml-64"
      )}>
        <Header onMobileMenuToggle={toggleMobileMenu} />
        
        {/* Content Area */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] max-w-full">
          {/* PWA Enhancements */}
          <div className="px-4 sm:px-6 lg:px-8 pt-2">
            <PWAEnhancements />
          </div>
          
          {/* Demo Badge */}
          <div className="px-4 sm:px-6 lg:px-8 pt-2">
            <DemoAccountBadge showExitButton />
          </div>
          
          {/* Breadcrumbs */}
          <div className="px-4 sm:px-6 lg:px-8">
            <NavigationBreadcrumbs />
          </div>
          
          {/* Page Content */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>
        
        {/* Global Search */}
        <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />
        
        {/* Floating Arnold Button */}
        <FloatingArnoldButton />
      </div>
    </div>
  );
};

export default Layout;
