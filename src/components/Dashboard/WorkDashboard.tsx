import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckSquare, FolderOpen, TrendingUp, Users, Calendar as CalendarIcon, BarChart3, Plus, MoreVertical } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { DashboardCards } from './DashboardCards';

const taskCompletionData = [
  { name: 'Completed', value: 24, color: '#10b981' },
  { name: 'In Progress', value: 8, color: '#f59e0b' },
  { name: 'Pending', value: 5, color: '#6b7280' },
];

const weeklyHoursData = [
  { day: 'Mon', hours: 8.5 },
  { day: 'Tue', hours: 7.2 },
  { day: 'Wed', hours: 9.0 },
  { day: 'Thu', hours: 8.0 },
  { day: 'Fri', hours: 7.5 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
];

const productivityTrendData = [
  { week: 'W1', productivity: 75 },
  { week: 'W2', productivity: 82 },
  { week: 'W3', productivity: 88 },
  { week: 'W4', productivity: 92 },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export function WorkDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Use existing DashboardCards */}
      <motion.div variants={itemVariants}>
        <DashboardCards />
      </motion.div>

      {/* Work KPIs - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="card-stat border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="stat-card-icon">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Projects</p>
                <h3 className="text-2xl font-bold mb-1">12</h3>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="text-success">↑ 2</span>
                  <span className="text-muted-foreground">this month</span>
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
                  <CheckSquare className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Active Tasks</p>
                <h3 className="text-2xl font-bold mb-1">37</h3>
                <p className="text-xs text-warning">8 in progress</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-stat border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-success/10 text-success">
                  <Clock className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Hours This Week</p>
                <h3 className="text-2xl font-bold mb-1">40.2</h3>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="text-success">↑ 5%</span>
                  <span className="text-muted-foreground">vs last week</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="card-stat border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="stat-card-icon">
                  <Users className="h-5 w-5" />
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team Members</p>
                <h3 className="text-2xl font-bold mb-1">8</h3>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row - Modern Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hours Logged */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Weekly Hours</CardTitle>
                  <CardDescription className="text-xs mt-1">Time logged this week</CardDescription>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyHoursData}>
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
                  <Bar dataKey="hours" fill="#a78bfa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Completion */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Task Status</CardTitle>
                  <CardDescription className="text-xs mt-1">Current sprint overview</CardDescription>
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
                    data={taskCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {taskCompletionData.map((entry, index) => (
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
              <div className="grid grid-cols-3 gap-3 mt-4">
                {taskCompletionData.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-2.5 h-2.5 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                    <p className="text-xs text-muted-foreground mb-0.5">{item.name}</p>
                    <p className="text-base font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Productivity Trend & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Productivity Trend */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Productivity Trend</CardTitle>
                  <CardDescription className="text-xs mt-1">Last 4 weeks performance</CardDescription>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={productivityTrendData}>
                  <XAxis 
                    dataKey="week" 
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
                    dataKey="productivity" 
                    stroke="#10b981" 
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-sm font-semibold text-primary mb-1">Darvis AI Summary</p>
                <p className="text-xs text-muted-foreground">
                  This week: 6 tasks completed, 2 pending. Your productivity increased by 17% compared to last week!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')} className="text-xs h-8">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { title: 'Q4 Report', due: 'Due Tomorrow', priority: 'high', project: 'Finance' },
                { title: 'Client Presentation', due: 'Due in 3 days', priority: 'medium', project: 'Marketing' },
                { title: 'Code Review', due: 'Due in 5 days', priority: 'low', project: 'Development' },
              ].map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      task.priority === 'high' ? 'bg-destructive/10 text-destructive' : 
                      task.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}>
                      <CalendarIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project} • {task.due}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}