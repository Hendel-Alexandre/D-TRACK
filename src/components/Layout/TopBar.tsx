import { useState } from 'react'
import { Moon, Sun, Globe, ChevronDown, LogOut, User, Circle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
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
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-8 w-8" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-primary flex items-center justify-center">
              <div className="h-4 w-4 bg-background"></div>
            </div>
            <span className="font-bold text-lg tracking-tight">TimeTracker Pro</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                {i18n.language.toUpperCase()}
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
            className="gap-2"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User Profile */}
          {user && userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-3 h-10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(userProfile.status)}`}></div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          {userProfile.first_name} {userProfile.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
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