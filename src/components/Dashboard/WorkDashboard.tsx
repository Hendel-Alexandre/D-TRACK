import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckSquare, FolderOpen, TrendingUp, Users, Calendar as CalendarIcon, BarChart3, Plus, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { DashboardCards } from './DashboardCards';

const taskCompletionData = [
  { name: 'Completed', value: 24, color: 'hsl(var(--success))' },
  { name: 'In Progress', value: 8, color: 'hsl(var(--warning))' },
  { name: 'Pending', value: 5, color: 'hsl(var(--muted))' },
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
    <div className="space-y-6">
      {/* Use existing DashboardCards */}
      <motion.div variants={itemVariants}>
        <DashboardCards />
      </motion.div>

      {/* Additional Work KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <h3 className="text-3xl font-bold mt-1">12</h3>
                  <p className="text-xs text-success mt-1">+2 this month</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-primary" />
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
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <h3 className="text-3xl font-bold mt-1">37</h3>
                  <p className="text-xs text-warning mt-1">8 in progress</p>
                </div>
                <div className="h-12 w-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-warning" />
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
                  <p className="text-sm text-muted-foreground">Hours This Week</p>
                  <h3 className="text-3xl font-bold mt-1">40.2</h3>
                  <p className="text-xs text-success mt-1">+5% vs last week</p>
                </div>
                <div className="h-12 w-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-success" />
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
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <h3 className="text-3xl font-bold mt-1">8</h3>
                  <p className="text-xs text-muted-foreground mt-1">Active now</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours Logged */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Hours Logged This Week
              </CardTitle>
              <CardDescription>Daily breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyHoursData}>
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Completion */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-success" />
                Task Completion Status
              </CardTitle>
              <CardDescription>Current sprint overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={taskCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {taskCompletionData.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }} />
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Productivity Trend & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Productivity Trend
              </CardTitle>
              <CardDescription>Last 4 weeks performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={productivityTrendData}>
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                    dataKey="productivity" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--success))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold text-primary">Darvis AI Summary</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This week: 6 tasks completed, 2 pending. Your productivity increased by 17% compared to last week!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div variants={itemVariants}>
          <Card className="border-border/50 bg-gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Deadlines</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Q4 Report', due: 'Due Tomorrow', priority: 'high', project: 'Finance' },
                { title: 'Client Presentation', due: 'Due in 3 days', priority: 'medium', project: 'Marketing' },
                { title: 'Code Review', due: 'Due in 5 days', priority: 'low', project: 'Development' },
              ].map((task, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      task.priority === 'high' ? 'bg-destructive/10' : 
                      task.priority === 'medium' ? 'bg-warning/10' : 'bg-success/10'
                    }`}>
                      <CalendarIcon className={`h-5 w-5 ${
                        task.priority === 'high' ? 'text-destructive' : 
                        task.priority === 'medium' ? 'text-warning' : 'text-success'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project} • {task.due}</p>
                    </div>
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
              <Button className="w-full gap-2" variant="outline" onClick={() => navigate('/tasks')}>
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
