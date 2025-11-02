import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/external-client';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionStatus {
  isActive: boolean;
  isTrialing: boolean;
  isPastDue: boolean;
  isCanceled: boolean;
  daysRemaining: number;
  currentPeriodEnd: Date | null;
  planType: string;
  subscriptionStatus: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    isTrialing: true,
    isPastDue: false,
    isCanceled: false,
    daysRemaining: 0,
    currentPeriodEnd: null,
    planType: 'trial',
    subscriptionStatus: 'trialing',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchSubscriptionStatus();
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_mode_settings')
        .select('subscription_status, current_period_end, plan_type, trial_end_date')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription status:', error);
        return;
      }

      if (data) {
        const now = new Date();
        const periodEnd = data.current_period_end
          ? new Date(data.current_period_end)
          : data.trial_end_date
          ? new Date(data.trial_end_date)
          : null;

        const daysRemaining = periodEnd
          ? Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        setStatus({
          isActive: data.subscription_status === 'active',
          isTrialing: data.subscription_status === 'trialing' || data.plan_type === 'trial',
          isPastDue: data.subscription_status === 'past_due',
          isCanceled: data.subscription_status === 'canceled',
          daysRemaining: Math.max(0, daysRemaining),
          currentPeriodEnd: periodEnd,
          planType: data.plan_type || 'trial',
          subscriptionStatus: data.subscription_status || 'trialing',
        });
      }
    } catch (error) {
      console.error('Error in fetchSubscriptionStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...status,
    loading,
    hasAccess: status.isActive || status.isTrialing,
    needsUpgrade: !status.isActive && !status.isTrialing && status.daysRemaining <= 0,
    refetch: fetchSubscriptionStatus,
  };
}
