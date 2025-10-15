import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Clock, 
  CheckSquare, 
  FolderOpen, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Plus, 
  MoreVertical,
  Circle,
  Target,
  ListChecks,
  Activity,
  Share2,
  Edit3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, Area, AreaChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const weeklyProgressData = [
  { day: 'M', tasks: 12 },
  { day: 'T', tasks: 18 },
  { day: 'W', tasks: 23 },
  { day: 'T', tasks: 20 },
  { day: 'F', tasks: 27 },
  { day: 'S', tasks: 15 },
  { day: 'S', tasks: 8 },
];

const monthlyProgressData = [
  { week: 'W1', value: 65 },
  { week: 'W2', value: 78 },
  { week: 'W3', value: 82 },
  { week: 'W4', value: 120 },
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
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    projects: 0,
    hoursThisWeek: 0,
  });
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [monthlyGoals, setMonthlyGoals] = useState([
    { id: 1, text: 'Complete 3 major projects', completed: true },
    { id: 2, text: 'Log 160 hours of work', completed: false },
    { id: 3, text: 'Review 10 code submissions', completed: false },
  ]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const totalHours = timesheets?.reduce((sum, t) => sum + Number(t.hours), 0) || 0;

      setStats({
        totalTasks: tasksData?.length || 0,
        inProgress: tasksData?.filter(t => t.status === 'In Progress').length || 0,
        completed: tasksData?.filter(t => t.status === 'Completed').length || 0,
        projects: projectsData?.length || 0,
        hoursThisWeek: totalHours,
      });

      setTasks(tasksData?.filter(t => t.status === 'In Progress').slice(0, 2) || []);
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Overall Information Card - Hero Section */}
      <motion.div variants={itemVariants}>
        <Card className="card-gradient border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Overall Information</h2>
                <p className="text-sm text-muted-foreground">Your productivity at a glance</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ListChecks className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks for all time</p>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">Projects in progress</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckSquare className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold mb-1">{stats.projects}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>

              <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                  <Activity className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold mb-1">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>

              <div className="text-center p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                  <CheckSquare className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold mb-1">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Progress */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Weekly Progress
                    <TrendingUp className="h-4 w-4 text-success" />
                  </CardTitle>
                  <div className="flex gap-3 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Tasks</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyProgressData}>
                  <defs>
                    <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
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
                  <Area 
                    type="monotone" 
                    dataKey="tasks" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2.5}
                    fill="url(#taskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Month Progress */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Month Progress</CardTitle>
                  <p className="text-xs text-success mt-1">+{completionRate}% compared to last month</p>
                </div>
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-muted stroke-current"
                      strokeWidth="8"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                    />
                    <circle
                      className="text-primary stroke-current"
                      strokeWidth="8"
                      strokeLinecap="round"
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      strokeDasharray={`${completionRate * 2.51} 251`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">{completionRate}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Tasks</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="text-muted-foreground">Projects</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Goals and Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Month Goals */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Month Goals
                  <Target className="h-4 w-4 text-primary" />
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {monthlyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <Checkbox 
                    checked={goal.completed}
                    className="h-5 w-5"
                  />
                  <span className={`text-sm flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {goal.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tasks In Process */}
        <motion.div variants={itemVariants}>
          <Card className="card-modern border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Tasks In Process ({stats.inProgress})
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => navigate('/tasks')}
                  className="text-xs"
                >
                  Open archive →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 bg-card border border-border rounded-xl hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => navigate('/tasks')}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <Card className="card-modern border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-xs">
                  Sort by
                </Button>
                <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-5 bg-card border border-border rounded-2xl hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{project.name}</h4>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Circle className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant={project.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                        {project.status || 'In progress'}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 border-2 border-dashed border-border rounded-2xl">
                  <FolderOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No projects yet</p>
                  <Button onClick={() => navigate('/projects')} variant="outline">
                    Create Your First Project
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}