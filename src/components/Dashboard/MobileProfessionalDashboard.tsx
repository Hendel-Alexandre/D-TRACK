import { StatCard } from "./StatCard";
import { ChartCard } from "./ChartCard";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

export function MobileProfessionalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    revenue: 0,
    projects: 0,
    team: 0,
    tasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id);

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id);

      const { data: timesheets } = await supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', user?.id);

      setStats({
        revenue: timesheets?.reduce((sum, t) => sum + (Number(t.hours) * 50), 0) || 0,
        projects: projects?.length || 0,
        team: 1,
        tasks: tasks?.filter(t => t.status === 'Completed').length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Revenue"
          value={`$${(stats.revenue / 1000).toFixed(1)}K`}
          icon={DollarSign}
          iconColor="text-green-500"
          className="p-4"
        />
        <StatCard
          title="Projects"
          value={stats.projects}
          icon={Activity}
          iconColor="text-blue-500"
          className="p-4"
        />
        <StatCard
          title="Team"
          value={stats.team}
          icon={Users}
          iconColor="text-purple-500"
          className="p-4"
        />
        <StatCard
          title="Tasks"
          value={stats.tasks}
          icon={TrendingUp}
          iconColor="text-orange-500"
          className="p-4"
        />
      </div>
    </div>
  );
}
