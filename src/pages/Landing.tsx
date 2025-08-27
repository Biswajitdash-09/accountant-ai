
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { seedDemoData } from "@/utils/demoData";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import DemoTutorial from "@/components/DemoTutorial";
import {
  CalculatorIcon,
  FileTextIcon,
  PieChartIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  StarIcon,
  Moon,
  Sun,
  Bot,
  Shield,
  Zap,
} from "lucide-react";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Show tutorial for first-time visitors
    const hasSeenTutorial = localStorage.getItem('demoTutorialCompleted');
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 2000); // Show tutorial after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDemoMode = async () => {
    try {
      setIsDemoLoading(true);
      console.log('Starting demo mode from landing page...');
      
      // Clear any existing auth state first
      localStorage.removeItem('sb-erqisavlnwynkyfvnltb-auth-token');
      
      // Set demo mode
      localStorage.setItem('isGuest', 'true');
      
      // Seed demo data
      await seedDemoData();
      
      console.log('Demo data seeded, isGuest set to:', localStorage.getItem('isGuest'));
      
      toast({
        title: "Demo Mode Active",
        description: "You're now exploring Accountant AI with sample data!",
      });
      
      console.log('Demo mode setup complete, navigating to dashboard');
      
      // Force page reload to ensure demo state is properly recognized
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error setting up demo mode:', error);
      toast({
        title: "Error",
        description: "Failed to set up demo mode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDemoLoading(false);
    }
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      content: "Accountant AI has revolutionized how I manage my finances. What used to take hours now takes minutes!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Freelance Consultant",
      content: "The tax preparation feature saved me thousands in accountant fees. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "E-commerce Manager",
      content: "The analytics dashboard gives me insights I never had before. It's like having a CFO on demand.",
      rating: 5,
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
            <Link to="/auth" className="hidden sm:inline-block">
              <Button variant="outline" size="sm" className="hover-scale transition-all duration-200">
                Sign In
              </Button>
            </Link>
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
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Important Disclaimer</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-200 leading-relaxed">
                This is an AI accounting assistant tool. It cannot provide financial advice or be held liable for financial decisions. 
                By using this tool, you agree to the{" "}
                <Link to="/terms" className="underline hover:text-yellow-900 dark:hover:text-yellow-100">
                  Terms of Use
                </Link>
                . Always consult with qualified professionals for important financial decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-tight">
              AI-Powered Accounting
            </h1>
            <div className="bg-gradient-primary/10 rounded-xl px-6 py-4 mx-4 max-w-2xl mx-auto backdrop-blur-sm border border-primary/20">
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">
                "Accounting made easy, accounting in your pocket."
              </p>
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto px-4">
              Transform your financial management with intelligent automation, real-time insights, and seamless tax preparation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-slide-up px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover-scale transition-all duration-200 min-h-[44px]"
              >
                Start Free Trial
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleDemoMode}
              disabled={isDemoLoading}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover-scale transition-all duration-200 min-h-[44px]"
            >
              {isDemoLoading ? "Loading Demo..." : "Try Demo"}
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => setShowTutorial(true)}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 hover-scale transition-all duration-200 min-h-[44px]"
            >
              Watch Tutorial
            </Button>
          </div>
        </div>
      </section>

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

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">What Our Users Say</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Join thousands of satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-base sm:text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Ready to Transform Your Finances?</h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            Join thousands of businesses already using Accountant AI to streamline their financial operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 min-h-[44px]"
              >
                Get Started Today
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleDemoMode}
              disabled={isDemoLoading}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 min-h-[44px]"
            >
              {isDemoLoading ? "Loading Demo..." : "Try Demo"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold">Accountant AI</span>
          </div>
          <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/roadmap" className="story-link">Roadmap</Link>
            <Link to="/pricing" className="story-link">Pricing</Link>
            <Link to="/privacy" className="story-link">Privacy Policy</Link>
            <Link to="/terms" className="story-link">Terms of Service</Link>
            <Link to="/cookies" className="story-link">Cookie Policy</Link>
          </nav>
          <p className="text-muted-foreground text-sm sm:text-base mt-4">© 2025 Accountant AI. All rights reserved.</p>
        </div>
      </footer>

      {/* Demo Tutorial */}
      <DemoTutorial 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
      />
    </div>
  );
};

export default Landing;
