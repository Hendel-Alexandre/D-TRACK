import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
  { name: "Mon", value: 12 },
  { name: "Tue", value: 19 },
  { name: "Wed", value: 15 },
  { name: "Thu", value: 22 },
  { name: "Fri", value: 18 },
];

export function MobileProfessionalDashboard() {
  return (
    <div className="space-y-4 pb-20">
      {/* Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Revenue"
          value="$45.2K"
          change="+20%"
          changeType="positive"
          icon={DollarSign}
          iconColor="text-green-500"
          className="p-4"
        />
        <StatCard
          title="Projects"
          value="12"
          change="+4"
          changeType="positive"
          icon={Activity}
          iconColor="text-blue-500"
          className="p-4"
        />
        <StatCard
          title="Team"
          value="24"
          change="+2"
          changeType="positive"
          icon={Users}
          iconColor="text-purple-500"
          className="p-4"
        />
        <StatCard
          title="Tasks"
          value="187"
          change="+12%"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-orange-500"
          className="p-4"
        />
      </div>

      {/* Revenue Chart */}
      <ChartCard
        title="Revenue"
        subtitle="Last 6 months"
        headerAction={
          <Select defaultValue="6m">
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7d</SelectItem>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="6m">6m</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="mobileColorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#mobileColorValue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Activity Chart */}
      <ChartCard
        title="Weekly Activity"
        headerAction={
          <Tabs defaultValue="week" className="w-fit">
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-2">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Recent Activity - Compact for mobile */}
      <ChartCard title="Recent Activity">
        <div className="space-y-3">
          {[
            { user: "Sarah J.", action: "completed Website Redesign", time: "2h ago" },
            { user: "Mike C.", action: "created Marketing Campaign", time: "4h ago" },
            { user: "Emma D.", action: "updated Client Proposal", time: "6h ago" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold shrink-0">
                {activity.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">
                  <span className="font-medium">{activity.user}</span>
                  {" "}
                  <span className="text-muted-foreground">{activity.action}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
