import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  gracePeriodDays?: number;
}

export function SubscriptionGuard({ 
  children, 
  fallback,
  gracePeriodDays = 3 
}: SubscriptionGuardProps) {
  const subscription = useSubscription();
  const navigate = useNavigate();

  if (subscription.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Allow access during trial or active subscription
  if (subscription.hasAccess) {
    return <>{children}</>;
  }

  // Grace period - show warning but allow access
  if (subscription.daysRemaining >= -gracePeriodDays) {
    return (
      <div className="space-y-4">
        <Card className="border-yellow-500 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-900 dark:text-yellow-100">
                Trial Expired
              </CardTitle>
            </div>
            <CardDescription>
              Your trial has ended. You have {gracePeriodDays + subscription.daysRemaining} days 
              of grace period remaining. Subscribe now to continue using all features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/plan-management')}>
              View Plans & Subscribe
            </Button>
          </CardContent>
        </Card>
        {children}
      </div>
    );
  }

  // No access - show upgrade screen
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Subscription Required</CardTitle>
          <CardDescription>
            Your trial has ended. Subscribe to a plan to continue accessing this feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Unlimited access to all features</p>
            <p>✓ Priority support</p>
            <p>✓ Regular updates and improvements</p>
            <p>✓ Cancel anytime</p>
          </div>
          <Button 
            onClick={() => navigate('/plan-management')} 
            className="w-full"
            size="lg"
          >
            View Plans & Subscribe
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
