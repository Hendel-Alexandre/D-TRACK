import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppMode = 'student' | 'work';

interface ModeSettings {
  activeMode: AppMode;
  studentModeEnabled: boolean;
  workModeEnabled: boolean;
}

export function useModeSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ModeSettings>({
    activeMode: 'work',
    studentModeEnabled: false,
    workModeEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_mode_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading mode settings:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setSettings({
        activeMode: data.active_mode as AppMode,
        studentModeEnabled: data.student_mode_enabled,
        workModeEnabled: data.work_mode_enabled,
      });
    } else {
      // Create default settings
      await createDefaultSettings();
    }

    setLoading(false);
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_mode_settings')
      .insert({
        user_id: user.id,
        active_mode: 'work',
        student_mode_enabled: false,
        work_mode_enabled: true,
      });

    if (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const updateActiveMode = async (mode: AppMode) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_mode_settings')
      .update({ active_mode: mode })
      .eq('user_id', user.id);

    if (!error) {
      setSettings(prev => ({ ...prev, activeMode: mode }));
    }
  };

  const enableMode = async (mode: AppMode) => {
    if (!user) return;

    const field = mode === 'student' ? 'student_mode_enabled' : 'work_mode_enabled';
    
    const { error } = await supabase
      .from('user_mode_settings')
      .update({ [field]: true })
      .eq('user_id', user.id);

    if (!error) {
      setSettings(prev => ({
        ...prev,
        [mode === 'student' ? 'studentModeEnabled' : 'workModeEnabled']: true,
      }));
    }
  };

  return {
    settings,
    loading,
    updateActiveMode,
    enableMode,
  };
}
