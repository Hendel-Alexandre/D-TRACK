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
import { TrialBanner } from '@/components/Dashboard/TrialBanner'

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
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Modern Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {t('dashboardWelcome', { name: displayName })}
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate('/timesheets')} 
                className="button-premium gap-2 h-10"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                {t('startTracking')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trial Banner */}
        <motion.div variants={itemVariants}>
          <TrialBanner />
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