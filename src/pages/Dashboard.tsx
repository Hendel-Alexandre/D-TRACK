import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Clock, CheckSquare, FileText, BarChart3, Users, FolderOpen, Circle, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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
      stiffness: 300,
      damping: 25
    }
  }
}

const quickActions = [
  {
    title: 'timesheets',
    description: 'Log your time entries',
    icon: Clock,
    href: '/timesheets',
    color: 'bg-gradient-primary'
  },
  {
    title: 'tasks',
    description: 'Manage your tasks',
    icon: CheckSquare,
    href: '/tasks',
    color: 'bg-gradient-dark'
  },
  {
    title: 'notes',
    description: 'Quick notes',
    icon: FileText,
    href: '/notes',
    color: 'bg-primary'
  },
  {
    title: 'projects',
    description: 'View projects',
    icon: FolderOpen,
    href: '/projects',
    color: 'bg-accent'
  }
]

const stats = [
  {
    title: 'Today\'s Hours',
    value: '0',
    icon: Clock,
    change: '+0%'
  },
  {
    title: 'Open Tasks',
    value: '0',
    icon: CheckSquare,
    change: '0 pending'
  },
  {
    title: 'Active Projects',
    value: '0',
    icon: FolderOpen,
    change: '0 in progress'
  },
  {
    title: 'Team Members',
    value: '1',
    icon: Users,
    change: 'Available'
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

  const handleStatusChange = async (status: 'Available' | 'Away' | 'Busy') => {
    await updateUserStatus(status)
  }

  const displayName = userProfile?.first_name || (user?.user_metadata as any)?.first_name || ''

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <motion.div
        className="container mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Hello, {displayName}!
                </h1>
                <div className="flex items-center gap-2">
                  <Circle className={`h-3 w-3 fill-current ${getStatusColor(userProfile?.status || 'Available')}`} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <span>{userProfile?.status || 'Available'}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-32 bg-background border border-border shadow-lg z-50">
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Available')}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-green-500" />
                        Available
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Away')}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-yellow-500" />
                        Away
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Busy')}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-red-500" />
                        Busy
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-lg text-muted-foreground">
                {t('dashboard')} - {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="h-16 w-16 bg-gradient-primary flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-muted flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {quickActions.map((action, index) => (
               <motion.div
                 key={index}
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => navigate(action.href)}
               >
                 <Card className="border-border bg-card hover:shadow-corporate transition-all duration-300 cursor-pointer group">
                   <CardContent className="p-6">
                     <div className="flex flex-col items-center text-center space-y-4">
                       <div className={`h-16 w-16 ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                         <action.icon className="h-8 w-8 text-white" />
                       </div>
                       <div>
                         <h3 className="font-semibold text-foreground capitalize">
                           {t(action.title)}
                         </h3>
                         <p className="text-sm text-muted-foreground mt-1">
                           {action.description}
                         </p>
                       </div>
                       <Button 
                         variant="outline" 
                         size="sm"
                         className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                         onClick={(e) => {
                           e.stopPropagation()
                           navigate(action.href)
                         }}
                       >
                         Open
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Your latest time entries and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start logging your time to see activity here
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/timesheets')}>
                  Add Time Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}