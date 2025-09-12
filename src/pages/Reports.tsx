import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Clock, TrendingUp, Calendar, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

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

export default function Reports() {
  const { user } = useAuth()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [reportPeriod, setReportPeriod] = useState('month')

  const fetchData = async () => {
    if (!user) return
    
    try {
      const [timeEntriesResult, projectsResult] = await Promise.all([
        supabase
          .from('timesheets')
          .select('id, description, hours, date, project_id')
          .eq('user_id', user.id),
        supabase
          .from('projects')
          .select('id, name')
          .eq('user_id', user.id)
      ])

      if (timeEntriesResult.error) throw timeEntriesResult.error
      if (projectsResult.error) throw projectsResult.error

      setTimeEntries(timeEntriesResult.data || [])
      setProjects(projectsResult.data || [])
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

  const getFilteredEntries = () => {
    const now = new Date()
    let startDate: Date

    switch (reportPeriod) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        return timeEntries
    }

    return timeEntries.filter(entry => new Date(entry.date) >= startDate)
  }

  const filteredEntries = getFilteredEntries()

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
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hours by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectReports.slice(0, 5).map((project, index) => (
                <motion.div
                  key={project.project_id || 'no-project'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-primary`} 
                         style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} />
                    <span className="font-medium truncate">{project.project_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{project.total_hours.toFixed(1)}h</div>
                    <div className="text-xs text-muted-foreground">
                      {project.entry_count} entries
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {projectReports.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No project data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEntries.slice(0, 5).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium truncate">{entry.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{entry.hours}h</span>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredEntries.length === 0 && (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No time entries for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}