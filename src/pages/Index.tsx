import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Clock, TrendingUp, Users, Calendar, Zap, Shield, BarChart } from "lucide-react";
import { Link } from "react-router-dom";
import datatrackLogo from '@/assets/datatrack-logo.png';
import SimpleBackground from '@/components/3D/SimpleBackground';

const Index = () => {
  const features = [
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Track every minute with precision. Know exactly where your time goes."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Intelligent calendar integration that adapts to your workflow."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with real-time updates and messaging."
    },
    {
      icon: BarChart,
      title: "Detailed Reports",
      description: "Get insights with comprehensive analytics and visual reports."
    },
    {
      icon: Zap,
      title: "AI Assistant",
      description: "Darvis AI helps automate tasks and boost your productivity."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security keeps your data safe and compliant."
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500K+", label: "Hours Tracked" },
    { value: "99.9%", label: "Uptime" },
    { value: "50+", label: "Countries" }
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* 3D Background Effect */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <SimpleBackground />
      </div>
      
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 relative">
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
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Now with AI-Powered Insights
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Transform chaos into
            <span className="text-gradient block mt-2">productivity</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop losing time to scattered tools and manual tracking. D-Track brings everything together in one intelligent workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/signup">
              <Button size="lg" className="gap-2 text-base px-8">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-8">
              Watch Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="relative rounded-xl border bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground">D-Track Dashboard</span>
              </div>
            </div>
            <img 
              src="/placeholder.svg" 
              alt="D-Track Dashboard" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4">The Problem</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Time management shouldn't be <span className="text-destructive">this hard</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Teams waste countless hours switching between tools, manually tracking time, and struggling to stay organized.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-6 space-y-3 border-destructive/20">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-lg">Scattered Tools</h3>
            <p className="text-sm text-muted-foreground">
              Jumping between multiple apps wastes time and creates confusion across your team.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-destructive/20">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <BarChart className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-lg">No Visibility</h3>
            <p className="text-sm text-muted-foreground">
              Without clear insights, you can't identify bottlenecks or optimize workflows effectively.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-destructive/20">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="font-semibold text-lg">Poor Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Team members work in silos, missing deadlines and duplicating effort.
            </p>
          </Card>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solutions" className="bg-muted/30 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">The Solution</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              One platform for <span className="text-gradient">complete productivity</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              D-Track unifies time tracking, task management, and team collaboration into a single, intelligent workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 space-y-4 hover:shadow-lg transition-shadow card-hover">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <Badge variant="outline">Powerful Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need to stay productive
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Automatic Time Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    No manual entry needed. D-Track automatically captures time spent on tasks.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">Real-time Collaboration</h4>
                  <p className="text-sm text-muted-foreground">
                    Chat, share files, and work together seamlessly with your team.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-1">AI-Powered Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    Darvis AI analyzes patterns and suggests optimizations for better productivity.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-3xl" />
            <Card className="relative p-8">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-24 w-24 text-primary" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the plan that's right for your team. All plans include a 7-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="p-8 space-y-6 border-2">
            <div>
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground">Perfect for individuals</p>
            </div>
            <div>
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Up to 3 projects</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Basic time tracking</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Task management</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">1 team member</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Basic reports</span>
              </li>
            </ul>
            <Link to="/signup" className="block">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 space-y-6 border-primary border-2 relative shadow-lg scale-105">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
            <div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground">For growing teams</p>
            </div>
            <div>
              <span className="text-4xl font-bold">$12</span>
              <span className="text-muted-foreground">/month per user</span>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Unlimited projects</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Advanced time tracking</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">AI-powered insights</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Up to 10 team members</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Advanced analytics</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Custom integrations</span>
              </li>
            </ul>
            <Link to="/signup" className="block">
              <Button className="w-full">Start Free Trial</Button>
            </Link>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-8 space-y-6 border-2">
            <div>
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground">For large organizations</p>
            </div>
            <div>
              <span className="text-4xl font-bold">Custom</span>
            </div>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Everything in Pro</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Unlimited team members</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Dedicated account manager</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Custom integrations</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">SLA guarantee</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">On-premise option</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                <span className="text-sm">Advanced security</span>
              </li>
            </ul>
            <Link to="/enterprise-contact">
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </Link>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
          All plans include 7-day free trial • No credit card required • Cancel anytime
        </p>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10" />
          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to boost your productivity?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of teams already using D-Track to work smarter, not harder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-base px-8">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base px-8">
                Schedule Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
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
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
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
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <img 
                src={datatrackLogo} 
                alt="D-Track" 
                className="h-8 w-auto dark:invert"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 D-Track. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;