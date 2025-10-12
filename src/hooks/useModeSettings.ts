import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppMode = 'student' | 'work';

interface ModeSettings {
  active_mode: AppMode;
  student_mode_enabled: boolean;
  work_mode_enabled: boolean;
}

export function useModeSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ModeSettings>({
    active_mode: 'work',
    student_mode_enabled: false,
    work_mode_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_mode_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching mode settings:', error);
        return;
      }

      if (data) {
        setSettings({
          active_mode: data.active_mode as AppMode,
          student_mode_enabled: data.student_mode_enabled,
          work_mode_enabled: data.work_mode_enabled,
        });
      } else {
        // Create default settings
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_mode_settings')
      .insert({
        user_id: user.id,
        active_mode: 'work',
        student_mode_enabled: false,
        work_mode_enabled: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating mode settings:', error);
      return;
    }

    if (data) {
      setSettings({
        active_mode: data.active_mode as AppMode,
        student_mode_enabled: data.student_mode_enabled,
        work_mode_enabled: data.work_mode_enabled,
      });
    }
  };

  const updateSettings = async (newSettings: Partial<ModeSettings>) => {
    if (!user) return;

    const updatedSettings = { ...settings, ...newSettings };
    
    const { error } = await supabase
      .from('user_mode_settings')
      .update({
        active_mode: updatedSettings.active_mode,
        student_mode_enabled: updatedSettings.student_mode_enabled,
        work_mode_enabled: updatedSettings.work_mode_enabled,
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating mode settings:', error);
      return;
    }

    setSettings(updatedSettings);
  };

  return {
    settings,
    loading,
    updateSettings,
  };
}
