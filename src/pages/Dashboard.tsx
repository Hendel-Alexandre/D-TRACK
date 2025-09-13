import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Clock, CheckSquare, FileText, BarChart3, Users, FolderOpen, Circle, ChevronDown, TrendingUp, Calendar as CalendarIcon, Plus, ArrowRight, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25
    }
  }
}

const quickActions = [
  {
    title: 'Start Timer',
    description: 'Begin time tracking',
    icon: Clock,
    href: '/timesheets',
    color: 'bg-gradient-primary',
    gradient: true
  },
  {
    title: 'View Tasks',
    description: 'Check pending tasks',
    icon: CheckSquare,
    href: '/tasks',
    color: 'bg-gradient-dark',
    gradient: true
  },
  {
    title: 'Quick Note',
    description: 'Add a quick note',
    icon: FileText,
    href: '/notes',
    color: 'bg-blue-500',
    gradient: false
  },
  {
    title: 'View Calendar',
    description: 'Check your schedule',
    icon: CalendarIcon,
    href: '/calendar',
    color: 'bg-green-500',
    gradient: false
  }
]

const stats = [
  {
    title: 'Today\'s Hours',
    value: '0:00',
    icon: Clock,
    change: '+0%',
    trend: 'neutral',
    description: 'vs yesterday'
  },
  {
    title: 'Open Tasks',
    value: '0',
    icon: CheckSquare,
    change: '0 pending',
    trend: 'positive',
    description: 'tasks remaining'
  },
  {
    title: 'Active Projects',
    value: '0',
    icon: FolderOpen,
    change: '0 in progress',
    trend: 'neutral',
    description: 'projects ongoing'
  },
  {
    title: 'Productivity',
    value: '100%',
    icon: TrendingUp,
    change: 'Excellent',
    trend: 'positive',
    description: 'efficiency rating'
  }
]

export default function Dashboard() {
  const { t } = useTranslation()
  const { userProfile, user, updateUserStatus } = useAuth()
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'text-green-500'
      case 'Away': return 'text-yellow-500'  
      case 'Busy': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'positive': return 'text-green-600 dark:text-green-400'
      case 'negative': return 'text-red-600 dark:text-red-400'
      default: return 'text-muted-foreground'
    }
  }

  const handleStatusChange = async (status: 'Available' | 'Away' | 'Busy') => {
    await updateUserStatus(status)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const displayName = userProfile?.first_name || (user?.user_metadata as any)?.first_name || ''

  return (
    <div className="min-h-screen">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-gradient mb-2">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-lg text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg font-semibold">
                    {getInitials(userProfile?.first_name || '', userProfile?.last_name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-3">
                  <Circle className={`h-3 w-3 fill-current ${getStatusColor(userProfile?.status || 'Available')}`} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-secondary/50 hover:bg-secondary px-3 py-2 rounded-lg">
                        <span className="font-medium">{userProfile?.status || 'Available'}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Available')}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-green-500" />
                        Available
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Away')}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-yellow-500" />
                        Away
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Busy')}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-red-500" />
                        Busy
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Zap className="h-4 w-4 mr-2" />
                Pro User
              </Badge>
              <Button onClick={() => navigate('/timesheets')} className="button-premium gap-2">
                <Plus className="h-4 w-4" />
                Start Tracking
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="card-hover bg-gradient-card border-border/50 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="outline" className={`text-xs ${getTrendColor(stat.trend)}`}>
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
            <Button variant="ghost" onClick={() => navigate('/timesheets')} className="gap-2 text-muted-foreground hover:text-foreground">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {quickActions.map((action, index) => (
               <motion.div
                 key={index}
                 whileHover={{ scale: 1.02, y: -2 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => navigate(action.href)}
               >
                 <Card className="card-hover cursor-pointer group border-border/50 bg-gradient-card relative overflow-hidden">
                   <CardContent className="p-6 text-center space-y-4">
                     <div className={`mx-auto w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                       <action.icon className="h-8 w-8 text-white" />
                     </div>
                     <div className="space-y-2">
                       <h3 className="font-semibold text-foreground">
                         {action.title}
                       </h3>
                       <p className="text-sm text-muted-foreground">
                         {action.description}
                       </p>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="sm"
                       className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                       onClick={(e) => {
                         e.stopPropagation()
                         navigate(action.href)
                       }}
                     >
                       Get Started
                       <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                     </Button>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
        </motion.div>

        {/* Recent Activity & Insights */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">Recent Activity</CardTitle>
                    <CardDescription>Your latest time entries and updates</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">No recent activity</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Start logging your time to see activity here
                  </p>
                  <Button onClick={() => navigate('/timesheets')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Time Entry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="border-border/50 bg-gradient-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground">Productivity Insights</CardTitle>
                    <CardDescription>Track your performance trends</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-muted-foreground mb-2">Generate your first report</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Track time to unlock detailed analytics
                  </p>
                  <Button variant="outline" onClick={() => navigate('/reports')} className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}