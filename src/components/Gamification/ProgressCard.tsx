import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Target, Zap, TrendingUp, Award, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  progress?: number
  target?: number
}

interface ProgressCardProps {
  className?: string
}

export function ProgressCard({ className = '' }: ProgressCardProps) {
  const [stats, setStats] = useState({
    completedToday: 0,
    weeklyStreak: 0,
    totalXP: 0,
    level: 1,
    progressToNext: 0
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadProgressData()
    }
  }, [user])

  const loadProgressData = async () => {
    if (!user) return

    try {
      // Get today's completed tasks
      const today = new Date().toISOString().split('T')[0]
      const { data: todayTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Completed')
        .gte('updated_at', `${today}T00:00:00`)

      // Get total completed tasks for XP calculation
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id)

      const completedTasks = allTasks?.filter(t => t.status === 'Completed').length || 0
      const totalXP = completedTasks * 10 // 10 XP per completed task
      const level = Math.floor(totalXP / 100) + 1 // Level up every 100 XP
      const progressToNext = (totalXP % 100)

      // Calculate weekly streak (simplified)
      const weeklyStreak = Math.floor(completedTasks / 7)

      setStats({
        completedToday: todayTasks?.length || 0,
        weeklyStreak,
        totalXP,
        level,
        progressToNext
      })

      // Generate achievements
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'Early Bird',
          description: 'Complete 5 tasks before noon',
          icon: '🌅',
          earned: completedTasks >= 5,
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Complete tasks 7 days in a row',
          icon: '🔥',
          earned: weeklyStreak >= 1,
        },
        {
          id: '3',
          name: 'Task Crusher',
          description: 'Complete 50 tasks',
          icon: '💪',
          earned: completedTasks >= 50,
          progress: completedTasks,
          target: 50
        },
        {
          id: '4',
          name: 'Level Up',
          description: 'Reach level 5',
          icon: '⭐',
          earned: level >= 5,
          progress: level,
          target: 5
        }
      ]

      setAchievements(mockAchievements)
    } catch (error) {
      console.error('Error loading progress data:', error)
    }
  }

  const iconComponents = {
    Trophy,
    Target,
    Zap,
    TrendingUp,
    Award,
    Flame
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Card className="card-hover border-0 bg-gradient-card shadow-premium">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            Your Progress
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Level & XP */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gradient">
                Level {stats.level}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.totalXP} XP Total
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {stats.progressToNext}/100 XP
              </div>
              <div className="text-xs text-muted-foreground">
                To next level
              </div>
            </div>
          </div>

          <Progress 
            value={stats.progressToNext} 
            className="h-3 bg-muted"
          />

          {/* Daily Stats */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-gradient-subtle border border-border/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Today</span>
              </div>
              <div className="text-xl font-bold text-primary">
                {stats.completedToday}
              </div>
              <div className="text-xs text-muted-foreground">
                Tasks completed
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-gradient-subtle border border-border/50"
            >
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Streak</span>
              </div>
              <div className="text-xl font-bold text-orange-500">
                {stats.weeklyStreak}
              </div>
              <div className="text-xs text-muted-foreground">
                Week streak
              </div>
            </motion.div>
          </div>

          {/* Achievements */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Recent Achievements
            </h4>
            <div className="space-y-2">
              {achievements.slice(0, 3).map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    achievement.earned
                      ? 'bg-success/10 border-success/20 text-success-foreground'
                      : 'bg-muted/50 border-border/50'
                  }`}
                >
                  <div className="text-lg">
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                    {achievement.progress !== undefined && achievement.target && (
                      <div className="mt-1">
                        <Progress
                          value={(achievement.progress / achievement.target) * 100}
                          className="h-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}/{achievement.target}
                        </div>
                      </div>
                    )}
                  </div>
                  {achievement.earned && (
                    <Badge variant="secondary" className="bg-success text-success-foreground">
                      Earned
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}