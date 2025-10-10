import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Target, TrendingUp, Award, Calendar as CalendarIcon, FileText, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const studyTimeData = [
  { name: 'Math', value: 8, color: 'hsl(var(--chart-1))' },
  { name: 'Science', value: 6, color: 'hsl(var(--chart-2))' },
  { name: 'History', value: 4, color: 'hsl(var(--chart-3))' },
  { name: 'English', value: 5, color: 'hsl(var(--chart-4))' },
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
  { name: 'Due Today', value: 2, color: 'hsl(var(--destructive))' },
  { name: 'This Week', value: 5, color: 'hsl(var(--warning))' },
  { name: 'Completed', value: 12, color: 'hsl(var(--success))' },
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
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Study</p>
                  <h3 className="text-2xl font-bold mt-1">4.5 hrs</h3>
                  <p className="text-xs text-success mt-1">+30% vs yesterday</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assignments</p>
                  <h3 className="text-2xl font-bold mt-1">7 Due</h3>
                  <p className="text-xs text-warning mt-1">2 due today</p>
                </div>
                <div className="h-12 w-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Exam</p>
                  <h3 className="text-2xl font-bold mt-1">5 Days</h3>
                  <p className="text-xs text-muted-foreground mt-1">Mathematics</p>
                </div>
                <div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Study Goal</p>
                  <h3 className="text-2xl font-bold mt-1">12/14 hrs</h3>
                  <Progress value={85} className="h-2 mt-2" />
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time by Subject */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Study Time by Subject
              </CardTitle>
              <CardDescription>Weekly distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={studyTimeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {studyTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {studyTimeData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}: {item.value}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Study Progress */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Weekly Study Progress
              </CardTitle>
              <CardDescription>Hours studied per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyProgressData}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="hours" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's Classes & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Classes</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/calendar')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Mathematics', time: '09:00 - 10:30', room: 'Room 301', status: 'upcoming' },
                { name: 'Physics', time: '11:00 - 12:30', room: 'Lab 2', status: 'upcoming' },
                { name: 'English Literature', time: '14:00 - 15:30', room: 'Room 205', status: 'upcoming' },
              ].map((cls, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-xs text-muted-foreground">{cls.time} • {cls.room}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{cls.status}</Badge>
                </div>
              ))}
              <Button className="w-full gap-2" variant="outline" onClick={() => navigate('/calendar')}>
                <Plus className="h-4 w-4" />
                Add Class
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Assignments Due */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Assignments Due</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={assignmentData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {assignmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-success" />
                  <p className="font-semibold text-success">Great Progress! 🎉</p>
                </div>
                <p className="text-sm text-muted-foreground">You've completed 12 assignments this week. Keep it up!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
