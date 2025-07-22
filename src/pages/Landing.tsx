
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";
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

  const features = [
    {
      icon: <CalculatorIcon className="h-8 w-8 text-primary" />,
      title: "Smart Calculations",
      description: "AI-powered calculations for complex financial scenarios with instant accuracy.",
    },
    {
      icon: <FileTextIcon className="h-8 w-8 text-primary" />,
      title: "Tax Preparation",
      description: "Automated tax filing and preparation with real-time compliance checking.",
    },
    {
      icon: <PieChartIcon className="h-8 w-8 text-primary" />,
      title: "Financial Reports",
      description: "Generate comprehensive financial reports with beautiful visualizations.",
    },
    {
      icon: <TrendingUpIcon className="h-8 w-8 text-primary" />,
      title: "Business Analytics",
      description: "Track performance trends and get actionable insights for growth.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Compliant",
      description: "Bank-level security with full compliance to financial regulations.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
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
      <header className="border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Accountant AI</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI-Powered Accounting
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Transform your financial management with intelligent automation, real-time insights, and seamless tax preparation.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 transform hover:scale-105 transition-all duration-200">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 transform hover:scale-105 transition-all duration-200">
                Continue as Guest
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to manage your finances efficiently</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in minutes with our simple process</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload Your Data", description: "Import transactions, receipts, and financial documents with one click." },
              { step: "2", title: "AI Analysis", description: "Our AI automatically categorizes and analyzes your financial data." },
              { step: "3", title: "Get Insights", description: "Receive actionable insights, reports, and automated tax preparations." },
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4 animate-scale-in">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Transform Your Finances?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of businesses already using Accountant AI to streamline their financial operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Today
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bot className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Accountant AI</span>
          </div>
          <p className="text-muted-foreground">© 2025 Accountant AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
