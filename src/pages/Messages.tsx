import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, Send, Users, MessageCircle, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  department?: string
  status?: string
  role?: string
}

interface Conversation {
  id: string
  name: string | null
  is_group: boolean
  created_by: string
  created_at: string
  updated_at: string
  last_message?: Message
  unread_count?: number
  members?: User[]
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  created_at: string
  sender?: User
}

export default function Messages() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [newChatUsers, setNewChatUsers] = useState<string[]>([])
  const [newChatName, setNewChatName] = useState('')
  const [isGroup, setIsGroup] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user) {
      fetchConversations()
      fetchUsers()
      setupRealtimeSubscriptions()
    }
  }, [user])

  // Handle URL parameter for starting a conversation with a specific user
  useEffect(() => {
    const targetUserId = searchParams.get('user')
    if (targetUserId && user && conversations.length > 0) {
      handleStartConversationWithUser(targetUserId)
    }
  }, [searchParams, user, conversations])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, 
          first_name, 
          last_name, 
          email,
          department,
          status
        `)
        .neq('id', user?.id)

      if (error) throw error

      // Fetch user roles
      const userIds = data?.map(u => u.id) || []
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)

      // Combine users with their roles
      const usersWithRoles = data?.map(u => ({
        ...u,
        role: rolesData?.find(r => r.user_id === u.id)?.role || 'team_member'
      })) || []

      setUsers(usersWithRoles)
    } catch (error: any) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchConversations = async () => {
    if (!user) return

    try {
      const { data: conversationData, error } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          conversations!inner (
            id,
            name,
            is_group,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      // Get conversation IDs
      const conversationIds = conversationData?.map(item => item.conversation_id) || []

      if (conversationIds.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      // Fetch last message for each conversation
      const { data: lastMessages, error: msgError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          message,
          created_at,
          sender_id,
          users!messages_sender_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })

      if (msgError) throw msgError

      // Get members for each conversation
      const { data: membersData, error: membersError } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          user_id
        `)
        .in('conversation_id', conversationIds)

      if (membersError) throw membersError

      // Get user details for members
      const userIds = membersData?.map(m => m.user_id) || []
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, department, status')
        .in('id', userIds)

      if (usersError) throw usersError

      // Get user roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)

      // Combine users with roles
      const usersWithRoles = usersData?.map(u => ({
        ...u,
        role: rolesData?.find(r => r.user_id === u.id)?.role || 'team_member'
      })) || []

      // Process conversations
      const processedConversations = conversationData?.map(item => {
        const conversation = item.conversations
        const lastMsg = lastMessages?.find(msg => msg.conversation_id === conversation.id)
        
        // Get members for this conversation
        const memberIds = membersData?.filter(m => m.conversation_id === conversation.id).map(m => m.user_id) || []
        const members = usersWithRoles?.filter(u => memberIds.includes(u.id)) || []

        return {
          ...conversation,
          last_message: lastMsg ? {
            id: lastMsg.id,
            conversation_id: lastMsg.conversation_id,
            sender_id: lastMsg.sender_id,
            message: lastMsg.message,
            created_at: lastMsg.created_at,
            sender: usersWithRoles?.find(u => u.id === lastMsg.sender_id)
          } : undefined,
          members
        }
      }) || []

      // Sort by last message time
      processedConversations.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.created_at
        const bTime = b.last_message?.created_at || b.created_at
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })

      setConversations(processedConversations)
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

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, message, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Get sender details with roles
      const senderIds = [...new Set(data?.map(m => m.sender_id) || [])]
      const { data: sendersData, error: sendersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, department, status')
        .in('id', senderIds)

      if (sendersError) throw sendersError

      // Get sender roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', senderIds)

      // Combine senders with roles
      const sendersWithRoles = sendersData?.map(s => ({
        ...s,
        role: rolesData?.find(r => r.user_id === s.id)?.role || 'team_member'
      })) || []

      const processedMessages = data?.map(msg => ({
        ...msg,
        sender: sendersWithRoles?.find(s => s.id === msg.sender_id)
      })) || []

      setMessages(processedMessages)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Listen for new messages
    const messagesChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMessage = payload.new as Message

          // Fetch sender info
          const { data: senderData } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, department, status')
            .eq('id', newMessage.sender_id)
            .single()

          const messageWithSender = {
            ...newMessage,
            sender: senderData
          }

          // If this message is for the currently selected conversation, add it
          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, messageWithSender])
          }

          // Update conversations list
          fetchConversations()
        }
      )
      .subscribe()

    // Listen for new conversations
    const conversationsChannel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(conversationsChannel)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !user) return

    // Sanitize input to prevent XSS and limit message length
    const sanitizedMessage = newMessage.trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .slice(0, 1000) // Limit to 1000 characters

    if (!sanitizedMessage) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          message: sanitizedMessage
        })

      if (error) throw error

      setNewMessage('')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const createConversation = async () => {
    if (!user || newChatUsers.length === 0) return

    try {
      // Create conversation
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: isGroup ? newChatName || 'Group Chat' : null,
          is_group: isGroup,
          created_by: user.id
        })
        .select()
        .single()

      if (convError) throw convError

      // Add members (including current user)
      const membersToAdd = [user.id, ...newChatUsers]
      const { error: membersError } = await supabase
        .from('conversation_members')
        .insert(
          membersToAdd.map(userId => ({
            conversation_id: conversationData.id,
            user_id: userId
          }))
        )

      if (membersError) throw membersError

      toast({
        title: 'Success',
        description: 'Conversation created successfully'
      })

      setIsNewChatOpen(false)
      setNewChatUsers([])
      setNewChatName('')
      setIsGroup(false)
      fetchConversations()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  const handleStartConversationWithUser = async (targetUserId: string) => {
    if (!user) return

    try {
      // Check if a direct conversation already exists between current user and target user
      const existingConversation = conversations.find(conv => {
        if (conv.is_group) return false
        const memberIds = conv.members?.map(m => m.id) || []
        return memberIds.includes(user.id) && memberIds.includes(targetUserId) && memberIds.length === 2
      })

      if (existingConversation) {
        // Open existing conversation
        selectConversation(existingConversation)
        return
      }

      // Create new direct conversation
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: null, // Direct conversations don't need names
          is_group: false,
          created_by: user.id
        })
        .select()
        .single()

      if (convError) throw convError

      // Add both users as members
      const { error: membersError } = await supabase
        .from('conversation_members')
        .insert([
          {
            conversation_id: conversationData.id,
            user_id: user.id
          },
          {
            conversation_id: conversationData.id,
            user_id: targetUserId
          }
        ])

      if (membersError) throw membersError

      // Refresh conversations and select the new one
      await fetchConversations()
      
      // Find and select the newly created conversation
      setTimeout(() => {
        const newConversation = conversations.find(conv => conv.id === conversationData.id)
        if (newConversation) {
          selectConversation(newConversation)
        }
      }, 500) // Small delay to allow conversations to update

      toast({
        title: 'Success',
        description: 'Conversation started successfully'
      })

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin'
      case 'project_manager': return 'Project Manager'
      case 'developer': return 'Developer'
      case 'designer': return 'Designer'
      case 'team_member': return 'Team Member'
      default: return 'Team Member'
    }
  }

  const getConversationDisplayName = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.name || 'Group Chat'
    }
    
    const otherMember = conversation.members?.find(member => member.id !== user?.id)
    return otherMember ? `${otherMember.first_name} ${otherMember.last_name}` : 'Unknown User'
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.name?.charAt(0).toUpperCase() || 'G'
    }
    
    const otherMember = conversation.members?.find(member => member.id !== user?.id)
    return otherMember ? `${otherMember.first_name?.charAt(0)}${otherMember.last_name?.charAt(0)}` : 'U'
  }

  const filteredConversations = conversations.filter(conv =>
    getConversationDisplayName(conv).toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* Conversations Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages
            </CardTitle>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Start New Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Conversation Type</Label>
                    <Select value={isGroup ? 'group' : 'direct'} onValueChange={(value) => setIsGroup(value === 'group')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">Direct Message</SelectItem>
                        <SelectItem value="group">Group Chat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {isGroup && (
                    <div className="space-y-2">
                      <Label>Group Name</Label>
                      <Input
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        placeholder="Enter group name"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Select Users</Label>
                    <Select value="" onValueChange={(selectedUserId) => {
                      if (selectedUserId && !newChatUsers.includes(selectedUserId)) {
                        setNewChatUsers(prev => [...prev, selectedUserId])
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add users to conversation" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(u => !newChatUsers.includes(u.id)).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex flex-col">
                              <span>{user.first_name} {user.last_name}</span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{user.department || 'No department'}</span>
                                <span>•</span>
                                <span>{user.status || 'Available'}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newChatUsers.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Users</Label>
                      <div className="flex flex-wrap gap-2">
                        {newChatUsers.map(userId => {
                          const selectedUser = users.find(u => u.id === userId)
                          return selectedUser ? (
                            <Badge key={userId} variant="secondary" className="cursor-pointer" onClick={() => {
                              setNewChatUsers(prev => prev.filter(id => id !== userId))
                            }}>
                              <div className="flex flex-col text-left">
                                <span>{selectedUser.first_name} {selectedUser.last_name}</span>
                                <div className="flex items-center gap-1 text-xs opacity-70">
                                  <span>{selectedUser.department || 'No department'}</span>
                                  <span>•</span>
                                  <span>{selectedUser.status || 'Available'}</span>
                                </div>
                              </div>
                              <span className="ml-2">×</span>
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsNewChatOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createConversation} disabled={newChatUsers.length === 0}>
                      Create Conversation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2 pb-4">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conversation.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getConversationAvatar(conversation)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">
                        {getConversationDisplayName(conversation)}
                      </h4>
                      {conversation.is_group && (
                        <Users className="h-3 w-3" />
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-sm opacity-70 truncate">
                        {conversation.last_message.sender?.first_name}: {conversation.last_message.message}
                      </p>
                    )}
                    {/* Show role in conversation list for DMs */}
                    {!conversation.is_group && conversation.members?.find(m => m.id !== user?.id)?.role && (
                      <p className="text-xs opacity-50">
                        {formatRole(conversation.members.find(m => m.id !== user?.id)?.role || '')}
                      </p>
                    )}
                  </div>
                  {conversation.last_message && (
                    <div className="text-xs opacity-60">
                      {format(new Date(conversation.last_message.created_at), 'HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredConversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversations found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {getConversationAvatar(selectedConversation)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {getConversationDisplayName(selectedConversation)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedConversation.is_group 
                      ? `${selectedConversation.members?.length || 0} members`
                      : 'Direct message'
                    }
                  </p>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map(message => (
                  <div key={message.id} className="flex items-start gap-3">
                    {/* Avatar for other users */}
                    {message.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {message.sender ? `${message.sender.first_name?.charAt(0)}${message.sender.last_name?.charAt(0)}` : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Message content */}
                    <div className={`flex flex-col max-w-[70%] ${
                      message.sender_id === user?.id ? 'ml-auto items-end' : 'items-start'
                    }`}>
                      {/* Sender name and role for other users */}
                      {message.sender_id !== user?.id && (
                        <div className="mb-1 px-1">
                          <p className="text-sm font-medium text-foreground">
                            {message.sender?.first_name} {message.sender?.last_name}
                          </p>
                          {message.sender?.role && (
                            <p className="text-xs text-muted-foreground">
                              ({formatRole(message.sender.role)})
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div className={`rounded-2xl px-4 py-2 shadow-sm max-w-full ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md border'
                      }`}>
                        <p className="break-words text-sm leading-relaxed">{message.message}</p>
                      </div>
                      
                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {format(new Date(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <CardContent className="border-t p-4">
              <form onSubmit={sendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}