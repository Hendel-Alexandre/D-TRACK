import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LumenAssistant } from '@/components/AI/LumenAssistant'
import { ProfessionalDashboard } from '@/components/Dashboard/ProfessionalDashboard'
import { TrialBanner } from '@/components/Dashboard/TrialBanner'
import { useEffect, useState } from 'react'

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
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const displayName = userProfile?.first_name || ''

  return (
    <div className="min-h-screen">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Desktop Header */}
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
                onClick={() => navigate('/clients')} 
                className="button-premium gap-2 h-10"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                {t('newClient')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Trial Banner */}
        <motion.div variants={itemVariants}>
          <TrialBanner />
        </motion.div>

        {/* Professional Dashboard */}
        <motion.div variants={itemVariants}>
          <ProfessionalDashboard />
        </motion.div>
      </motion.div>
      
      {/* Lumen AI Assistant */}
      <LumenAssistant />
    </div>
  )
}