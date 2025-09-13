import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Clock, Bell, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface CalendarTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  created_at: string
  project_id: string | null
  reminder_enabled: boolean
  reminder_days_before: number
  reminder_hours_before: number
}

interface Project {
  id: string
  name: string
}

export default function Calendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [tasks, setTasks] = useState<CalendarTask[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: Date } | null>(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    due_date: '',
    project_id: 'none',
    reminder_enabled: false,
    reminder_days_before: 0,
    reminder_hours_before: 0
  })

  const fetchTasks = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (error) throw error
      setTasks(data || [])
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
    } finally {
      setLoading(false)
    }
  }

  const createOrUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const taskData = {
        user_id: user.id,
        title: newTask.title,
        description: newTask.description || null,
        status: newTask.status,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        project_id: newTask.project_id === 'none' ? null : newTask.project_id || null,
        reminder_enabled: newTask.reminder_enabled,
        reminder_days_before: newTask.reminder_days_before,
        reminder_hours_before: newTask.reminder_hours_before
      }

      let error
      if (editingTask) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', editingTask.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(taskData)
        error = insertError
      }

      if (error) throw error

      toast({
        title: 'Success',
        description: editingTask ? 'Task updated successfully' : 'Task created successfully'
      })

      resetForm()
      setIsDialogOpen(false)
      fetchTasks()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(tasks.filter(task => task.id !== taskId))
      toast({
        title: 'Success',
        description: 'Task deleted successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setNewTask({
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      due_date: '',
      project_id: 'none',
      reminder_enabled: false,
      reminder_days_before: 0,
      reminder_hours_before: 0
    })
    setEditingTask(null)
  }

  const openTaskDialog = (task?: CalendarTask, date?: Date) => {
    if (task) {
      setEditingTask(task)
      setNewTask({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || '',
        project_id: task.project_id || 'none',
        reminder_enabled: task.reminder_enabled,
        reminder_days_before: task.reminder_days_before,
        reminder_hours_before: task.reminder_hours_before
      })
    } else {
      resetForm()
      if (date) {
        setNewTask(prev => ({ ...prev, due_date: format(date, 'yyyy-MM-dd') }))
      }
    }
    setIsDialogOpen(true)
  }

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [user])

  // Calendar generation
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), date)
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive text-destructive-foreground'
      case 'Medium': return 'bg-warning text-warning-foreground'
      case 'Low': return 'bg-success text-success-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
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
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Manage your tasks and schedule</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={createOrUpdateTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Todo">Todo</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={newTask.project_id} onValueChange={(value) => setNewTask({ ...newTask, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No project</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reminder_enabled"
                    checked={newTask.reminder_enabled}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, reminder_enabled: !!checked })}
                  />
                  <Label htmlFor="reminder_enabled">Enable Reminder</Label>
                </div>

                {newTask.reminder_enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="reminder_days">Days Before</Label>
                      <Input
                        id="reminder_days"
                        type="number"
                        min="0"
                        max="30"
                        value={newTask.reminder_days_before}
                        onChange={(e) => setNewTask({ ...newTask, reminder_days_before: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reminder_hours">Hours Before</Label>
                      <Input
                        id="reminder_hours"
                        type="number"
                        min="0"
                        max="23"
                        value={newTask.reminder_hours_before}
                        onChange={(e) => setNewTask({ ...newTask, reminder_hours_before: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, -1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  Next
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map(day => {
                  const dayTasks = getTasksForDate(day)
                  const isToday = isSameDay(day, new Date())
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  
                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ scale: 1.02 }}
                      className={`
                        relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all
                        ${isCurrentMonth ? 'bg-background hover:bg-accent' : 'bg-muted/50 text-muted-foreground'}
                        ${isToday ? 'ring-2 ring-primary' : ''}
                        ${selectedDate && isSameDay(day, selectedDate) ? 'bg-primary/10' : ''}
                      `}
                      onClick={() => {
                        setSelectedDate(day)
                        setContextMenu(null)
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setContextMenu({ x: e.clientX, y: e.clientY, date: day })
                        setSelectedDate(day)
                      }}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      
                      {dayTasks.length > 0 && (
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map(task => (
                            <div
                              key={task.id}
                              className="text-xs p-1 rounded bg-primary/20 text-primary truncate"
                              onClick={(e) => {
                                e.stopPropagation()
                                openTaskDialog(task)
                              }}
                            >
                              {task.title}
                              {task.reminder_enabled && (
                                <Bell className="inline h-2 w-2 ml-1" />
                              )}
                            </div>
                          ))}
                          
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                          
                          {/* Activity indicator */}
                          <div className="absolute top-1 right-1">
                            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? `Tasks for ${format(selectedDate, 'MMM d')}` : 'Upcoming Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-3">
                  {getTasksForDate(selectedDate).map(task => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{task.title}</h4>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openTaskDialog(task)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">{task.status}</Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {task.reminder_enabled && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Bell className="h-3 w-3 mr-1" />
                          Reminder: {task.reminder_days_before}d {task.reminder_hours_before}h before
                        </div>
                      )}
                    </motion.div>
                  ))}
                  
                  {getTasksForDate(selectedDate).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tasks for this date. Click to add one!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.filter(task => task.due_date && new Date(task.due_date) >= new Date()).slice(0, 5).map(task => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      onClick={() => openTaskDialog(task)}
                    >
                      <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Due: {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No date'}</span>
                        {task.reminder_enabled && <Bell className="h-3 w-3" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-popover border rounded-md shadow-md py-1 min-w-[120px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
              onClick={() => {
                openTaskDialog(undefined, contextMenu.date)
                setContextMenu(null)
              }}
            >
              Add Task
            </button>
            {getTasksForDate(contextMenu.date).length > 0 && (
              <button
                className="w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
                onClick={() => {
                  const tasks = getTasksForDate(contextMenu.date)
                  if (tasks.length === 1) {
                    openTaskDialog(tasks[0])
                  } else {
                    setSelectedDate(contextMenu.date)
                  }
                  setContextMenu(null)
                }}
              >
                {getTasksForDate(contextMenu.date).length === 1 ? 'Modify Task' : 'View Tasks'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}