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
  CheckCircleIcon,
  StarIcon,
  Moon,
  Sun,
  Bot,
  Shield,
  Zap,
  ArrowRight,
  Rocket,
} from "lucide-react";

const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);

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
          <div className="flex items-center gap-3">
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent animate-gradient" />
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
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 text-sm font-medium"
          >
            <Rocket className="h-4 w-4" />
            Launching Soon - Join the Waitlist
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-primary"
          >
            AI-Powered Accounting Made Simple
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-gradient-primary/10 rounded-2xl px-6 py-5 mx-auto max-w-2xl backdrop-blur-sm border-2 border-primary/20 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-relaxed">
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
            
            <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
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

      {/* Stats Section */}
      <StatsSection />

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
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10">
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
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 group"
            >
              Get Started Now 
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/pricing")}
              className="text-lg px-8 py-6"
            >
              View Pricing
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-lg sm:text-xl font-bold">Accountant AI</span>
          </div>
          
          {/* Social Media Links */}
          <SocialMediaLinks />
          
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/roadmap" className="story-link">Roadmap</Link>
            <Link to="/pricing" className="story-link">Pricing</Link>
            <Link to="/privacy" className="story-link">Privacy Policy</Link>
            <Link to="/terms" className="story-link">Terms of Service</Link>
            <Link to="/cookies" className="story-link">Cookie Policy</Link>
          </nav>
          <p className="text-muted-foreground text-sm sm:text-base mt-4">© 2025 Accountant AI. All rights reserved.</p>
        </div>
      </footer>


      {/* Video Tutorial */}
      <VideoTutorial 
        isOpen={showVideoTutorial} 
        onClose={() => setShowVideoTutorial(false)}
      />
    </div>
  );
};

export default Landing;
