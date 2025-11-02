import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, GraduationCap, Briefcase, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useOnboarding';
import { useMode } from '@/contexts/ModeContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/external-client';

export default function PlanManagement() {
  const { user } = useAuth();
  const { trialDaysRemaining, isTrialActive, planType } = useTrialStatus();
  const { mode } = useMode();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'student',
      name: 'Student Plan',
      price: '$9.99',
      icon: <GraduationCap className="h-6 w-6" />,
      features: [
        'Class scheduling & calendar',
        'Assignment tracking',
        'File storage & organization',
        'Study analytics',
        'Priority support',
      ],
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: '$14.99',
      icon: <Briefcase className="h-6 w-6" />,
      features: [
        'Project management',
        'Task tracking & analytics',
        'Time tracking',
        'Team collaboration',
        'Advanced reporting',
      ],
    },
    {
      id: 'combined',
      name: 'Combined Plan',
      price: '$19.99',
      icon: <Zap className="h-6 w-6" />,
      badge: 'Best Value',
      features: [
        'All Student features',
        'All Professional features',
        'Seamless mode switching',
        'Priority support',
        'Early access to new features',
      ],
      highlighted: true,
    },
  ];

  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    setSelectedPlan(planId);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Plan Management</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your needs
        </p>
      </div>

      {/* Current Plan Status */}
      {isTrialActive && (
        <Card className="p-6 border-primary">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Active Trial</h3>
              <p className="text-muted-foreground">
                {trialDaysRemaining !== null
                  ? `${trialDaysRemaining} days remaining in your free trial`
                  : 'Trial active'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Upgrade now to continue using all features after your trial ends.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Plan Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card
              className={`p-6 relative ${
                plan.highlighted
                  ? 'border-2 border-primary shadow-lg'
                  : 'border'
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {plan.badge}
                </Badge>
              )}

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>

                  <div>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm text-muted-foreground font-normal">
                        /month
                      </span>
                    </div>
                    {isTrialActive && (
                      <p className="text-sm text-muted-foreground mt-1">
                        After trial ends
                      </p>
                    )}
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  size="lg"
                  disabled={loading && selectedPlan === plan.id}
                >
                  {loading && selectedPlan === plan.id 
                    ? 'Processing...' 
                    : planType === 'trial' ? 'Upgrade Now' : 'Switch Plan'}
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">Can I switch plans anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! You can upgrade, downgrade, or switch between plans at any time.
              Changes will be reflected in your next billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What happens to my data if I switch modes?</h4>
            <p className="text-sm text-muted-foreground">
              All your data remains safe and accessible. Switching between Student
              and Professional modes doesn't affect your stored information.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Can I cancel my subscription?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel anytime. You'll continue to have access until the
              end of your billing period.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}