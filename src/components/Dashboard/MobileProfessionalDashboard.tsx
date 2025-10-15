import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, 
  FolderOpen, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Plus, 
  MoreVertical,
  ListChecks,
  Activity,
  Target,
  Edit3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const weeklyProgressData = [
  { day: 'M', tasks: 12 },
  { day: 'T', tasks: 18 },
  { day: 'W', tasks: 23 },
  { day: 'T', tasks: 20 },
  { day: 'F', tasks: 27 },
  { day: 'S', tasks: 15 },
  { day: 'S', tasks: 8 },
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
};

export function MobileProfessionalDashboard() {
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
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0;

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Overall Information Card */}
      <motion.div variants={itemVariants}>
        <Card className="card-gradient border-0">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-3">Overall Information</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-card/50 rounded-xl p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ListChecks className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 rounded-xl p-3 border border-border/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-card/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <p className="text-lg font-bold">{stats.projects}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>

              <div className="text-center p-3 bg-card/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-1">
                  <Activity className="h-4 w-4 text-warning" />
                </div>
                <p className="text-lg font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>

              <div className="text-center p-3 bg-card/50 rounded-lg border border-border/50">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-1">
                  <CheckSquare className="h-4 w-4 text-success" />
                </div>
                <p className="text-lg font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Progress Chart */}
      <motion.div variants={itemVariants}>
        <Card className="card-modern border-0">
          <CardHeader className="pb-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Weekly Progress
                <TrendingUp className="h-4 w-4 text-success" />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={150}>
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
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
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
          <CardHeader className="pb-3 px-4">
            <CardTitle className="text-base font-semibold">Month Progress</CardTitle>
            <p className="text-xs text-success mt-1">+{completionRate}% completed</p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
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
                  <span className="text-2xl font-bold">{completionRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Month Goals */}
      <motion.div variants={itemVariants}>
        <Card className="card-modern border-0">
          <CardHeader className="pb-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Month Goals
                <Target className="h-4 w-4 text-primary" />
              </CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {monthlyGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-2 p-2.5 bg-secondary/30 rounded-lg"
              >
                <Checkbox 
                  checked={goal.completed}
                  className="h-4 w-4"
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
          <CardHeader className="pb-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Tasks In Process ({stats.inProgress})
              </CardTitle>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => navigate('/tasks')}
                className="text-xs h-8"
              >
                View all →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 bg-card border border-border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
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

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <Card className="card-modern border-0">
          <CardHeader className="pb-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Projects</CardTitle>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => navigate('/projects')}
                className="text-xs h-8"
              >
                View all →
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 bg-card border border-border rounded-lg"
                >
                  <h4 className="font-medium text-sm mb-1">{project.name}</h4>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => navigate('/projects')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
