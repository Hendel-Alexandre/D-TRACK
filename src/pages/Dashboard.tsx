import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Circle, ChevronDown, Zap, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DarvisAssistant } from '@/components/AI/DarvisAssistant'
import { useMode } from '@/contexts/ModeContext'
import { StudentDashboard } from '@/components/Dashboard/StudentDashboard'
import { WorkDashboard } from '@/components/Dashboard/WorkDashboard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { userProfile, user, updateUserStatus } = useAuth()
  const { mode } = useMode()
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
                  {t('dashboardWelcome', { name: displayName })}
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
                        <span className="font-medium">{t(userProfile?.status?.toLowerCase() || 'available')}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40">
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Available')}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-green-500" />
                        {t('available')}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange('Away')}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Circle className="h-3 w-3 fill-current text-yellow-500" />
                        {t('away')}
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
                {t('startTracking')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Mode-Specific Dashboard */}
        <motion.div variants={itemVariants}>
          {mode === 'student' ? <StudentDashboard /> : <WorkDashboard />}
        </motion.div>
      </motion.div>
      
      {/* Darvis AI Assistant */}
      <DarvisAssistant />
    </div>
  )
}