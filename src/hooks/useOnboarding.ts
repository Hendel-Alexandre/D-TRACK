import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/external-client';
import { useAuth } from '@/contexts/AuthContext';

export function useOnboarding() {
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setNeedsOnboarding(false);
        setLoading(false);
        return;
      }

      try {
        const { data: settings, error } = await supabase
          .from('user_mode_settings' as any)
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(!(settings as any)?.onboarding_completed);
        }
      } catch (error) {
        console.error('Error in onboarding check:', error);
        setNeedsOnboarding(true);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  return { needsOnboarding, loading };
}

export function useTrialStatus() {
  const { user } = useAuth();
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [planType, setPlanType] = useState<string>('trial');

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user) return;

      try {
        const { data: settings } = await supabase
          .from('user_mode_settings' as any)
          .select('trial_end_date, plan_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (settings) {
          const settingsData = settings as any;
          setPlanType(settingsData.plan_type || 'trial');
          
          if (settingsData.trial_end_date && settingsData.plan_type === 'trial') {
            const endDate = new Date(settingsData.trial_end_date);
            const now = new Date();
            const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            setTrialDaysRemaining(Math.max(0, daysLeft));
            setIsTrialActive(daysLeft > 0);
          }
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
      }
    };

    checkTrialStatus();
  }, [user]);

  return { trialDaysRemaining, isTrialActive, planType };
}