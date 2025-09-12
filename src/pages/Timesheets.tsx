import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, Calendar, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

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

export default function Timesheets() {
  const { user } = useAuth()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    description: '',
    hours: '',
    date: new Date().toISOString().split('T')[0],
    project_id: '',
    task_id: ''
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

  useEffect(() => {
    fetchTimeEntries()
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
          <p className="text-muted-foreground">Track your time and log work hours</p>
        </div>
        
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-lg font-semibold">{entry.hours}h</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <p className="text-foreground mb-2">{entry.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Project: {getProjectName(entry.project_id)}</span>
                      {getTaskTitle(entry.task_id) && (
                        <span>Task: {getTaskTitle(entry.task_id)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Logged {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredEntries.length === 0 && (
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
    </div>
  )
}