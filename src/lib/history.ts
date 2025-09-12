import { supabase } from '@/integrations/supabase/client'

export interface HistoryLogDetails {
  [key: string]: any
}

export const logActivity = async (
  category: string,
  action: string,
  details?: HistoryLogDetails
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('history_logs')
      .insert({
        user_id: user.id,
        category,
        action,
        details: details || {}
      })

    if (error) {
      console.error('Error logging activity:', error)
    }
  } catch (error) {
    console.error('Error logging activity:', error)
  }
}

// Helper functions for common actions
export const logHourAdjustment = (action: 'Created' | 'Updated' | 'Deleted', details: {
  hours?: number
  reason?: string
  date?: string
  [key: string]: any
}) => {
  return logActivity('Hour Adjustment', action, details)
}

export const logProject = (action: 'Created' | 'Updated' | 'Deleted', details: {
  name?: string
  status?: string
  [key: string]: any
}) => {
  return logActivity('Project', action, details)
}