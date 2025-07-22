
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, BarChart2, Shield, Clock, Bot, Moon, Sun, Menu, X, CheckCircle, Star, ArrowRight, Play } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleGuestAccess = () => {
    // Store guest session flag
    localStorage.setItem('isGuest', 'true');
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary flex items-center">
                <Bot className="h-8 w-8 mr-2" />
                Accountant AI
              </Link>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative"
              >
                {theme === 'dark' ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
              <button
                onClick={toggleMenu}
                className="text-gray-500 focus:outline-none focus:text-primary"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                Pricing
              </a>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative"
              >
                {theme === 'dark' ? (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="transition-all duration-200 hover:scale-105"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/auth?signup=true")}
                className="transition-all duration-200 hover:scale-105"
              >
                Get Started
              </Button>
            </nav>
          </div>
          
          {/* Mobile Navigation */}
          <div className={`mt-4 md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <nav className="flex flex-col space-y-3 pb-4">
              <a
                href="#features"
                className="px-2 py-1 text-sm font-medium rounded hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="px-2 py-1 text-sm font-medium rounded hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className="px-2 py-1 text-sm font-medium rounded hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="px-2 py-1 text-sm font-medium rounded hover:bg-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="pt-2 flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-center transition-all duration-200"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => {
                    navigate("/auth?signup=true");
                    setIsMenuOpen(false);
                  }}
                  className="w-full justify-center transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    AI-Powered
                  </span>{" "}
                  Accounting Made Simple
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                  Let artificial intelligence handle your bookkeeping, tax preparation, and financial reporting automatically.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-finance-positive" />
                  <span>No accounting knowledge required</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth?signup=true")}
                  className="px-8 py-6 text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Start Free Trial
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGuestAccess}
                  className="px-8 py-6 text-lg transition-all duration-200 hover:scale-105"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Try Demo
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1">5.0 (2,400+ reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 animate-scale-in">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 shadow-2xl backdrop-blur-sm border">
                  <div className="bg-background rounded-lg p-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Monthly Overview</h3>
                        <div className="flex items-center text-finance-positive text-sm">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          +12% vs last month
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-finance-positive/10 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-finance-positive">$24,563</div>
                          <div className="text-sm text-muted-foreground">Revenue</div>
                        </div>
                        <div className="bg-finance-negative/10 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-finance-negative">$8,234</div>
                          <div className="text-sm text-muted-foreground">Expenses</div>
                        </div>
                      </div>
                      <div className="h-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded flex items-end justify-between p-2">
                        <div className="bg-primary w-4 h-8 rounded-sm"></div>
                        <div className="bg-primary w-4 h-12 rounded-sm"></div>
                        <div className="bg-primary w-4 h-6 rounded-sm"></div>
                        <div className="bg-primary w-4 h-16 rounded-sm"></div>
                        <div className="bg-primary w-4 h-10 rounded-sm"></div>
                        <div className="bg-primary w-4 h-14 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-finance-highlight text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  AI Generated
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Modern Business</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your finances with the power of artificial intelligence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BarChart2 className="h-8 w-8 text-primary" />,
                title: "Automated Bookkeeping",
                description: "AI automatically categorizes transactions and manages your books with 99.9% accuracy."
              },
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "Smart Tax Planning",
                description: "Automatically calculate tax obligations and optimize deductions year-round."
              },
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: "Real-time Insights",
                description: "Get instant financial forecasts and cash flow predictions powered by machine learning."
              },
              {
                icon: <Bot className="h-8 w-8 text-primary" />,
                title: "AI Financial Assistant",
                description: "Ask questions in plain English and get expert financial advice instantly."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-background p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className="bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in minutes, not hours</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Accounts",
                description: "Securely link your bank accounts, credit cards, and payment processors with enterprise-grade encryption."
              },
              {
                step: "02", 
                title: "AI Does the Work",
                description: "Our advanced AI categorizes transactions, reconciles accounts, and prepares reports automatically."
              },
              {
                step: "03",
                title: "Review & Approve",
                description: "Review AI-generated insights, approve recommendations, and watch your business grow."
              }
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4 animate-fade-in" style={{animationDelay: `${index * 200}ms`}}>
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied businesses</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Small Business Owner",
                content: "Accountant AI saved me 20 hours per month on bookkeeping. The AI is incredibly accurate and the insights are game-changing.",
                rating: 5
              },
              {
                name: "Mike Chen",
                role: "Freelance Consultant", 
                content: "As someone with zero accounting background, this tool has been a lifesaver. Tax season is no longer stressful.",
                rating: 5
              },
              {
                name: "Lisa Rodriguez",
                role: "E-commerce Founder",
                content: "The real-time financial insights helped me make better business decisions and increase profitability by 30%.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-background p-6 rounded-xl shadow-lg animate-fade-in" style={{animationDelay: `${index * 150}ms`}}>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your business needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$9",
                period: "/month",
                description: "Perfect for freelancers and small businesses",
                features: [
                  "AI-powered transaction categorization",
                  "Basic financial reports",
                  "Tax estimation",
                  "Email support",
                  "Up to 100 transactions/month"
                ],
                popular: false
              },
              {
                name: "Professional", 
                price: "$29",
                period: "/month",
                description: "Best for growing businesses",
                features: [
                  "Everything in Starter",
                  "Advanced AI insights & forecasting",
                  "Multi-currency support",
                  "API integrations",
                  "Priority support",
                  "Unlimited transactions"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "$99",
                period: "/month", 
                description: "For large organizations",
                features: [
                  "Everything in Professional",
                  "Custom AI model training",
                  "Dedicated account manager",
                  "Advanced security & compliance",
                  "Custom integrations",
                  "24/7 phone support"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative rounded-xl p-8 transition-all duration-300 hover:scale-105 ${plan.popular ? 'border-2 border-primary shadow-xl bg-primary/5' : 'border border-border bg-background shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-finance-positive mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate("/auth?signup=true")}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Accounting?</h2>
            <p className="text-xl opacity-90">Join thousands of businesses using AI to simplify their finances</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => navigate("/auth?signup=true")}
                className="px-8 py-6 text-lg transition-all duration-200 hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleGuestAccess}
                className="px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
              >
                Try Demo First
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <Bot className="h-8 w-8 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">Accountant AI</span>
              </div>
              <p className="text-muted-foreground max-w-xs">
                Revolutionizing accounting with artificial intelligence for businesses of all sizes.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Accountant AI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
