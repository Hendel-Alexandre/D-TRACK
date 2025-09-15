import { useState } from 'react'
import { Moon, Sun, Globe, ChevronDown, LogOut, User, Circle, Clock, Play, Pause, Settings } from 'lucide-react'
import datatrackLogo from '@/assets/datatrack-logo.png'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useTimeTracking } from '@/contexts/TimeTrackingContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function TopBar() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { user, userProfile, signOut, updateUserStatus } = useAuth()
  const { isTracking, isPaused, elapsedTime, toggleTracking, formatTime } = useTimeTracking()
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-status-available'
      case 'Away':
        return 'bg-status-away'
      case 'Busy':
        return 'bg-status-busy'
      default:
        return 'bg-muted'
    }
  }

  const handleStatusChange = async (status: 'Available' | 'Away' | 'Busy') => {
    try {
      await updateUserStatus(status)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <motion.header 
      className="h-14 sm:h-16 border-b border-border/50 glass-effect sticky top-0 z-50"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="h-8 w-8 hover:bg-accent/50 rounded-lg transition-colors" />
          <div className="hidden sm:block h-8 w-px bg-border/50" />
          <div className="hidden xl:flex items-center gap-3">
            <img 
              src={datatrackLogo} 
              alt="D-Track" 
              className="h-16 sm:h-20 w-auto dark:invert"
            />
            <div>
              <h2 className="text-sm font-semibold text-foreground">D-Track</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Time Tracking Timer */}
          {user && (
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTracking}
                className={`gap-1 sm:gap-2 px-2 sm:px-4 py-2 h-8 sm:h-9 rounded-lg font-mono transition-all text-xs sm:text-sm ${
                  isTracking 
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:text-green-300' 
                    : isPaused 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300'
                    : 'hover:bg-accent/50'
                }`}
              >
                {isTracking ? (
                  <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 hidden xs:block" />
                <span className="text-xs sm:text-sm min-w-[45px] sm:min-w-[60px]">
                  {formatTime(elapsedTime)}
                </span>
              </Button>
            </motion.div>
          )}

          {/* Language Toggle - Hidden on very small screens */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 h-8 sm:h-9 rounded-lg hover:bg-accent/50 hidden sm:flex">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">{i18n.language.toUpperCase()}</span>
                <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer">
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')} className="cursor-pointer">
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-accent/50"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* User Profile */}
          {user && userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 sm:gap-3 h-8 sm:h-10 px-2 sm:px-3 rounded-lg hover:bg-accent/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs sm:text-sm font-semibold">
                        {getInitials(userProfile.first_name, userProfile.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {userProfile.first_name} {userProfile.last_name}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(userProfile.status)}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {userProfile.department}
                      </span>
                    </div>
                    <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground hidden sm:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                          {getInitials(userProfile.first_name, userProfile.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {userProfile.first_name} {userProfile.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('status')}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusChange('Available')} className="cursor-pointer">
                  <Circle className="mr-3 h-3 w-3 fill-status-available text-status-available" />
                  <span className="text-sm">{t('available')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Away')} className="cursor-pointer">
                  <Circle className="mr-3 h-3 w-3 fill-status-away text-status-away" />
                  <span className="text-sm">{t('away')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Busy')} className="cursor-pointer">
                  <Circle className="mr-3 h-3 w-3 fill-status-busy text-status-busy" />
                  <span className="text-sm">{t('busy')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-3 h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm">{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  )
}