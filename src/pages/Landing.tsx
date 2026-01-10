import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoTutorial from "@/components/VideoTutorial";
import { SocialMediaLinks } from "@/components/SocialMediaLinks";
import { StatsSection } from "@/components/landing/StatsSection";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { EnhancedTestimonials } from "@/components/landing/EnhancedTestimonials";
import { WaitlistForm } from "@/components/landing/WaitlistForm";
import { WaitlistCounter } from "@/components/landing/WaitlistCounter";
import { motion } from "framer-motion";
import {
  CalculatorIcon,
  FileTextIcon,
  PieChartIcon,
  TrendingUpIcon,
  Moon,
  Sun,
  Bot,
  Shield,
  Zap,
  ArrowRight,
  Rocket,
  Fingerprint,
  ScanFace,
} from "lucide-react";
import { useBiometric } from "@/contexts/BiometricContext";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);
  const { isAvailable, isEnabled, platform, capabilities } = useBiometric();

  const handleBiometricSignIn = () => {
    navigate("/auth?biometric=true");
  };

  const handleGetStartedWithBiometric = () => {
    // Navigate to auth with signup and biometric setup intent
    navigate("/auth?signup=true");
  };

  const handleGetStarted = () => {
    navigate("/auth");
  };

  // Get the appropriate icon for the biometric button
  const getBiometricIcon = () => {
    if (capabilities.biometricIcon === 'face') {
      return <ScanFace className="h-8 w-8 text-primary" />;
    }
    if (capabilities.biometricIcon === 'both') {
      return (
        <div className="flex items-center gap-1">
          <Fingerprint className="h-6 w-6 text-primary" />
          <ScanFace className="h-6 w-6 text-primary" />
        </div>
      );
    }
    return <Fingerprint className="h-8 w-8 text-primary" />;
  };

  // Get the header quick sign-in icon
  const getQuickSignInIcon = () => {
    if (capabilities.biometricIcon === 'face') {
      return <ScanFace className="h-4 w-4" />;
    }
    return <Fingerprint className="h-4 w-4" />;
  };

  // Get description text for biometric section
  const getBiometricDescription = () => {
    if (isEnabled) {
      return `Use your ${capabilities.biometricLabel.toLowerCase()} to sign in instantly`;
    }
    
    if (platform.isMobile) {
      return 'Set up fingerprint or face recognition for faster, more secure access';
    }
    
    if (platform.os === 'Windows') {
      return 'Set up Windows Hello face recognition for faster, more secure access';
    }
    
    if (platform.os === 'macOS') {
      return 'Set up Touch ID for faster, more secure access';
    }
    
    return 'Set up biometric authentication for faster, more secure access';
  };

  const features = [
    {
      icon: <CalculatorIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Smart Calculations",
      description: "AI-powered calculations for complex financial scenarios with instant accuracy.",
    },
    {
      icon: <FileTextIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Tax Preparation",
      description: "Automated tax filing and preparation with real-time compliance checking.",
    },
    {
      icon: <PieChartIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Financial Reports",
      description: "Generate comprehensive financial reports with beautiful visualizations.",
    },
    {
      icon: <TrendingUpIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Business Analytics",
      description: "Track performance trends and get actionable insights for growth.",
    },
    {
      icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Secure & Compliant",
      description: "Bank-level security with full compliance to financial regulations.",
    },
    {
      icon: <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />,
      title: "Lightning Fast",
      description: "Process thousands of transactions in seconds with AI optimization.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Accountant AI</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 sm:h-9 sm:w-9 hover-scale transition-all duration-200"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            {/* Biometric Sign-in CTA - Show if user has set up biometrics */}
            {isEnabled && (
              <Button
                onClick={handleBiometricSignIn}
                size="sm"
                className="hidden sm:inline-flex items-center gap-2 hover-scale transition-all duration-200 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {getQuickSignInIcon()}
                Quick Sign-in
              </Button>
            )}
            
            <Link to="/auth" className="hidden sm:inline-block">
              <Button variant="outline" size="sm" className="hover-scale transition-all duration-200">
                Sign In
              </Button>
            </Link>
            {/* Mobile Biometric Quick Sign-in */}
            {isEnabled && (
              <Button
                onClick={handleBiometricSignIn}
                size="icon"
                className="sm:hidden h-9 w-9 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {getQuickSignInIcon()}
              </Button>
            )}
            
            <Link to="/auth">
              <Button size="sm" className="hover-scale transition-all duration-200">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Legal Disclaimer */}
      <section className="py-6 px-4 sm:px-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Important Disclaimer</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-200 leading-relaxed">
                This is an AI accounting assistant tool. By using this tool, you agree to the{" "}
                <Link to="/terms" className="underline hover:text-yellow-900 dark:hover:text-yellow-100">
                  Terms of Use
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section with Waitlist */}
      <section className="text-center py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 animate-gradient" style={{ background: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.05), transparent)' }} />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium bg-primary/15 text-primary border border-primary/30"
          >
            <Rocket className="h-4 w-4" />
            Launching Soon - Join the Waitlist
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent"
          >
            AI-Powered Accounting Made Simple
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="rounded-2xl px-6 py-5 mx-auto max-w-2xl backdrop-blur-sm border-2 border-purple-500/30 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-to-br from-primary/10 to-purple-500/10"
          >
            <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed text-purple-500 dark:text-purple-400">
              "Accounting made easy, accounting in your pocket."
            </p>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mt-6 mb-4"
          >
            Transform your financial management with intelligent automation, real-time insights, and expert guidance.
          </motion.p>

          {/* Waitlist Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="my-12 space-y-6"
          >
            <WaitlistCounter />
            
            <div className="backdrop-blur-xl rounded-2xl p-8 max-w-3xl mx-auto shadow-lg bg-card/90 border border-border">
              <h3 className="text-2xl font-bold mb-3">Be Among the First to Experience the Future</h3>
              <p className="text-muted-foreground mb-6">
                Join the waitlist and get exclusive early access with special launch benefits
              </p>
              
              <WaitlistForm />
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  "✨ 30% launch discount",
                  "🎁 100 bonus AI credits",
                  "🏆 Priority support",
                  "📞 Personal onboarding"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-left">
                    <span className="text-lg">{benefit.split(' ')[0]}</span>
                    <span>{benefit.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Biometric Quick Access Section - Only show if available */}
          {isAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="my-8"
            >
              <div 
                className="backdrop-blur-xl rounded-2xl p-6 max-w-md mx-auto border border-primary/30 cursor-pointer hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-primary/15 to-purple-500/15"
                onClick={isEnabled ? handleBiometricSignIn : handleGetStartedWithBiometric}
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-primary/20">
                    {getBiometricIcon()}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {isEnabled ? "Quick Sign-in Available" : `Enable ${capabilities.biometricLabel}`}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {getBiometricDescription()}
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    isEnabled ? handleBiometricSignIn() : handleGetStartedWithBiometric();
                  }}
                >
                  {isEnabled ? (
                    <>
                      {getQuickSignInIcon()}
                      <span className="ml-2">Sign in with {capabilities.biometricLabel}</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Get Started & Enable
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setShowVideoTutorial(true)}
              className="text-lg px-8 py-6"
            >
              Watch Tutorial
            </Button>
          </motion.div>
        </motion.div>
      </section>


      {/* Trust Badges */}

      {/* Trust Badges */}
      <TrustBadges />

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Powerful Features</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Everything you need to manage your finances efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full"
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Get started in minutes with our simple process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                step: "1", 
                title: "Upload Your Data", 
                description: "Import transactions, receipts, and financial documents with one click." 
              },
              { 
                step: "2", 
                title: "AI Analysis", 
                description: "Our AI automatically categorizes and analyzes your financial data." 
              },
              { 
                step: "3", 
                title: "Get Insights", 
                description: "Receive actionable insights, reports, and automated tax preparations." 
              },
            ].map((item, index) => (
              <div key={index} className="text-center space-y-3 sm:space-y-4 animate-scale-in">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed px-4">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <EnhancedTestimonials />

      {/* Comparison Section */}
      <ComparisonSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.1))' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Financial Management?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of businesses already using Accountant AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowVideoTutorial(true)}
              className="text-lg px-8 py-6"
            >
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-bold">Accountant AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered accounting solutions for modern businesses.
              </p>
              <SocialMediaLinks />
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Get Started</Link></li>
                <li><Link to="/roadmap" className="hover:text-foreground transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/developer-docs" className="hover:text-foreground transition-colors">API Docs</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Accountant AI. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Tutorial Modal */}
      <VideoTutorial isOpen={showVideoTutorial} onClose={() => setShowVideoTutorial(false)} />
    </div>
  );
};

export default Landing;
