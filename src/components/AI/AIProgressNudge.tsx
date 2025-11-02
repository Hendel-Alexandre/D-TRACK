import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendingUp, X, Lightbulb, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/external-client'
import { useAuth } from '@/contexts/AuthContext'

interface AIProgressNudgeProps {
  className?: string
}

interface ProgressStats {
  completedTasks: number
  totalTasks: number
  overdueTasks: number
  activeProjects: number
}

export function AIProgressNudge({ className = '' }: AIProgressNudgeProps) {
  const [nudge, setNudge] = useState<string>('')
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [suggestedTask, setSuggestedTask] = useState<any>(null)
  const [suggestion, setSuggestion] = useState<string>('')
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user && isVisible) {
      loadAINudge()
    }
  }, [user, isVisible])

  const loadAINudge = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Get progress nudge
      const { data: nudgeData } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'generate_progress_nudge',
          data: { userId: user.id }
        }
      })

      if (nudgeData?.success) {
        setNudge(nudgeData.nudge)
        setStats(nudgeData.stats)
      }

      // Get next task suggestion
      const { data: suggestionData } = await supabase.functions.invoke('ai-assistant', {
        body: {
          action: 'suggest_next_task',
          data: { userId: user.id }
        }
      })

      if (suggestionData?.success) {
        setSuggestion(suggestionData.suggestion)
        setSuggestedTask(suggestionData.suggestedTask)
      }
    } catch (error) {
      console.error('Error loading AI nudge:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Store dismissal in localStorage to avoid showing too frequently
    localStorage.setItem('ai-nudge-dismissed', new Date().toISOString())
  }

  const focusOnSuggestedTask = () => {
    if (suggestedTask) {
      // Could trigger focus mode or highlight the task
      console.log('Focusing on task:', suggestedTask)
    }
  }

  // Check if nudge was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('ai-nudge-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const now = new Date()
      const hoursSinceDismissal = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60)
      
      // Only show nudge if it's been more than 4 hours since last dismissal
      if (hoursSinceDismissal < 4) {
        setIsVisible(false)
      }
    }
  }, [])

  if (!isVisible || isLoading || !nudge) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={className}
      >
        <Card className="border-0 shadow-premium bg-gradient-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <CardContent className="p-6 relative">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3 
                }}
                className="p-3 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <Brain className="h-6 w-6" />
              </motion.div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    AI Insight
                  </Badge>
                </div>

                <h3 className="font-semibold text-lg mb-2">Your Productivity Assistant</h3>
                <p className="text-white/90 mb-4 leading-relaxed">
                  {nudge}
                </p>

                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-white/10">
                      <div className="text-xl font-bold">{stats.completedTasks}</div>
                      <div className="text-xs text-white/70">Completed</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/10">
                      <div className="text-xl font-bold">{stats.totalTasks}</div>
                      <div className="text-xs text-white/70">Total Tasks</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/10">
                      <div className="text-xl font-bold">{stats.overdueTasks}</div>
                      <div className="text-xs text-white/70">Overdue</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/10">
                      <div className="text-xl font-bold">{stats.activeProjects}</div>
                      <div className="text-xs text-white/70">Projects</div>
                    </div>
                  </div>
                )}

                {/* Next Task Suggestion */}
                {suggestedTask && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4" />
                      <span className="font-medium text-sm">Recommended Next Task</span>
                    </div>
                    <div className="font-semibold mb-1">{suggestedTask.title}</div>
                    <div className="text-sm text-white/80 mb-3">{suggestion}</div>
                    <Button
                      onClick={focusOnSuggestedTask}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      variant="outline"
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Focus on This
                    </Button>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Button
                    onClick={() => loadAINudge()}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    variant="outline"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Refresh Insight
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}