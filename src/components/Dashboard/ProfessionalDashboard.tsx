import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { TrendingUp, Users, DollarSign, Activity, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/external-client";
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
    clients: 0,
    quotes: 0,
    invoices: 0,
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
        clients: clients?.length || 0,
        quotes: quotes?.length || 0,
        invoices: completedInvoices,
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
        { name: 'Mon', invoices: 12, quotes: 4 },
        { name: 'Tue', invoices: 19, quotes: 3 },
        { name: 'Wed', invoices: 15, quotes: 5 },
        { name: 'Thu', invoices: 22, quotes: 4 },
        { name: 'Fri', invoices: 18, quotes: 6 },
        { name: 'Sat', invoices: 8, quotes: 2 },
        { name: 'Sun', invoices: 5, quotes: 1 },
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
          title="Total Clients"
          value={stats.clients}
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Pending Quotes"
          value={stats.quotes}
          icon={BarChart3}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Paid Invoices"
          value={stats.invoices}
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
              subtitle="Invoices and quotes"
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
                  <Bar dataKey="invoices" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="quotes" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
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
          subtitle="Your latest business updates"
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
          <p className="text-muted-foreground mb-4">No data yet. Start creating invoices and quotes!</p>
          <Button onClick={() => window.location.href = '/invoices'}>
            Create Invoice
          </Button>
        </div>
      )}
    </div>
  );
}
