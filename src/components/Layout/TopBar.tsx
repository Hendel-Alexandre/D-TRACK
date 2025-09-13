import { useState } from 'react'
import { Moon, Sun, Globe, ChevronDown, LogOut, User, Circle, Clock, Play, Pause } from 'lucide-react'
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

  return (
    <motion.header 
      className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={datatrackLogo} 
              alt="DataTrack" 
              className="h-24 sm:h-20 md:h-24 w-auto"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {/* Time Tracking Timer */}
          {user && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTracking}
                className={`gap-1 sm:gap-2 px-2 sm:px-3 ${
                  isTracking 
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                    : isPaused 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isTracking ? (
                  <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" />
                <span className="font-mono text-xs sm:text-sm min-w-[50px] sm:min-w-[60px]">
                  {formatTime(elapsedTime)}
                </span>
              </Button>
            </div>
          )}

          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{i18n.language.toUpperCase()}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="gap-1 sm:gap-2 px-2 sm:px-3"
          >
            {theme === 'light' ? (
              <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>

          {/* User Profile */}
          {user && userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 sm:gap-3 h-9 sm:h-10 px-2 sm:px-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(userProfile.status)}`}></div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-none">
                          {userProfile.first_name} <span className="hidden sm:inline">{userProfile.last_name}</span>
                        </span>
                        <span className="text-xs text-muted-foreground hidden sm:block truncate">
                          {userProfile.department}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-3 w-3" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile.first_name} {userProfile.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {t('status')}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusChange('Available')}>
                  <Circle className="mr-2 h-3 w-3 fill-status-available text-status-available" />
                  {t('available')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Away')}>
                  <Circle className="mr-2 h-3 w-3 fill-status-away text-status-away" />
                  {t('away')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Busy')}>
                  <Circle className="mr-2 h-3 w-3 fill-status-busy text-status-busy" />
                  {t('busy')}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  )
}