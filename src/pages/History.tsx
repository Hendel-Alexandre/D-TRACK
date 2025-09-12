import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Clock, FolderOpen, Settings, Activity } from 'lucide-react'

interface HistoryLog {
  id: string
  category: string
  action: string
  details: any
  created_at: string
}

export default function History() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<HistoryLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<HistoryLog[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLogs()
    }
  }, [user])

  useEffect(() => {
    if (filter === 'All') {
      setFilteredLogs(logs)
    } else {
      setFilteredLogs(logs.filter(log => log.category === filter))
    }
  }, [filter, logs])

  const fetchLogs = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('history_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error fetching history logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Hour Adjustment':
        return <Clock className="h-4 w-4" />
      case 'Project':
        return <FolderOpen className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hour Adjustment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'Project':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Created':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
      case 'Updated':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
      case 'Deleted':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDetails = (category: string, action: string, details: any) => {
    if (!details) return '-'

    switch (category) {
      case 'Hour Adjustment':
        return `${details.hours > 0 ? '+' : ''}${details.hours}h - ${details.reason || 'No reason provided'}`
      case 'Project':
        return details.name || 'Project'
      default:
        return JSON.stringify(details)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">History</h1>
            <p className="text-muted-foreground">
              Track all your actions and changes
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <p className="text-muted-foreground">
            Track all your actions and changes
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Log
              </CardTitle>
              <CardDescription>
                View all your recent actions and changes
              </CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Hour Adjustment">Hour Adjustments</SelectItem>
                <SelectItem value="Project">Projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No activity found</h3>
              <p className="text-muted-foreground">
                {filter === 'All' 
                  ? 'Your actions will appear here as you use the app'
                  : `No ${filter.toLowerCase()} actions found`
                }
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getCategoryColor(log.category)}>
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(log.category)}
                            {log.category}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {formatDetails(log.category, log.action, log.details)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}