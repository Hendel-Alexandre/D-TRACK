import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface TimeTrackingContextType {
  isTracking: boolean
  isPaused: boolean
  elapsedTime: number
  startTracking: () => void
  stopTracking: () => void
  pauseTracking: () => void
  resumeTracking: () => void
  toggleTracking: () => void
  formatTime: (seconds: number) => string
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined)

export function TimeTrackingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const pausedTimeRef = useRef<number>(0) // Store accumulated time when paused

  // Auto-start tracking when user logs in
  useEffect(() => {
    if (user && !isTracking && !currentSessionId) {
      startTracking()
    } else if (!user && (isTracking || currentSessionId)) {
      stopTracking()
    }
  }, [user])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startTracking = async () => {
    if (!user || currentSessionId) return

    try {
      // Create a new time tracking session
      const { data, error } = await supabase
        .from('timesheets')
        .insert({
          user_id: user.id,
          description: 'Active session',
          hours: 0,
          date: new Date().toISOString().split('T')[0],
          project_id: null,
          task_id: null
        })
        .select()
        .single()

      if (error) throw error

      setCurrentSessionId(data.id)
      setIsTracking(true)
      setIsPaused(false)
      startTimeRef.current = new Date()
      pausedTimeRef.current = 0
      setElapsedTime(0)

      // Start the timer
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = new Date()
          const currentElapsed = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000)
          setElapsedTime(pausedTimeRef.current + currentElapsed)
        }
      }, 1000)

    } catch (error: any) {
      console.error('Error starting time tracking:', error)
      toast({
        title: 'Error',
        description: 'Failed to start time tracking',
        variant: 'destructive'
      })
    }
  }

  const pauseTracking = () => {
    if (!isTracking || isPaused) return

    // Stop the interval and save the current elapsed time
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Save accumulated time
    pausedTimeRef.current = elapsedTime
    setIsTracking(false)
    setIsPaused(true)
    startTimeRef.current = null
  }

  const resumeTracking = () => {
    if (!isPaused || !currentSessionId) return

    // Resume timing from where we left off
    setIsTracking(true)
    setIsPaused(false)
    startTimeRef.current = new Date()

    // Start the timer again
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const now = new Date()
        const currentElapsed = Math.floor((now.getTime() - startTimeRef.current.getTime()) / 1000)
        setElapsedTime(pausedTimeRef.current + currentElapsed)
      }
    }, 1000)
  }

  const stopTracking = async () => {
    if (!user || !currentSessionId) return

    try {
      // Calculate final hours
      const finalHours = elapsedTime / 3600

      // Update the timesheet entry
      const { error } = await supabase
        .from('timesheets')
        .update({
          hours: finalHours,
          description: `Session: ${formatTime(elapsedTime)}`
        })
        .eq('id', currentSessionId)
        .eq('user_id', user.id)

      if (error) throw error

      // Clear everything
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setIsTracking(false)
      setIsPaused(false)
      setElapsedTime(0)
      setCurrentSessionId(null)
      startTimeRef.current = null
      pausedTimeRef.current = 0

      toast({
        title: 'Session Saved',
        description: `Time tracked: ${formatTime(elapsedTime)}`,
      })

    } catch (error: any) {
      console.error('Error stopping time tracking:', error)
      toast({
        title: 'Error',
        description: 'Failed to save time tracking session',
        variant: 'destructive'
      })
    }
  }

  const toggleTracking = () => {
    if (isPaused) {
      resumeTracking()
    } else if (isTracking) {
      pauseTracking()
    } else if (currentSessionId) {
      resumeTracking()
    } else {
      startTracking()
    }
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const value = {
    isTracking,
    isPaused,
    elapsedTime,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    toggleTracking,
    formatTime
  }

  return (
    <TimeTrackingContext.Provider value={value}>
      {children}
    </TimeTrackingContext.Provider>
  )
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext)
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider')
  }
  return context
}