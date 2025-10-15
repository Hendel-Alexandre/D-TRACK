import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Target, TrendingUp, Award, Calendar as CalendarIcon, FileText, Plus, MoreVertical } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const studyTimeData = [
  { name: 'Math', value: 8, color: '#a78bfa' },
  { name: 'Science', value: 6, color: '#60a5fa' },
  { name: 'History', value: 4, color: '#f472b6' },
  { name: 'English', value: 5, color: '#34d399' },
];

const weeklyProgressData = [
  { day: 'Mon', hours: 4 },
  { day: 'Tue', hours: 6 },
  { day: 'Wed', hours: 5 },
  { day: 'Thu', hours: 7 },
  { day: 'Fri', hours: 4 },
  { day: 'Sat', hours: 3 },
  { day: 'Sun', hours: 2 },
];

const assignmentData = [
  { name: 'Due Today', value: 2, color: '#ef4444' },
  { name: 'This Week', value: 5, color: '#f59e0b' },
  { name: 'Completed', value: 12, color: '#10b981' },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Quick Stats - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="card-stat border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="stat-card-icon">
                  <Clock className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Today's Study</p>
                <h3 className="text-2xl font-bold mb-1">4.5 hrs</h3>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="text-success">↑ 30%</span>
                  <span className="text-muted-foreground">vs yesterday</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-stat border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-warning/10 text-warning">
                  <FileText className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Assignments Due</p>
                <h3 className="text-2xl font-bold mb-1">7</h3>
                <p className="text-xs text-warning flex items-center gap-1">
                  <span>2 due today</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-stat border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-destructive/10 text-destructive">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Next Exam</p>
                <h3 className="text-2xl font-bold mb-1">5 Days</h3>
                <p className="text-xs text-muted-foreground">Mathematics</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-stat border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success/10 text-success">
                  <Target className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Study Goal</p>
                <h3 className="text-2xl font-bold mb-1">86%</h3>
                <Progress value={86} className="h-1.5 mt-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row - Modern Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Study Time by Subject */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Study Time Distribution</CardTitle>
                  <CardDescription className="text-xs mt-1">This week's breakdown</CardDescription>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={studyTimeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {studyTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {studyTimeData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-semibold ml-auto">{item.value}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Study Progress */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
                  <CardDescription className="text-xs mt-1">Daily study hours</CardDescription>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={weeklyProgressData}>
                  <XAxis 
                    dataKey="day" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#a78bfa" 
                    strokeWidth={2.5}
                    dot={{ fill: '#a78bfa', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Classes & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's Classes */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/calendar')} className="text-xs h-8">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { name: 'Mathematics', time: '09:00 - 10:30', room: 'Room 301' },
                { name: 'Physics', time: '11:00 - 12:30', room: 'Lab 2' },
                { name: 'English Literature', time: '14:00 - 15:30', room: 'Room 205' },
              ].map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">{cls.time} • {cls.room}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Assignments Due */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Assignments Status</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')} className="text-xs h-8">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={assignmentData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {assignmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-success/10 rounded-xl border border-success/20">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-success" />
                  <p className="font-semibold text-success text-sm">Great Progress! 🎉</p>
                </div>
                <p className="text-xs text-muted-foreground">You've completed 12 assignments this week. Keep it up!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}