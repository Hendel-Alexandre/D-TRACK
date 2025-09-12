import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, Calendar, Search, CalendarIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface TimeEntry {
  id: string
  description: string
  hours: number
  date: string
  created_at: string
  project_id: string | null
  task_id: string | null
}

interface Project {
  id: string
  name: string
}

interface Task {
  id: string
  title: string
  project_id: string | null
}

interface HourAdjustment {
  id: string
  date: string
  hours: number
  type: string
  reason: string
  notes: string | null
  created_at: string
}

interface TimeSession {
  date: string
  totalHours: number
  breakDuration: number
  adjustmentHours: number
  entries: TimeEntry[]
}

export default function Timesheets() {
  const { user } = useAuth()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [hourAdjustments, setHourAdjustments] = useState<HourAdjustment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [hourBankBalance, setHourBankBalance] = useState(0)
  const [newEntry, setNewEntry] = useState({
    description: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    project_id: '',
    task_id: ''
  })
  const [newAdjustment, setNewAdjustment] = useState({
    date: new Date(),
    hours: '',
    type: '',
    reason: '',
    notes: ''
  })

  const fetchTimeEntries = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setTimeEntries(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const fetchHourAdjustments = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('hour_adjustments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setHourAdjustments(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const fetchHourBankBalance = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_hour_bank_balance')

      if (error) throw error
      setHourBankBalance(data || 0)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const fetchProjects = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'Active')

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const fetchTasks = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, project_id')
        .eq('user_id', user.id)
        .neq('status', 'Done')

      if (error) throw error
      setTasks(data || [])
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

  const createTimeEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase
        .from('timesheets')
        .insert({
          user_id: user.id,
          description: newEntry.description,
          hours: parseFloat(newEntry.hours),
          date: newEntry.date,
          project_id: newEntry.project_id && newEntry.project_id !== 'no-project' ? newEntry.project_id : null,
          task_id: newEntry.task_id && newEntry.task_id !== 'no-task' ? newEntry.task_id : null
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Time entry created successfully'
      })

      setNewEntry({
        description: '',
        hours: '',
        date: new Date().toISOString().split('T')[0],
        project_id: '',
        task_id: ''
      })
      setIsDialogOpen(false)
      fetchTimeEntries()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const createHourAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Frontend validation: Check if date is in the future
    const selectedDate = new Date(newAdjustment.date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of today for comparison
    
    if (selectedDate > today) {
      toast({
        title: 'Error',
        description: 'You cannot adjust hours for future dates.',
        variant: 'destructive'
      })
      return
    }

    try {
      const { error } = await supabase
        .from('hour_adjustments')
        .insert({
          user_id: user.id,
          date: format(newAdjustment.date, 'yyyy-MM-dd'),
          hours: parseFloat(newAdjustment.hours),
          type: newAdjustment.type,
          reason: newAdjustment.reason,
          notes: newAdjustment.notes || null
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Hour adjustment logged successfully'
      })

      setNewAdjustment({
        date: new Date(),
        hours: '',
        type: '',
        reason: '',
        notes: ''
      })
      setIsAdjustmentDialogOpen(false)
      fetchHourAdjustments()
      fetchHourBankBalance()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    fetchTimeEntries()
    fetchHourAdjustments()
    fetchHourBankBalance()
    fetchProjects()
    fetchTasks()
  }, [user])

  const filteredEntries = timeEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.hours, 0)

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return 'No project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown project'
  }

  const getTaskTitle = (taskId: string | null) => {
    if (!taskId) return null
    const task = tasks.find(t => t.id === taskId)
    return task?.title || 'Unknown task'
  }

  const availableTasks = tasks.filter(task => 
    !newEntry.project_id || task.project_id === newEntry.project_id
  )

  // Group entries by date for enhanced table view
  const groupedSessions = filteredEntries.reduce((groups: { [key: string]: TimeSession }, entry) => {
    const date = entry.date
    if (!groups[date]) {
      groups[date] = {
        date,
        totalHours: 0,
        breakDuration: 0, // Default 1 hour break
        adjustmentHours: 0,
        entries: []
      }
    }
    groups[date].totalHours += entry.hours
    groups[date].entries.push(entry)
    return groups
  }, {})

  // Add hour adjustments to sessions
  hourAdjustments.forEach(adjustment => {
    const date = adjustment.date
    if (groupedSessions[date]) {
      groupedSessions[date].adjustmentHours += adjustment.hours
    }
  })

  const sessionsList = Object.values(groupedSessions).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

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
          <h1 className="text-3xl font-bold text-foreground">Timesheets</h1>
          <p className="text-muted-foreground">Track your time and manage work hours</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={isAdjustmentDialogOpen} onOpenChange={setIsAdjustmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Minus className="h-4 w-4 mr-2" />
                Add Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Hour Adjustment</DialogTitle>
              </DialogHeader>
              <form onSubmit={createHourAdjustment} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newAdjustment.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAdjustment.date ? format(newAdjustment.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={newAdjustment.date}
                        onSelect={(date) => setNewAdjustment({ ...newAdjustment, date: date || new Date() })}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adj-hours">Hours (+/-)</Label>
                    <Input
                      id="adj-hours"
                      type="number"
                      step="0.25"
                      placeholder="-0.25 or +2.0"
                      value={newAdjustment.hours}
                      onChange={(e) => setNewAdjustment({ ...newAdjustment, hours: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adj-type">Type</Label>
                    <Select value={newAdjustment.type} onValueChange={(value) => setNewAdjustment({ ...newAdjustment, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Late">Late</SelectItem>
                        <SelectItem value="Overtime">Overtime</SelectItem>
                        <SelectItem value="Break">Break</SelectItem>
                        <SelectItem value="Sick">Sick</SelectItem>
                        <SelectItem value="Appointment">Appointment</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adj-reason">Reason</Label>
                  <Input
                    id="adj-reason"
                    placeholder="Brief reason for adjustment"
                    value={newAdjustment.reason}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adj-notes">Notes (optional)</Label>
                  <Textarea
                    id="adj-notes"
                    placeholder="Additional details..."
                    value={newAdjustment.notes}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAdjustmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Log Adjustment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Time Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={createTimeEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What did you work on?"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      placeholder="8.5"
                      value={newEntry.hours}
                      onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project</Label>
                    <Select 
                      value={newEntry.project_id || 'no-project'} 
                      onValueChange={(value) => setNewEntry({ ...newEntry, project_id: value === 'no-project' ? '' : value, task_id: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-project">No project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="task">Task</Label>
                    <Select value={newEntry.task_id || 'no-task'} onValueChange={(value) => setNewEntry({ ...newEntry, task_id: value === 'no-task' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-task">No task</SelectItem>
                        {availableTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Log Time</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hour Bank Balance</CardTitle>
            {hourBankBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hourBankBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {hourBankBalance >= 0 ? '+' : ''}{hourBankBalance.toFixed(2)}h
            </div>
            <p className="text-xs text-muted-foreground">
              {hourBankBalance >= 0 ? 'credit balance' : 'deficit balance'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              from {filteredEntries.length} entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries
                .filter(entry => {
                  const entryDate = new Date(entry.date)
                  const now = new Date()
                  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
                  return entryDate >= weekStart
                })
                .reduce((sum, entry) => sum + entry.hours, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredEntries.length > 0 ? (totalHours / new Set(filteredEntries.map(e => e.date)).size).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">hours per day</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search time entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Enhanced table view */}
      {sessionsList.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Work Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Break Duration</TableHead>
                  <TableHead>Adjustments</TableHead>
                  <TableHead>Net Hours</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionsList.map((session) => (
                  <TableRow key={session.date}>
                    <TableCell className="font-medium">
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>{session.totalHours.toFixed(2)}h</TableCell>
                    <TableCell>{session.breakDuration.toFixed(2)}h</TableCell>
                    <TableCell>
                      <span className={session.adjustmentHours >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {session.adjustmentHours >= 0 ? '+' : ''}{session.adjustmentHours.toFixed(2)}h
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {(session.totalHours + session.adjustmentHours - session.breakDuration).toFixed(2)}h
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {session.entries.map(e => e.description).join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No time entries found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No entries match your search.' : 'Start logging your time to track your work hours.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          )}
        </div>
      )}

      {/* Hour adjustments section */}
      {hourAdjustments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Hour Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hourAdjustments.slice(0, 10).map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      {new Date(adjustment.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell>{adjustment.type}</TableCell>
                    <TableCell>
                      <span className={adjustment.hours >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {adjustment.hours >= 0 ? '+' : ''}{adjustment.hours.toFixed(2)}h
                      </span>
                    </TableCell>
                    <TableCell>{adjustment.reason}</TableCell>
                    <TableCell className="max-w-xs truncate">{adjustment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}