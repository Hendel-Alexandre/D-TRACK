import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Plus,
  Briefcase,
  Calendar as CalendarIcon,
  Bell,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const weekData = [
  { value: 4 },
  { value: 7 },
  { value: 5 },
  { value: 8 },
  { value: 6 },
  { value: 9 },
  { value: 7 },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export function MobileDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-dark pb-20">
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

        {/* Balance Card */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-purple border-0 shadow-glow overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-white/70 mb-1">Your Progress</p>
                  <h3 className="text-3xl font-bold text-white">78.5%</h3>
                </div>
                <Button 
                  size="icon" 
                  className="rounded-full bg-white/20 hover:bg-white/30 border-0"
                  onClick={() => navigate('/timesheets')}
                >
                  <Plus className="h-5 w-5 text-white" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>+12% from last week</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-4 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Quick actions</h3>
          <Button variant="ghost" size="sm" className="text-xs text-primary h-auto p-0 hover:bg-transparent">
            Edit
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 shadow-lg cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/tasks')}
          >
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                <Target className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-white mb-0.5">Tasks</p>
              <p className="text-lg font-bold text-white">12 Active</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 shadow-lg cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/projects')}
          >
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-white mb-0.5">Projects</p>
              <p className="text-lg font-bold text-white">8 Active</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-green-600 to-green-700 border-0 shadow-lg cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/timesheets')}
          >
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-white mb-0.5">Time Today</p>
              <p className="text-lg font-bold text-white">4.5 hrs</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-600 to-orange-700 border-0 shadow-lg cursor-pointer active:scale-95 transition-transform"
            onClick={() => navigate('/calendar')}
          >
            <CardContent className="p-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-3 backdrop-blur-sm">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm font-medium text-white mb-0.5">Events</p>
              <p className="text-lg font-bold text-white">3 Today</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Activity Chart */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-4 mb-6"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">This Week</h3>
                <p className="text-2xl font-bold text-foreground">32.5 hrs</p>
              </div>
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>+15%</span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={weekData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#977DFF" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Recent Activity</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-primary h-auto p-0 hover:bg-transparent"
            onClick={() => navigate('/history')}
          >
            See all
          </Button>
        </div>

        <div className="space-y-2">
          {[
            { icon: Target, title: 'Task Completed', subtitle: 'UI Design Review', time: '2 hours ago', color: 'from-purple-600 to-purple-700' },
            { icon: Briefcase, title: 'Project Updated', subtitle: 'Website Redesign', time: '5 hours ago', color: 'from-blue-600 to-blue-700' },
            { icon: Zap, title: 'Achievement Unlocked', subtitle: 'Week Warrior Badge', time: '1 day ago', color: 'from-green-600 to-green-700' },
          ].map((item, idx) => (
            <Card 
              key={idx} 
              className="border-border/50 bg-card/50 backdrop-blur-sm cursor-pointer active:scale-98 transition-transform"
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}