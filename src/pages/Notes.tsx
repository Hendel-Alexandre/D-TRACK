import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, Edit, Trash2, Calendar, MessageCircle, Clock, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarPicker } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface Note {
  id: string
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
}

export default function Notes() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({
    title: '',
    content: ''
  })
  const [sendTo, setSendTo] = useState<'none' | 'calendar' | 'colleague'>('none')
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [userSearch, setUserSearch] = useState('')

  const fetchNotes = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
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

  const fetchUsers = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .neq('id', user.id)

      if (error) throw error
      setUsers(data || [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
    }
  }

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      // Create the note first
      const { error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: newNote.title,
          content: newNote.content || null
        })

      if (noteError) throw noteError

      // Handle calendar or colleague actions
      if (sendTo === 'calendar' && selectedDate) {
        const dueDate = format(selectedDate, 'yyyy-MM-dd')
        const taskTitle = `Note: ${newNote.title}`
        const taskDescription = newNote.content
        
        const { error: taskError } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: taskTitle,
            description: taskDescription,
            due_date: dueDate,
            status: 'Todo',
            priority: 'Medium'
          })

        if (taskError) throw taskError
        
        toast({
          title: 'Success',
          description: 'Note created and added to calendar'
        })
      } else if (sendTo === 'colleague' && selectedUser) {
        // Start a conversation and send the note
        const { data: conversation, error: convError } = await supabase
          .rpc('start_direct_conversation', { recipient_id: selectedUser })

        if (convError) throw convError

        const messageContent = `Shared Note: "${newNote.title}"\n\n${newNote.content}`
        
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversation,
            sender_id: user.id,
            message: messageContent
          })

        if (messageError) throw messageError
        
        toast({
          title: 'Success',
          description: 'Note created and sent to colleague'
        })
      } else {
        toast({
          title: 'Success',
          description: 'Note created successfully'
        })
      }

      resetForm()
      fetchNotes()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const updateNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !editingNote) return

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title: newNote.title,
          content: newNote.content || null
        })
        .eq('id', editingNote.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Note updated successfully'
      })

      setNewNote({ title: '', content: '' })
      setEditingNote(null)
      setIsDialogOpen(false)
      fetchNotes()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Note deleted successfully'
      })

      fetchNotes()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (note: Note) => {
    setEditingNote(note)
    setNewNote({
      title: note.title,
      content: note.content || ''
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setNewNote({ title: '', content: '' })
    setSendTo('none')
    setSelectedDate(undefined)
    setSelectedTime('')
    setSelectedUser('')
    setUserSearch('')
    setIsDialogOpen(false)
    setEditingNote(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    } else {
      setIsDialogOpen(true)
    }
  }

  useEffect(() => {
    fetchNotes()
    fetchUsers()
  }, [user])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground">Capture your thoughts and ideas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90" onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Create New Note'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={editingNote ? updateNote : createNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your note content here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </div>

              {!editingNote && (
                <div className="space-y-4 p-4 bg-card/50 rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Send note to:</Label>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={sendTo === 'none' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSendTo('none')}
                      className="justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Just Save
                    </Button>
                    <Button
                      type="button"
                      variant={sendTo === 'calendar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSendTo('calendar')}
                      className="justify-start"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendar
                    </Button>
                    <Button
                      type="button"
                      variant={sendTo === 'colleague' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSendTo('colleague')}
                      className="justify-start"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Colleague
                    </Button>
                  </div>

                  {sendTo === 'calendar' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Select Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarPicker
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="time">Time (optional)</Label>
                        <Input
                          id="time"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          placeholder="Select time"
                        />
                      </div>
                    </div>
                  )}

                  {sendTo === 'colleague' && (
                    <div className="space-y-2">
                      <Label>Select Colleague</Label>
                      <div className="space-y-2">
                        <Input
                          placeholder="Search colleagues..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {users
                            .filter(user => 
                              `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearch.toLowerCase()) ||
                              user.email.toLowerCase().includes(userSearch.toLowerCase())
                            )
                            .slice(0, 5)
                            .map(user => (
                              <Button
                                key={user.id}
                                type="button"
                                variant={selectedUser === user.id ? 'default' : 'ghost'}
                                size="sm"
                                className="w-full justify-start text-left"
                                onClick={() => {
                                  setSelectedUser(user.id)
                                  setUserSearch(`${user.first_name} ${user.last_name}`)
                                }}
                              >
                                <User className="h-4 w-4 mr-2" />
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{user.first_name} {user.last_name}</span>
                                  <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                              </Button>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNote ? 'Update Note' : 'Create Note'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 min-h-[250px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-semibold truncate">
                    {note.title}
                  </CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(note)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteNote(note.id)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {note.content && (
                  <div className="text-sm text-muted-foreground line-clamp-6 whitespace-pre-wrap">
                    {note.content}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 mt-auto">
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(note.created_at).toLocaleDateString()}
                  </div>
                  {note.updated_at !== note.created_at && (
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(note.updated_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No notes match your search.' : 'Create your first note to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          )}
        </div>
      )}
    </div>
  )
}