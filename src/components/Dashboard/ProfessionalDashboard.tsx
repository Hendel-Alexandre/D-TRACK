import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { TrendingUp, Users, DollarSign, Activity, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const revenueData = [
  { name: "Jan", value: 4200 },
  { name: "Feb", value: 5100 },
  { name: "Mar", value: 4800 },
  { name: "Apr", value: 6200 },
  { name: "May", value: 5800 },
  { name: "Jun", value: 7100 },
];

const activityData = [
  { name: "Mon", tasks: 12, projects: 8 },
  { name: "Tue", tasks: 19, projects: 6 },
  { name: "Wed", tasks: 15, projects: 10 },
  { name: "Thu", tasks: 22, projects: 12 },
  { name: "Fri", tasks: 18, projects: 9 },
  { name: "Sat", tasks: 8, projects: 4 },
  { name: "Sun", tasks: 5, projects: 2 },
];

export function ProfessionalDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231"
          change="+20.1%"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-green-500"
        />
        <StatCard
          title="Active Projects"
          value="12"
          change="+4 this week"
          changeType="positive"
          icon={BarChart3}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Team Members"
          value="24"
          change="+2 new"
          changeType="positive"
          icon={Users}
          iconColor="text-purple-500"
        />
        <StatCard
          title="Tasks Completed"
          value="187"
          change="+12%"
          changeType="positive"
          icon={Activity}
          iconColor="text-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
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
      </div>

      {/* Recent Activity */}
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
          {[
            {
              user: "Sarah Johnson",
              action: "completed",
              target: "Website Redesign",
              time: "2 hours ago",
              color: "text-green-500",
            },
            {
              user: "Mike Chen",
              action: "created",
              target: "Marketing Campaign Q2",
              time: "4 hours ago",
              color: "text-blue-500",
            },
            {
              user: "Emma Davis",
              action: "updated",
              target: "Client Proposal",
              time: "6 hours ago",
              color: "text-yellow-500",
            },
            {
              user: "Alex Turner",
              action: "reviewed",
              target: "Budget Report",
              time: "1 day ago",
              color: "text-purple-500",
            },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold">{activity.user.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span>
                  {" "}
                  <span className={activity.color}>{activity.action}</span>
                  {" "}
                  <span className="text-muted-foreground">{activity.target}</span>
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
    </div>
  );
}
