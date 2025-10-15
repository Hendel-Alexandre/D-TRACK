import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  Calendar, 
  Zap, 
  Shield, 
  BarChart,
  Brain,
  Globe,
  FileText,
  MessageSquare,
  Target,
  Activity,
  ChevronDown,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import datatrackLogo from '@/assets/datatrack-logo.png';
import demoVideo from '@/assets/demo-video.mp4';
import Orb from '@/components/3D/Orb';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const Index = () => {
  const hero = useScrollAnimation();
  const stats = useScrollAnimation();
  const problem = useScrollAnimation();
  const solution = useScrollAnimation();
  const featuresHighlight = useScrollAnimation();
  const pricing = useScrollAnimation();
  const finalCta = useScrollAnimation();

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navigation */}
      <nav className="border-b border-border/30 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={datatrackLogo} 
              alt="D-Track" 
              className="h-12 w-auto dark:invert"
            />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hover:bg-secondary/50">Login</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-2 bg-gradient-primary hover:opacity-90 rounded-xl">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 md:pb-24">
        <div className="absolute inset-0 z-0 top-16">
          <Orb 
            hue={0}
            hoverIntensity={0.2}
            rotateOnHover={true}
            forceHoverState={false}
          />
        </div>
        
        <div 
          ref={hero.ref}
          className={`container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 relative z-10 transition-all duration-1000 ${
            hero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="mb-4 animate-fade-in">
              <Zap className="h-3 w-3 mr-1" />
              Now with AI-Powered Insights
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Boost Productivity with
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block mt-2">AI-Powered Time Tracking</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your workflow with intelligent time management
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-base px-8 rounded-xl shadow-lg hover:shadow-xl bg-gradient-primary transition-all">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              7-day free trial • No credit card required • Cancel anytime
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <Card className="glass-effect border-border/30 backdrop-blur-xl overflow-hidden shadow-2xl hover:shadow-glow transition-all duration-500 rounded-3xl">
              <div className="p-2">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto rounded-2xl"
                >
                  <source src={demoVideo} type="video/mp4" />
                </video>
              </div>
            </Card>
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex justify-center mt-12 animate-bounce">
            <ChevronDown className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={stats.ref}
        className={`border-y border-border/50 bg-secondary/30 py-16 transition-all duration-1000 delay-200 ${
          stats.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                <AnimatedCounter end={200} suffix="+" />
              </div>
              <div className="text-sm text-muted-foreground font-medium">Active Users</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                <AnimatedCounter end={500} suffix="K+" />
              </div>
              <div className="text-sm text-muted-foreground font-medium">Hours Tracked</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-primary">
                <AnimatedCounter end={99} suffix=".9%" />
              </div>
              <div className="text-sm text-muted-foreground font-medium">Uptime</div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center text-4xl md:text-5xl font-bold text-primary">
                <Globe className="h-10 w-10 mr-2" />
              </div>
              <div className="text-sm text-muted-foreground font-medium">Worldwide Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section 
        ref={problem.ref}
        className="container mx-auto px-4 py-20 md:py-32"
      >
        <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-1000 ${
          problem.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="mb-4">The Problem</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Why Time Management Still Fails
          </h2>
          <p className="text-xl text-muted-foreground">
            Traditional tools create more problems than they solve
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { icon: X, title: 'Scattered Tools', description: 'Switching between apps creates confusion and lost time.' },
            { icon: BarChart, title: 'No Visibility', description: 'Without insights, it\'s hard to optimize or manage workflows.' },
            { icon: Users, title: 'Poor Collaboration', description: 'Silos slow down progress and duplicate effort.' }
          ].map((item, index) => (
            <Card 
              key={index}
              className={`p-8 space-y-4 border-2 border-destructive/20 bg-destructive/5 hover:shadow-lg transition-all duration-500 ${
                problem.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="h-14 w-14 rounded-xl bg-destructive/10 flex items-center justify-center">
                <item.icon className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="font-bold text-xl">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Solution Section */}
      <section 
        ref={solution.ref}
        id="solutions" 
        className="bg-secondary/20 py-16 md:py-24"
      >
        <div className="container mx-auto px-4">
          <div className={`max-w-3xl mx-auto text-center mb-12 transition-all duration-1000 ${
            solution.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Badge variant="outline" className="mb-4">The Solution</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              A Smarter Way to Work
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need in one intelligent platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Clock, title: 'Time Tracking', description: 'Automatic time capture with intelligent categorization and insights.' },
              { icon: Calendar, title: 'Smart Scheduling', description: 'AI-powered calendar that adapts to your workflow patterns.' },
              { icon: MessageSquare, title: 'Team Collaboration', description: 'Real-time messaging, file sharing, and project coordination.' },
              { icon: FileText, title: 'Detailed Reports', description: 'Comprehensive analytics with customizable dashboards and exports.' },
              { icon: Brain, title: 'Darvis AI Assistant', description: 'Intelligent automation that learns from your work patterns.' },
              { icon: Shield, title: 'Secure & Private', description: 'Enterprise-grade security with full data encryption and compliance.' }
            ].map((feature, index) => (
              <Card 
                key={index}
                className={`card-modern border-0 space-y-4 hover:shadow-premium transition-all duration-500 ${
                  solution.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section 
        ref={featuresHighlight.ref}
        id="features" 
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div className={`text-center mb-12 transition-all duration-1000 ${
          featuresHighlight.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="mb-4">Powerful Features</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything You Need to Stay Productive
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            { 
              icon: Target, 
              title: 'Automatic Time Tracking', 
              description: 'No manual entry needed. D-Track intelligently captures time spent on every task and project, giving you complete visibility into where your hours go.',
              gradient: 'from-primary/20 to-blue-500/20'
            },
            { 
              icon: Users, 
              title: 'Real-time Team Collaboration', 
              description: 'Chat, share files, assign tasks, and coordinate projects seamlessly. Keep everyone aligned with instant updates and notifications.',
              gradient: 'from-purple-500/20 to-pink-500/20'
            },
            { 
              icon: Brain, 
              title: 'AI-Powered Insights', 
              description: 'Darvis AI analyzes your work patterns, identifies bottlenecks, and suggests optimizations to help you work smarter, not harder.',
              gradient: 'from-green-500/20 to-teal-500/20'
            },
            { 
              icon: BarChart, 
              title: 'Custom Reports & Dashboards', 
              description: 'Build beautiful reports with drag-and-drop simplicity. Track KPIs, generate client invoices, and export data in any format.',
              gradient: 'from-orange-500/20 to-red-500/20'
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              className={`card-modern border-0 space-y-4 hover:shadow-premium transition-all duration-500 ${
                featuresHighlight.isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${index % 2 === 0 ? '-translate-x-10' : 'translate-x-10'}`
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center backdrop-blur-sm`}>
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-2xl">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        ref={pricing.ref}
        id="pricing" 
        className="container mx-auto px-4 py-16 md:py-24"
      >
        <div className={`max-w-3xl mx-auto text-center mb-12 transition-all duration-1000 ${
          pricing.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that's right for your team
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card 
            className={`card-modern p-8 space-y-6 border-0 transition-all duration-700 ${
              pricing.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div>
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground">Perfect for individuals</p>
            </div>
            <div>
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
              {['Up to 3 projects', 'Basic time tracking', 'Task management', '1 team member', 'Basic reports'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="block">
              <Button variant="outline" className="w-full rounded-xl border-border/50 hover:bg-secondary/50">Start Free Trial</Button>
            </Link>
          </Card>

          {/* Pro Plan */}
          <Card 
            className={`card-modern p-8 space-y-6 border-2 border-primary relative shadow-xl scale-105 transition-all duration-700 delay-100 ${
              pricing.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
            <div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground">For growing teams</p>
            </div>
            <div>
              <span className="text-5xl font-bold">$20</span>
              <span className="text-muted-foreground">/month per user</span>
            </div>
            <ul className="space-y-3">
              {['Unlimited projects', 'Advanced time tracking', 'AI-powered insights', 'Up to 10 team members', 'Priority support'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="block">
              <Button className="w-full rounded-xl shadow-lg bg-gradient-primary hover:opacity-90">Start Free Trial</Button>
            </Link>
          </Card>

          {/* Premium Plan */}
          <Card 
            className={`card-modern p-8 space-y-6 border-0 transition-all duration-700 delay-200 ${
              pricing.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div>
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-muted-foreground">For large organizations</p>
            </div>
            <div>
              <span className="text-5xl font-bold">$50</span>
              <span className="text-muted-foreground">/month per user</span>
            </div>
            <ul className="space-y-3">
              {['Everything in Pro', 'Unlimited team members', 'Dedicated account manager', 'SLA guarantee', 'Enhanced security'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="block">
              <Button variant="outline" className="w-full rounded-xl border-border/50 hover:bg-secondary/50">Subscribe Now</Button>
            </Link>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          7-day free trial • No credit card required • Cancel anytime
        </p>
      </section>

      {/* Final CTA Section */}
      <section 
        ref={finalCta.ref}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500" />
        <div className="absolute inset-0 opacity-20">
          <Orb 
            hue={0}
            hoverIntensity={0.2}
            rotateOnHover={true}
            forceHoverState={false}
          />
        </div>
        
        <div className={`container mx-auto px-4 py-20 md:py-32 relative z-10 transition-all duration-1000 ${
          finalCta.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Ready to Boost Your Team's Productivity?
            </h2>
            <p className="text-xl text-white/90">
              Join 200+ users worldwide already working smarter with D-Track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="gap-2 text-base px-8 rounded-xl shadow-xl hover:scale-105 transition-transform">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8 rounded-xl bg-white/10 text-white border-white/30 hover:bg-white/20">
                Subscribe for Updates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 D-Track. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
