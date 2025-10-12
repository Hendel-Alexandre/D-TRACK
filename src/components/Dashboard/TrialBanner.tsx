import { motion } from 'framer-motion';
import { Clock, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useOnboarding';

export function TrialBanner() {
  const navigate = useNavigate();
  const { trialDaysRemaining, isTrialActive, planType } = useTrialStatus();

  if (!isTrialActive || planType !== 'trial') return null;

  const getColorClass = () => {
    if (trialDaysRemaining === null) return 'border-primary';
    if (trialDaysRemaining <= 3) return 'border-red-500';
    if (trialDaysRemaining <= 7) return 'border-yellow-500';
    return 'border-primary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className={`p-4 ${getColorClass()} border-2`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">
                {trialDaysRemaining !== null ? (
                  <>
                    {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining in your free trial
                  </>
                ) : (
                  'Trial Active'
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Upgrade anytime to continue after your trial ends
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/settings')}
            size="sm"
            className="gap-2"
          >
            <Crown className="h-4 w-4" />
            Upgrade Now
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}