import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Clock, TrendingUp, Calendar, Download, CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, addDays, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface TimeEntry {
  id: string
  description: string
  hours: number
  date: string
  project_id: string | null
}

interface Project {
  id: string
  name: string
}

interface ProjectReport {
  project_id: string | null
  project_name: string
  total_hours: number
  entry_count: number
}

interface Note {
  id: string
  title: string
  created_at: string
}

interface Task {
  id: string
  title: string
  status: string
  created_at: string
}

interface ChartData {
  date: string
  hours: number
  notes: number
  tasks: number
  projects: number
}

export default function Reports() {
  const { user } = useAuth()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [reportPeriod, setReportPeriod] = useState('week')
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar')

  const fetchData = async () => {
    if (!user) return
    
    try {
      const [timeEntriesResult, projectsResult, notesResult, tasksResult] = await Promise.all([
        supabase
          .from('timesheets')
          .select('id, description, hours, date, project_id')
          .eq('user_id', user.id),
        supabase
          .from('projects')
          .select('id, name')
          .eq('user_id', user.id),
        supabase
          .from('notes')
          .select('id, title, created_at')
          .eq('user_id', user.id),
        supabase
          .from('tasks')
          .select('id, title, status, created_at')
          .eq('user_id', user.id)
      ])

      if (timeEntriesResult.error) throw timeEntriesResult.error
      if (projectsResult.error) throw projectsResult.error
      if (notesResult.error) throw notesResult.error
      if (tasksResult.error) throw tasksResult.error

      setTimeEntries(timeEntriesResult.data || [])
      setProjects(projectsResult.data || [])
      setNotes(notesResult.data || [])
      setTasks(tasksResult.data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user])

  const getDateRange = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    if (customDate) {
      startDate = customDate
      endDate = addDays(customDate, 1)
    } else {
      switch (reportPeriod) {
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 })
          endDate = endOfWeek(now, { weekStartsOn: 1 })
          break
        case 'month':
          startDate = startOfMonth(now)
          endDate = endOfMonth(now)
          break
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3
          startDate = new Date(now.getFullYear(), quarterStart, 1)
          endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
          break
        case 'year':
          startDate = startOfYear(now)
          endDate = endOfYear(now)
          break
        default:
          return { startDate: new Date(0), endDate: now }
      }
    }

    return { startDate, endDate }
  }

  const getFilteredEntries = () => {
    const { startDate, endDate } = getDateRange()
    return timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startDate && entryDate <= endDate
    })
  }

  const getFilteredNotes = () => {
    const { startDate, endDate } = getDateRange()
    return notes.filter(note => {
      const noteDate = new Date(note.created_at)
      return noteDate >= startDate && noteDate <= endDate
    })
  }

  const getFilteredTasks = () => {
    const { startDate, endDate } = getDateRange()
    return tasks.filter(task => {
      const taskDate = new Date(task.created_at)
      return taskDate >= startDate && taskDate <= endDate
    })
  }

  const filteredEntries = getFilteredEntries()
  const filteredNotes = getFilteredNotes()
  const filteredTasks = getFilteredTasks()
  const filteredProjects = projects.filter(project => 
    filteredEntries.some(entry => entry.project_id === project.id)
  )

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0)
  const averageHoursPerDay = filteredEntries.length > 0 
    ? totalHours / new Set(filteredEntries.map(e => e.date)).size
    : 0

  const projectReports: ProjectReport[] = filteredEntries.reduce((acc: ProjectReport[], entry) => {
    const existingReport = acc.find(r => r.project_id === entry.project_id)
    const projectName = entry.project_id 
      ? projects.find(p => p.id === entry.project_id)?.name || 'Unknown Project'
      : 'No Project'

    if (existingReport) {
      existingReport.total_hours += entry.hours
      existingReport.entry_count += 1
    } else {
      acc.push({
        project_id: entry.project_id,
        project_name: projectName,
        total_hours: entry.hours,
        entry_count: 1
      })
    }
    return acc
  }, []).sort((a, b) => b.total_hours - a.total_hours)

  const dailyHours = filteredEntries.reduce((acc: { [key: string]: number }, entry) => {
    acc[entry.date] = (acc[entry.date] || 0) + entry.hours
    return acc
  }, {})

  const topProject = projectReports[0]
  const mostProductiveDay = Object.entries(dailyHours).sort(([,a], [,b]) => b - a)[0]

  // Generate chart data
  const generateChartData = (): ChartData[] => {
    const { startDate, endDate } = getDateRange()
    const data: ChartData[] = []
    
    for (let d = new Date(startDate); d <= endDate; d = addDays(d, 1)) {
      const dateStr = format(d, 'yyyy-MM-dd')
      const dayHours = filteredEntries
        .filter(entry => entry.date === dateStr)
        .reduce((sum, entry) => sum + entry.hours, 0)
      
      const dayNotes = filteredNotes
        .filter(note => format(new Date(note.created_at), 'yyyy-MM-dd') === dateStr)
        .length
      
      const dayTasks = filteredTasks
        .filter(task => format(new Date(task.created_at), 'yyyy-MM-dd') === dateStr)
        .length
      
      const dayProjects = new Set(
        filteredEntries
          .filter(entry => entry.date === dateStr && entry.project_id)
          .map(entry => entry.project_id)
      ).size
      
      data.push({
        date: format(d, 'MMM dd'),
        hours: Number(dayHours.toFixed(1)),
        notes: dayNotes,
        tasks: dayTasks,
        projects: dayProjects
      })
    }
    
    return data
  }

  const chartData = generateChartData()
  
  const chartConfig = {
    hours: {
      label: "Hours",
      color: "hsl(var(--primary))"
    },
    notes: {
      label: "Notes",
      color: "hsl(142, 76%, 36%)"
    },
    tasks: {
      label: "Tasks", 
      color: "hsl(346, 87%, 43%)"
    },
    projects: {
      label: "Projects",
      color: "hsl(262, 83%, 58%)"
    }
  }

  const pieData = [
    { name: 'Hours', value: totalHours, color: 'hsl(var(--primary))' },
    { name: 'Notes', value: filteredNotes.length, color: 'hsl(142, 76%, 36%)' },
    { name: 'Tasks', value: filteredTasks.length, color: 'hsl(346, 87%, 43%)' },
    { name: 'Projects', value: filteredProjects.length, color: 'hsl(262, 83%, 58%)' }
  ]

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Hours', 'Project']
    const rows = filteredEntries.map(entry => [
      entry.date,
      entry.description,
      entry.hours.toString(),
      entry.project_id 
        ? projects.find(p => p.id === entry.project_id)?.name || 'Unknown Project'
        : 'No Project'
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timesheet-report-${reportPeriod}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: 'Success',
      description: 'Report exported successfully'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analyze your time tracking data</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={reportPeriod} onValueChange={(value) => {
            setReportPeriod(value)
            setCustomDate(undefined)
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {customDate ? format(customDate, 'PPP') : 'Custom Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={customDate}
                onSelect={(date) => {
                  setCustomDate(date)
                  if (date) setReportPeriod('custom')
                  setDatePickerOpen(false)
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'pie') => setChartType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredEntries.length} entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageHoursPerDay.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">hours per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Project</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topProject ? topProject.total_hours.toFixed(1) : '0'}h
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {topProject ? topProject.project_name : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Productive</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mostProductiveDay ? mostProductiveDay[1].toFixed(1) : '0'}h
            </div>
            <p className="text-xs text-muted-foreground">
              {mostProductiveDay ? new Date(mostProductiveDay[0]).toLocaleDateString() : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Analytics Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">
              {customDate ? `Data for ${format(customDate, 'PPP')}` : `${reportPeriod} overview`}
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <>
                  {chartType === 'bar' && (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent className="bg-background border border-border shadow-lg" />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar 
                        dataKey="hours" 
                        fill="var(--color-hours)" 
                        radius={[2, 2, 0, 0]}
                        className="hover:opacity-80 transition-opacity duration-200"
                      />
                      <Bar 
                        dataKey="notes" 
                        fill="var(--color-notes)" 
                        radius={[2, 2, 0, 0]}
                        className="hover:opacity-80 transition-opacity duration-200"
                      />
                      <Bar 
                        dataKey="tasks" 
                        fill="var(--color-tasks)" 
                        radius={[2, 2, 0, 0]}
                        className="hover:opacity-80 transition-opacity duration-200"
                      />
                      <Bar 
                        dataKey="projects" 
                        fill="var(--color-projects)" 
                        radius={[2, 2, 0, 0]}
                        className="hover:opacity-80 transition-opacity duration-200"
                      />
                    </BarChart>
                  )}
                  
                  {chartType === 'line' && (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs fill-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent className="bg-background border border-border shadow-lg" />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="var(--color-hours)" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        className="hover:stroke-opacity-80 transition-all duration-200"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="notes" 
                        stroke="var(--color-notes)" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        className="hover:stroke-opacity-80 transition-all duration-200"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tasks" 
                        stroke="var(--color-tasks)" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        className="hover:stroke-opacity-80 transition-all duration-200"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="projects" 
                        stroke="var(--color-projects)" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        className="hover:stroke-opacity-80 transition-all duration-200"
                      />
                    </LineChart>
                  )}
                  
                  {chartType === 'pie' && (
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        className="hover:scale-105 transition-transform duration-200"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent className="bg-background border border-border shadow-lg" />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  )}
                </>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hours by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {projectReports.slice(0, 8).map((project, index) => (
                <motion.div
                  key={project.project_id || 'no-project'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full`} 
                         style={{ backgroundColor: `hsl(${index * 45}, 70%, 50%)` }} />
                    <span className="font-medium text-sm truncate max-w-[120px]">{project.project_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{project.total_hours.toFixed(1)}h</div>
                    <div className="text-xs text-muted-foreground">
                      {project.entry_count} entries
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {projectReports.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No project data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}