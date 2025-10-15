import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMode } from '@/contexts/ModeContext';
import { MobileProfessionalDashboard } from './MobileProfessionalDashboard';
import { StudentDashboard } from './StudentDashboard';

export function MobileDashboardWrapper() {
  const { userProfile } = useAuth();
  const { mode } = useMode();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/30">
              <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                {getInitials(userProfile?.first_name || '', userProfile?.last_name || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Good morning</p>
              <h2 className="text-lg font-bold text-foreground">
                {userProfile?.first_name || 'User'}
              </h2>
            </div>
          </div>
          <div className="relative">
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center font-semibold">
                2
              </span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Mode-specific dashboard content */}
      <div className="px-4">
        {mode === 'student' ? <StudentDashboard /> : <MobileProfessionalDashboard />}
      </div>
    </div>
  );
}
