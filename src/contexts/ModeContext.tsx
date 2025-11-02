import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useModeSettings } from '@/hooks/useModeSettings';
import { ProfileSetupDialog } from '@/components/Mode/ProfileSetupDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/external-client';

type AppMode = 'student' | 'work';

interface ModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
  loading: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { settings, loading, updateSettings } = useModeSettings();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [pendingMode, setPendingMode] = useState<AppMode | null>(null);

  const checkProfileExists = async (mode: AppMode): Promise<boolean> => {
    if (!user) return false;

    const table = mode === 'student' ? 'student_profiles' : 'work_profiles';
    const { data, error } = await supabase
      .from(table as any)
      .select('id')
      .eq('user_id', user.id)
      .single();

    return !error && !!data;
  };

  const setMode = async (newMode: AppMode) => {
    if (!user || loading) return;

    const hasProfile = await checkProfileExists(newMode);
    
    if (!hasProfile) {
      setPendingMode(newMode);
      setShowProfileSetup(true);
      return;
    }

    await updateSettings({
      active_mode: newMode,
      [`${newMode}_mode_enabled`]: true,
    });
  };

  const toggleMode = async () => {
    const newMode = settings.active_mode === 'work' ? 'student' : 'work';
    await setMode(newMode);
  };

  const handleProfileSetupComplete = async () => {
    if (pendingMode) {
      await updateSettings({
        active_mode: pendingMode,
        [`${pendingMode}_mode_enabled`]: true,
      });
      setPendingMode(null);
    }
  };

  return (
    <ModeContext.Provider
      value={{
        mode: settings.active_mode,
        toggleMode,
        setMode,
        loading,
      }}
    >
      {children}
      {pendingMode && (
        <ProfileSetupDialog
          open={showProfileSetup}
          onOpenChange={setShowProfileSetup}
          mode={pendingMode}
          onComplete={handleProfileSetupComplete}
        />
      )}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
