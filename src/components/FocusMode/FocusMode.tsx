import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Timer, Play, Pause, Square, CheckCircle2, Clock, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  status: string
  due_date?: string
}

interface FocusModeProps {
  className?: string
}

const POMODORO_DURATION = 25 * 60 // 25 minutes in seconds
const BREAK_DURATION = 5 * 60 // 5 minutes in seconds

export function FocusMode({ className = '' }: FocusModeProps) {
  const [isActive, setIsActive] = useState(false)
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [pomodoroTime, setPomodoroTime] = useState(POMODORO_DURATION)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && isActive) {
      loadTodayTasks()
    }
  }, [user, isActive])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => {
          if (time <= 1) {
            handleTimerComplete()
            return isBreak ? BREAK_DURATION : POMODORO_DURATION
          }
          return time - 1
        })
      }, 1000)
    }
    
    return () => clearInterval(interval)
  }, [isTimerRunning, pomodoroTime, isBreak])

  const loadTodayTasks = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'Completed')
        .or(`due_date.eq.${today},due_date.is.null`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })

      setTodayTasks(tasks || [])
      if (tasks && tasks.length > 0 && !currentTask) {
        setCurrentTask(tasks[0])
      }
    } catch (error) {
      console.error('Error loading today tasks:', error)
    }
  }

  const handleTimerComplete = () => {
    setIsTimerRunning(false)
    
    if (!isBreak) {
      setCompletedPomodoros(prev => prev + 1)
      toast({
        title: 'Pomodoro Complete! 🍅',
        description: 'Great work! Time for a short break.',
      })
      setIsBreak(true)
      setPomodoroTime(BREAK_DURATION)
    } else {
      toast({
        title: 'Break Over!',
        description: 'Ready to get back to work?',
      })
      setIsBreak(false)
      setPomodoroTime(POMODORO_DURATION)
    }
  }

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setPomodoroTime(isBreak ? BREAK_DURATION : POMODORO_DURATION)
  }

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'Completed' })
        .eq('id', taskId)

      if (error) throw error

      setTodayTasks(prev => prev.filter(task => task.id !== taskId))
      
      if (currentTask?.id === taskId) {
        const nextTask = todayTasks.find(task => task.id !== taskId)
        setCurrentTask(nextTask || null)
      }

      toast({
        title: 'Task Completed! ✅',
        description: 'Great job! Keep the momentum going.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${className} flex items-center justify-center min-h-[200px]`}
      >
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Enter Focus Mode</h3>
            <p className="text-muted-foreground mb-6">
              Eliminate distractions and concentrate on today's most important tasks.
            </p>
            <Button 
              onClick={() => setIsActive(true)}
              className="button-premium w-full"
              size="lg"
            >
              <Eye className="h-5 w-5 mr-2" />
              Start Focus Session
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`${className} min-h-screen bg-focus-bg text-white p-4`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white/10">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Focus Mode</h1>
              <p className="text-white/70">Stay concentrated and productive</p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsActive(false)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Exit Focus
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Pomodoro Timer */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-focus-card border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Pomodoro Timer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold mb-2">
                    {formatTime(pomodoroTime)}
                  </div>
                  <Badge 
                    className={`${isBreak ? 'bg-blue-600' : 'bg-red-600'} text-white`}
                  >
                    {isBreak ? 'Break Time' : 'Focus Time'}
                  </Badge>
                </div>

                <Progress 
                  value={((isBreak ? BREAK_DURATION : POMODORO_DURATION) - pomodoroTime) / (isBreak ? BREAK_DURATION : POMODORO_DURATION) * 100}
                  className="h-2"
                />

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className={`${isTimerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                  >
                    {isTimerRunning ? (
                      <Pause className="h-5 w-5 mr-2" />
                    ) : (
                      <Play className="h-5 w-5 mr-2" />
                    )}
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </Button>
                  
                  <Button
                    onClick={resetTimer}
                    variant="outline"
                    size="lg"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Reset
                  </Button>
                </div>

                <div className="text-center pt-4 border-t border-white/10">
                  <div className="text-sm text-white/70">Completed Today</div>
                  <div className="text-2xl font-bold">{completedPomodoros} 🍅</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-focus-card border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Today's Focus Tasks ({todayTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks for today. Great job!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.slice(0, 6).map((task, index) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border transition-all ${
                          currentTask?.id === task.id
                            ? 'bg-white/20 border-white/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Button
                            onClick={() => completeTask(task.id)}
                            variant="outline"
                            size="sm"
                            className="mt-1 border-white/20 text-white hover:bg-green-600 hover:border-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-white/70 mb-2">
                                {task.description}
                              </p>
                            )}
                            
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <Clock className="h-3 w-3" />
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          
                          {currentTask?.id !== task.id && (
                            <Button
                              onClick={() => setCurrentTask(task)}
                              variant="ghost"
                              size="sm"
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              Focus
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Current Task Focus */}
        {currentTask && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center">Currently Focusing On</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <h2 className="text-3xl font-bold mb-2">{currentTask.title}</h2>
                {currentTask.description && (
                  <p className="text-white/80 mb-4">{currentTask.description}</p>
                )}
                <div className="flex items-center justify-center gap-4">
                  <Badge className={getPriorityColor(currentTask.priority)}>
                    {currentTask.priority} Priority
                  </Badge>
                  {currentTask.due_date && (
                    <Badge variant="outline" className="border-white/30 text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(currentTask.due_date).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}