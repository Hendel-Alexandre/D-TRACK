import { motion } from 'framer-motion'
import { AlertTriangle, Clock, Calendar, TrendingUp, CheckSquare, Trophy, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface TaskCounts {
  overdue: number
  today: number
  upcoming: number
  completed_this_week: number
}

interface ProjectProgress {
  id: string
  name: string
  completed_tasks: number
  total_tasks: number
  progress: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
}

export function DashboardCards() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [taskCounts, setTaskCounts] = useState<TaskCounts>({
    overdue: 0,
    today: 0,
    upcoming: 0,
    completed_this_week: 0
  })
  const [projectProgress, setProjectProgress] = useState<ProjectProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      // Fetch task counts
      const [overdueRes, todayRes, upcomingRes, completedRes] = await Promise.all([
        supabase
          .from('tasks')
          .select('id')
          .eq('user_id', user.id)
          .lt('due_date', today)
          .neq('status', 'Done'),
        
        supabase
          .from('tasks')
          .select('id')
          .eq('user_id', user.id)
          .eq('due_date', today)
          .neq('status', 'Done'),
        
        supabase
          .from('tasks')
          .select('id')
          .eq('user_id', user.id)
          .gt('due_date', today)
          .lte('due_date', nextWeek)
          .neq('status', 'Done'),
        
        supabase
          .from('tasks')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'Done')
          .gte('updated_at', weekAgo)
      ])

      setTaskCounts({
        overdue: overdueRes.data?.length || 0,
        today: todayRes.data?.length || 0,
        upcoming: upcomingRes.data?.length || 0,
        completed_this_week: completedRes.data?.length || 0
      })

      // Fetch project progress
      const { data: projects } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          tasks!inner(id, status)
        `)
        .eq('user_id', user.id)
        .eq('status', 'Active')
        .limit(3)

      if (projects) {
        const progressData = projects.map(project => {
          const tasks = (project as any).tasks || []
          const totalTasks = tasks.length
          const completedTasks = tasks.filter((t: any) => t.status === 'Done').length
          
          return {
            id: project.id,
            name: project.name,
            completed_tasks: completedTasks,
            total_tasks: totalTasks,
            progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
          }
        })
        setProjectProgress(progressData)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const motivationalBadges = [
    {
      condition: taskCounts.completed_this_week >= 10,
      badge: { text: "Productivity Star! 🌟", variant: "default" as const },
      message: `You completed ${taskCounts.completed_this_week} tasks this week!`
    },
    {
      condition: taskCounts.completed_this_week >= 5,
      badge: { text: "Getting Things Done! 🎯", variant: "secondary" as const },
      message: `${taskCounts.completed_this_week} tasks completed this week`
    },
    {
      condition: taskCounts.overdue === 0,
      badge: { text: "On Track! ✅", variant: "outline" as const },
      message: "No overdue tasks - great job!"
    }
  ]

  const activeBadge = motivationalBadges.find(b => b.condition)

  return (
    <div className="space-y-6">
      {/* Task Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0 }}
        >
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              taskCounts.overdue > 0 
                ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20' 
                : 'border-border bg-gradient-card'
            }`}
            onClick={() => navigate('/tasks')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                  <p className={`text-3xl font-bold ${taskCounts.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                    {taskCounts.overdue}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  taskCounts.overdue > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-muted'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    taskCounts.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                  }`} />
                </div>
              </div>
              {taskCounts.overdue > 0 && (
                <Badge variant="destructive" className="mt-3">
                  Needs Attention
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20"
            onClick={() => navigate('/tasks')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Today</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {taskCounts.today}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              {taskCounts.today > 0 && (
                <Badge className="mt-3 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Focus Today
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20"
            onClick={() => navigate('/tasks')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming (7 days)</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {taskCounts.upcoming}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <Badge variant="outline" className="mt-3 border-green-200 text-green-700 dark:text-green-300">
                Planned
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg bg-gradient-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed This Week</p>
                  <p className="text-3xl font-bold text-foreground">
                    {taskCounts.completed_this_week}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <CheckSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
              {taskCounts.completed_this_week > 0 && (
                <Badge variant="default" className="mt-3">
                  <Trophy className="h-3 w-3 mr-1" />
                  Productive
                </Badge>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Motivational Badge */}
      {activeBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <Badge variant={activeBadge.badge.variant} className="text-sm px-3 py-1">
                  {activeBadge.badge.text}
                </Badge>
                <p className="text-sm text-muted-foreground">{activeBadge.message}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Project Progress */}
      {projectProgress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Project Progress
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectProgress.map((project, index) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-muted-foreground">
                      {project.completed_tasks}/{project.total_tasks} tasks
                    </span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{project.progress}% complete</span>
                    {project.progress === 100 && (
                      <Badge variant="default" className="text-xs">
                        <Trophy className="h-3 w-3 mr-1" />
                        Complete!
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}