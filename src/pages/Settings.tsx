import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Globe, LogOut, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/external-client'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { useProfilePicture } from '@/hooks/useProfilePicture'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRef } from 'react'
import { BillingDashboard } from '@/components/Billing/BillingDashboard'

export default function Settings() {
  const { user, userProfile, signOut, updateUserStatus } = useAuth()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { daysRemaining, isTrialing, planType } = useSubscription()
  const { uploadProfilePicture, deleteProfilePicture, uploading } = useProfilePicture()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState({
    first_name: userProfile?.first_name || '',
    last_name: userProfile?.last_name || '',
    email: user?.email || '',
    department: userProfile?.department || ''
  })
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    weeklyReport: true
  })
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showActivity: true,
    allowMessages: true
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          department: profileData.department
        })
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (status: 'Available' | 'Away' | 'Busy') => {
    try {
      await updateUserStatus(status)
      toast({
        title: 'Success',
        description: 'Status updated successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: 'Success',
        description: 'Signed out successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('settingsTitle')}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t('settingsDescription')}</p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">{t('department')}</Label>
                  <Select value={profileData.department} onValueChange={(value) => setProfileData({ ...profileData, department: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="IT">IT</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <Select value={userProfile?.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Away">Away</SelectItem>
                      <SelectItem value="Busy">Busy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userProfile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-primary text-white font-bold text-lg">
                        {profileData.first_name.charAt(0)}{profileData.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file && user) {
                            await uploadProfilePicture(file, user.id);
                            window.location.reload(); // Refresh to show new image
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full sm:w-auto"
                        >
                          {uploading ? 'Uploading...' : 'Upload Picture'}
                        </Button>
                        {userProfile?.avatar_url && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              if (user) {
                                await deleteProfilePicture(user.id);
                                window.location.reload();
                              }
                            }}
                            disabled={uploading}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Max file size: 5MB. Supported formats: JPG, PNG, WebP
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Billing Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <BillingDashboard />
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label>Desktop Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Show desktop notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.desktop}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, desktop: checked })}
                />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive weekly activity reports
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your profile
                  </p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, profileVisible: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Activity Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Display when you're online or away
                  </p>
                </div>
                <Switch
                  checked={privacy.showActivity}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, showActivity: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let team members send you direct messages
                  </p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, allowMessages: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sign Out</Label>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}