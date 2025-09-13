import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface NoteNotification {
  id: string
  sender_name: string
  note_title: string
  note_content: string | null
  created_at: string
}

export function useNoteNotifications() {
  const { user } = useAuth()
  const [notification, setNotification] = useState<NoteNotification | null>(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!user) return

    // Fetch any pending notifications on mount
    const fetchPendingNotifications = async () => {
      const { data, error } = await supabase
        .from('note_notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        setNotification(data[0])
        setIsPopupOpen(true)
      }
    }

    fetchPendingNotifications()

    // Set up real-time listener for new notifications
    channelRef.current = supabase
      .channel('note-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'note_notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New note notification received:', payload)
          const newNotification = payload.new as NoteNotification
          setNotification(newNotification)
          setIsPopupOpen(true)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user])

  const closePopup = () => {
    setIsPopupOpen(false)
  }

  const onNotificationHandled = () => {
    setNotification(null)
  }

  return {
    notification,
    isPopupOpen,
    closePopup,
    onNotificationHandled
  }
}