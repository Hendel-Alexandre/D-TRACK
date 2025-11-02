import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, AlertCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/external-client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function BillingDashboard() {
  const subscription = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscription.loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (subscription.isActive) {
      return <Badge variant="default">Active</Badge>;
    }
    if (subscription.isTrialing) {
      return <Badge variant="secondary">Trial</Badge>;
    }
    if (subscription.isPastDue) {
      return <Badge variant="destructive">Past Due</Badge>;
    }
    if (subscription.isCanceled) {
      return <Badge variant="outline">Canceled</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getPlanName = () => {
    switch (subscription.planType) {
      case 'student':
        return 'Student Plan';
      case 'professional':
        return 'Professional Plan';
      case 'combined':
        return 'Combined Plan';
      default:
        return 'Trial Plan';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription & Billing</CardTitle>
            <CardDescription>Manage your subscription and payment details</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Current Plan</span>
            </div>
            <p className="text-lg font-semibold">{getPlanName()}</p>
          </div>

          {subscription.currentPeriodEnd && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{subscription.isTrialing ? 'Trial Ends' : 'Next Billing Date'}</span>
              </div>
              <p className="text-lg font-semibold">
                {subscription.currentPeriodEnd.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {subscription.isPastDue && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm">
              Your payment failed. Please update your payment method to continue using premium features.
            </p>
          </div>
        )}

        {subscription.isTrialing && subscription.daysRemaining <= 7 && (
          <div className="flex items-center gap-2 p-4 bg-yellow-500/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm">
              Your trial ends in {subscription.daysRemaining} {subscription.daysRemaining === 1 ? 'day' : 'days'}. 
              Subscribe now to continue accessing premium features.
            </p>
          </div>
        )}

        {(subscription.isActive || subscription.isTrialing) && (
          <Button
            onClick={handleManageBilling}
            disabled={loading}
            className="w-full"
            variant="outline"
          >
            {loading ? "Loading..." : "Manage Billing & Payment Methods"}
          </Button>
        )}

        {subscription.needsUpgrade && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your trial has expired. Upgrade to continue using premium features.
            </p>
            <Button className="w-full" asChild>
              <a href="/plan-management">View Plans & Upgrade</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
