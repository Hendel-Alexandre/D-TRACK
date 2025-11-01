import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { TrendingUp, Users, DollarSign, Activity, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export function ProfessionalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    revenue: 0,
    projects: 0,
    team: 0,
    tasks: 0,
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id);

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user?.id);

      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user?.id);

      const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.total), 0) || 0
      const completedInvoices = invoices?.filter(i => i.status === 'paid').length || 0

      setStats({
        revenue: totalRevenue,
        projects: clients?.length || 0,
        team: quotes?.length || 0,
        tasks: completedInvoices,
      });

      setRevenueData([
        { name: 'Jan', value: totalRevenue * 0.1 },
        { name: 'Feb', value: totalRevenue * 0.12 },
        { name: 'Mar', value: totalRevenue * 0.18 },
        { name: 'Apr', value: totalRevenue * 0.15 },
        { name: 'May', value: totalRevenue * 0.22 },
        { name: 'Jun', value: totalRevenue * 0.23 },
      ]);
      
      setActivityData([
        { name: 'Mon', tasks: 12, projects: 4 },
        { name: 'Tue', tasks: 19, projects: 3 },
        { name: 'Wed', tasks: 15, projects: 5 },
        { name: 'Thu', tasks: 22, projects: 4 },
        { name: 'Fri', tasks: 18, projects: 6 },
        { name: 'Sat', tasks: 8, projects: 2 },
        { name: 'Sun', tasks: 5, projects: 1 },
      ]);
      
      setRecentActivity([
        { user: 'You', action: 'created invoice', time: '2 minutes ago' },
        { user: 'System', action: 'payment received', time: '1 hour ago' },
        { user: 'You', action: 'sent quote', time: '3 hours ago' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Projects"
          value={stats.projects}
          icon={BarChart3}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Team Members"
          value={stats.team}
          icon={Users}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Tasks Completed"
          value={stats.tasks}
          icon={Activity}
          iconColor="text-orange-500"
        />
      </div>

      {/* Charts Row */}
      {(revenueData.length > 0 || activityData.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {revenueData.length > 0 && (
            <ChartCard
              title="Revenue Overview"
              subtitle="Monthly performance"
              headerAction={
                <Select defaultValue="6m">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              }
            >
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {activityData.length > 0 && (
            <ChartCard
              title="Weekly Activity"
              subtitle="Tasks and projects"
              headerAction={
                <Tabs defaultValue="week" className="w-fit">
                  <TabsList>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                  </TabsList>
                </Tabs>
              }
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="projects" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <ChartCard
          title="Recent Activity"
          subtitle="Your team's latest updates"
          headerAction={
            <Button variant="ghost" size="sm">
              View All
            </Button>
          }
        >
          <div className="space-y-4">
            {recentActivity.map((activity: any, i: number) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold">{activity.user?.charAt(0) || 'U'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    {" "}
                    <span className="text-muted-foreground">{activity.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        </ChartCard>
      )}

      {/* Empty State */}
      {revenueData.length === 0 && activityData.length === 0 && recentActivity.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No data yet. Start tracking your time and creating projects!</p>
          <Button onClick={() => window.location.href = '/timesheets'}>
            Start Tracking
          </Button>
        </div>
      )}
    </div>
  );
}
