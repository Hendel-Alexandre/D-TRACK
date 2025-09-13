import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Calendar, Save, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface NoteNotification {
  id: string
  sender_name: string
  note_title: string
  note_content: string | null
  created_at: string
}

interface NoteNotificationPopupProps {
  notification: NoteNotification | null
  open: boolean
  onClose: () => void
  onHandled: () => void
}

export default function NoteNotificationPopup({ 
  notification, 
  open, 
  onClose, 
  onHandled 
}: NoteNotificationPopupProps) {
  const { user } = useAuth()
  const [selectedAction, setSelectedAction] = useState<'save' | 'calendar' | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)

  if (!notification) return null

  const handleSaveNote = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Save the note to the user's notes
      const { error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: `[Shared] ${notification.note_title}`,
          content: notification.note_content
        })

      if (noteError) throw noteError

      // Update notification status
      await updateNotificationStatus('accepted')
      
      toast({
        title: 'Note Saved',
        description: 'The shared note has been saved to your notes'
      })

      onHandled()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCalendar = async () => {
    if (!user || !selectedDate) return

    setLoading(true)
    try {
      // Save as task/calendar item
      const dueDate = format(selectedDate, 'yyyy-MM-dd')
      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: `[Shared Note] ${notification.note_title}`,
          description: notification.note_content,
          due_date: dueDate,
          status: 'Todo',
          priority: 'Medium'
        })

      if (taskError) throw taskError

      // Also save the note
      const { error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: `[Shared] ${notification.note_title}`,
          content: notification.note_content
        })

      if (noteError) throw noteError

      // Update notification status
      await updateNotificationStatus('accepted')
      
      toast({
        title: 'Added to Calendar',
        description: 'The shared note has been saved and added to your calendar'
      })

      onHandled()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateNotificationStatus = async (status: 'accepted' | 'dismissed') => {
    const { error } = await supabase
      .from('note_notifications')
      .update({ status })
      .eq('id', notification.id)

    if (error) throw error
  }

  const handleDismiss = async () => {
    try {
      await updateNotificationStatus('dismissed')
      onHandled()
      onClose()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const resetSelection = () => {
    setSelectedAction(null)
    setSelectedDate(undefined)
    setSelectedTime('')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <DialogTitle>New Note Received</DialogTitle>
          </div>
        </DialogHeader>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              From: {notification.sender_name}
            </CardTitle>
            <h3 className="font-semibold">{notification.note_title}</h3>
          </CardHeader>
          {notification.note_content && (
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto">
                {notification.note_content}
              </div>
            </CardContent>
          )}
        </Card>

        <div className="space-y-4">
          <div className="text-sm font-medium">
            What would you like to do with this note?
          </div>
          
          {!selectedAction ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAction('save')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Save className="h-5 w-5 mb-2" />
                <span className="text-xs">Just Save</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedAction('calendar')}
                className="flex flex-col items-center p-4 h-auto"
              >
                <Calendar className="h-5 w-5 mb-2" />
                <span className="text-xs">Add to Calendar</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAction === 'calendar' && (
                <div className="space-y-3">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <div>
                    <Label htmlFor="time">Time (optional)</Label>
                    <Input
                      id="time"
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={resetSelection}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={selectedAction === 'save' ? handleSaveNote : handleAddToCalendar}
                  disabled={loading || (selectedAction === 'calendar' && !selectedDate)}
                  className="flex-1"
                >
                  {loading ? 'Processing...' : 
                   selectedAction === 'save' ? 'Save Note' : 'Add to Calendar'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
          <div className="text-xs text-muted-foreground">
            {new Date(notification.created_at).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}