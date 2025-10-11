import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useModeSettings } from '@/hooks/useModeSettings';
import { ProfileSetupDialog } from '@/components/Mode/ProfileSetupDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { settings, loading, updateActiveMode, enableMode } = useModeSettings();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileCheckMode, setProfileCheckMode] = useState<AppMode | null>(null);

  const checkProfileExists = async (mode: AppMode): Promise<boolean> => {
    if (!user) return false;

    const table = mode === 'student' ? 'student_profiles' : 'work_profiles';
    const { data, error } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', user.id)
      .single();

    return !error && !!data;
  };

  const handleModeSwitch = async (newMode: AppMode) => {
    const profileExists = await checkProfileExists(newMode);
    
    if (!profileExists) {
      setProfileCheckMode(newMode);
      setShowProfileSetup(true);
    } else {
      await updateActiveMode(newMode);
    }
  };

  const handleProfileSetupComplete = async () => {
    if (profileCheckMode) {
      await enableMode(profileCheckMode);
      await updateActiveMode(profileCheckMode);
      setShowProfileSetup(false);
      setProfileCheckMode(null);
    }
  };

  const toggleMode = () => {
    const newMode = settings.activeMode === 'work' ? 'student' : 'work';
    handleModeSwitch(newMode);
  };

  const setMode = (mode: AppMode) => {
    handleModeSwitch(mode);
  };

  return (
    <ModeContext.Provider value={{ mode: settings.activeMode, toggleMode, setMode, loading }}>
      {children}
      {profileCheckMode && (
        <ProfileSetupDialog
          mode={profileCheckMode}
          open={showProfileSetup}
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
