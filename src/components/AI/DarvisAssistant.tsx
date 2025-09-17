import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2, Check, Clock, Plus, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface TaskPreview {
  title: string
  description?: string
  due_date?: string
  due_time?: string
  reminder_minutes?: number
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  project_id?: string
}

interface DarvisResponse {
  type: 'task_creation' | 'reschedule' | 'summary' | 'general'
  message: string
  task_preview?: TaskPreview
  tasks_summary?: any[]
}

export function DarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'darvis', timestamp: Date}>>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [taskPreview, setTaskPreview] = useState<TaskPreview | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: "Hi! I'm Darvis, your AI assistant for D-TRACK. I can help you create tasks, reschedule them, or summarize your workload. Try saying something like 'Create a task to call James tomorrow at 2pm with a 30-minute reminder'",
        sender: 'darvis',
        timestamp: new Date()
      }])
    }
  }, [isOpen, messages.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user || isProcessing) return

    const userMessage = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user' as const,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'darvis_chat',
          data: {
            message: userMessage.text,
            userId: user.id,
            conversationHistory: messages.slice(-5)
          }
        }
      })

      if (error) throw error

      const response: DarvisResponse = data.response

      const darvisMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'darvis' as const,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, darvisMessage])

      if (response.task_preview) {
        setTaskPreview(response.task_preview)
      }

    } catch (error: any) {
      console.error('Darvis error:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble processing that request. Please try again or rephrase your question.",
        sender: 'darvis' as const,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const confirmTaskCreation = async () => {
    if (!taskPreview || !user) return

    try {
      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title: taskPreview.title,
        description: taskPreview.description,
        due_date: taskPreview.due_date || null,
        priority: taskPreview.priority,
        reminder_enabled: !!taskPreview.reminder_minutes,
        reminder_hours_before: taskPreview.reminder_minutes ? Math.floor(taskPreview.reminder_minutes / 60) : 0,
        reminder_days_before: 0,
        project_id: taskPreview.project_id || null
      })

      if (error) throw error

      toast({
        title: 'Task Created!',
        description: `"${taskPreview.title}" has been added to your tasks.`
      })

      setTaskPreview(null)

      const confirmMessage = {
        id: Date.now().toString(),
        text: `Perfect! I've created the task "${taskPreview.title}" for you. You can find it in your tasks list.`,
        sender: 'darvis' as const,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmMessage])

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const cancelTaskCreation = () => {
    setTaskPreview(null)
    const cancelMessage = {
      id: Date.now().toString(),
      text: "No problem! The task wasn't created. Feel free to ask me to modify it or help with something else.",
      sender: 'darvis' as const,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, cancelMessage])
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full shadow-2xl bg-gradient-primary hover:shadow-primary/25 transition-all duration-300 border-0"
            >
              <MessageCircle className="h-7 w-7 text-white" />
            </Button>
            <div className="absolute -top-12 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg animate-pulse">
              Ask Darvis!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] z-50 bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-primary text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">Darvis AI</h3>
                  <p className="text-xs opacity-90">Your D-TRACK Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Task Preview Card */}
              <AnimatePresence>
                {taskPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="border-2 border-primary/50 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Task Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="font-semibold">{taskPreview.title}</h4>
                          {taskPreview.description && (
                            <p className="text-sm text-muted-foreground">{taskPreview.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {taskPreview.due_date && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(taskPreview.due_date).toLocaleDateString()}
                            </Badge>
                          )}
                          {taskPreview.reminder_minutes && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {taskPreview.reminder_minutes}min reminder
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${
                            taskPreview.priority === 'Urgent' ? 'border-red-500 text-red-600' :
                            taskPreview.priority === 'High' ? 'border-orange-500 text-orange-600' :
                            taskPreview.priority === 'Medium' ? 'border-blue-500 text-blue-600' :
                            'border-gray-500 text-gray-600'
                          }`}>
                            {taskPreview.priority}
                          </Badge>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={confirmTaskCreation} className="flex-1 gap-1">
                            <Check className="h-3 w-3" />
                            Create Task
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelTaskCreation}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Darvis anything about your tasks..."
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button type="submit" disabled={!input.trim() || isProcessing} size="sm">
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}