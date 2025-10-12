import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/hooks/useOnboarding';

export function OnboardingRedirect({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { needsOnboarding, loading } = useOnboarding();

  useEffect(() => {
    if (!loading && needsOnboarding) {
      navigate('/onboarding', { replace: true });
    }
  }, [needsOnboarding, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (needsOnboarding) {
    return null; // Will redirect
  }

  return <>{children}</>;
}