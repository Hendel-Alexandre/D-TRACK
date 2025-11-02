import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/external-client';
import { useAuth } from '@/contexts/AuthContext';

interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
  hasActiveSubscription: boolean;
}

export function useTrialStatus() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isInTrial: false,
    daysRemaining: 0,
    trialEndDate: null,
    hasActiveSubscription: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchTrialStatus();
  }, [user]);

  const fetchTrialStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_mode_settings')
        .select('trial_end_date, plan_type, subscription_status, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching trial status:', error);
        return;
      }

      if (data) {
        const now = new Date();
        const endDate = data.current_period_end
          ? new Date(data.current_period_end)
          : data.trial_end_date
          ? new Date(data.trial_end_date)
          : null;

        const daysRemaining = endDate
          ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        const hasActiveSubscription = data.subscription_status === 'active' || 
                                      data.subscription_status === 'trialing';

        setTrialStatus({
          isInTrial: data.plan_type === 'trial' && daysRemaining > 0,
          daysRemaining: Math.max(0, daysRemaining),
          trialEndDate: endDate,
          hasActiveSubscription,
        });
      }
    } catch (error) {
      console.error('Error in fetchTrialStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...trialStatus,
    loading,
  };
}
