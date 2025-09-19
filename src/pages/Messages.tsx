import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Search, Send, Users, MessageCircle, User, ArrowLeft, Check, CheckCheck, X, Plus, Paperclip, Download, Eye, MoreVertical } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { FileUploadDialog } from '@/components/FileSharing/FileUploadDialog'
import { cn } from '@/lib/utils'

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
  last_read_at?: string
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  message: string
  created_at: string
  read_at?: string | null
  sender?: User
  file_name?: string
  file_url?: string
  file_size?: number
}

interface SharedFile {
  name: string
  url: string
  size: number
}

export default function Messages() {
  const { user, userProfile } = useAuth()
  const [searchParams] = useSearchParams()
  const isMobile = useIsMobile()
  const [showChat, setShowChat] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [showNewChatForm, setShowNewChatForm] = useState(false)
  const [newChatType, setNewChatType] = useState<'direct' | 'group'>('direct')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
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

  useEffect(() => {
    if (!user) return

    const statusChannel = supabase
      .channel('user-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        () => {
          fetchUsers()
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(statusChannel)
    }
  }, [user])

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

      const userIds = data?.map(u => u.id) || []
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)

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
          last_read_at,
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

      const conversationIds = conversationData?.map(item => item.conversation_id) || []

      if (conversationIds.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      const { data: lastMessages } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          message,
          created_at,
          sender_id,
          users (
            id,
            first_name,
            last_name
          )
        `)
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false })

      const { data: membersData } = await supabase
        .from('conversation_members')
        .select(`
          conversation_id,
          user_id
        `)
        .in('conversation_id', conversationIds)

      const userIds = membersData?.map(m => m.user_id) || []
      const { data: usersData } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, department, status')
        .in('id', userIds)

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds)

      const usersWithRoles = usersData?.map(u => ({
        ...u,
        role: rolesData?.find(r => r.user_id === u.id)?.role || 'team_member'
      })) || []

      const processedConversations = conversationData?.map(item => {
        const conversation = item.conversations
        const lastMsg = lastMessages?.find(msg => msg.conversation_id === conversation.id)
        
        const memberIds = membersData?.filter(m => m.conversation_id === conversation.id).map(m => m.user_id) || []
        const members = usersWithRoles?.filter(u => memberIds.includes(u.id)) || []

        const lastReadAt = item.last_read_at
        const unreadMessages = lastMessages?.filter(msg => 
          msg.conversation_id === conversation.id && 
          msg.sender_id !== user.id &&
          (!lastReadAt || new Date(msg.created_at) > new Date(lastReadAt))
        ) || []

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
          members,
          unread_count: unreadMessages.length,
          last_read_at: lastReadAt
        }
      }) || []

      processedConversations.sort((a, b) => {
        if (a.unread_count !== b.unread_count) {
          return (b.unread_count || 0) - (a.unread_count || 0)
        }
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
        .select(`
          id, 
          conversation_id, 
          sender_id, 
          message, 
          created_at,
          read_at,
          users (
            id,
            first_name,
            last_name,
            email,
            department,
            status
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const senderIds = [...new Set(data?.map(m => m.sender_id) || [])]
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', senderIds)

      const processedMessages = data?.map(msg => ({
        ...msg,
        sender: {
          ...msg.users,
          role: rolesData?.find(r => r.user_id === msg.sender_id)?.role || 'team_member'
        }
      })) || []

      setMessages(processedMessages)

      if (user) {
        const unreadMessages = processedMessages.filter(msg => 
          msg.sender_id !== user.id && !msg.read_at
        )
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(msg => msg.id)
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', messageIds)
            .eq('conversation_id', conversationId)

          setMessages(prev => prev.map(msg => 
            messageIds.includes(msg.id) 
              ? { ...msg, read_at: new Date().toISOString() }
              : msg
          ))
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const setupRealtimeSubscriptions = () => {
    const messagesChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
            await fetchMessages(selectedConversation.id)
          }
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          if (selectedConversation && payload.new.conversation_id === selectedConversation.id) {
            await fetchMessages(selectedConversation.id)
          }
        }
      )
      .subscribe()

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

    const messageText = newMessage.trim()
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      message: messageText,
      created_at: new Date().toISOString(),
      read_at: null,
      sender: {
        id: user.id,
        first_name: userProfile?.first_name || 'User',
        last_name: userProfile?.last_name || '',
        email: userProfile?.email || user.email || '',
        department: userProfile?.department || '',
        status: userProfile?.status || 'Available',
        role: 'team_member'
      }
    }

    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          message: messageText
        })
        .select('*')
        .single()

      if (error) throw error

      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...tempMessage, id: data.id, created_at: data.created_at }
            : msg
        )
      )

    } catch (error: any) {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      })
      
      setNewMessage(messageText)
    }
  }

  const createConversation = async () => {
    if (!user || selectedUsers.length === 0) return

    try {
      if (newChatType === 'direct' && selectedUsers.length === 1) {
        const { data: conversationId, error } = await supabase.rpc('start_direct_conversation', {
          recipient_id: selectedUsers[0]
        })

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Direct message started successfully'
        })

        resetNewChatForm()
        fetchConversations()
        return
      }

      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .insert({
          name: newChatType === 'group' ? groupName || 'Group Chat' : null,
          is_group: newChatType === 'group',
          created_by: user.id
        })
        .select()
        .single()

      if (convError) throw convError

      const membersToAdd = [user.id, ...selectedUsers]
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

      resetNewChatForm()
      fetchConversations()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const resetNewChatForm = () => {
    setShowNewChatForm(false)
    setSelectedUsers([])
    setGroupName('')
    setNewChatType('direct')
  }

  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
    
    if (isMobile) {
      setShowChat(true)
    }

    if (user && conversation.unread_count && conversation.unread_count > 0) {
      try {
        await supabase
          .from('conversation_members')
          .update({ last_read_at: new Date().toISOString() })
          .eq('conversation_id', conversation.id)
          .eq('user_id', user.id)

        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unread_count: 0, last_read_at: new Date().toISOString() }
            : conv
        ))
      } catch (error) {
        console.error('Error marking conversation as read:', error)
      }
    }
  }

  const handleBackToConversations = () => {
    setShowChat(false)
    setSelectedConversation(null)
  }

  const handleStartConversationWithUser = async (targetUserId: string) => {
    if (!user) return

    try {
      const existingConversation = conversations.find(conv => {
        if (conv.is_group) return false
        const memberIds = conv.members?.map(m => m.id) || []
        return memberIds.includes(user.id) && memberIds.includes(targetUserId) && memberIds.length === 2
      })

      if (existingConversation) {
        selectConversation(existingConversation)
        return
      }

      const { data: conversationId, error } = await supabase.rpc('start_direct_conversation', {
        recipient_id: targetUserId
      })

      if (error) throw error

      await fetchConversations()
      
      setTimeout(() => {
        const newConversation = conversations.find(conv => conv.id === conversationId)
        if (newConversation) {
          selectConversation(newConversation)
        }
      }, 500)

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
    <div className="h-[calc(100vh-8rem)]">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`h-full ${isMobile ? 'flex flex-col' : 'grid grid-cols-12 gap-6'}`}
      >
        {/* Conversations Sidebar */}
        <AnimatePresence>
          {(!isMobile || !showChat) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`${isMobile ? 'flex-1' : 'col-span-4'} flex flex-col`}
            >
              <Card className="h-full flex flex-col bg-gradient-card border-border/50 shadow-sm">
                <CardHeader className="flex-shrink-0 border-b border-border/50 bg-background/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MessageCircle className="h-4 w-4 text-primary" />
                      </div>
                      Messages
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowNewChatForm(!showNewChatForm)}
                      className="h-8 w-8 p-0"
                      variant={showNewChatForm ? "default" : "ghost"}
                    >
                      <Plus className={`h-4 w-4 transition-transform ${showNewChatForm ? 'rotate-45' : ''}`} />
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 bg-background/50 border-border/50"
                    />
                  </div>

                  {/* New Chat Form */}
                  <AnimatePresence>
                    {showNewChatForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 p-4 border border-border/50 rounded-lg bg-muted/20"
                      >
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={newChatType === 'direct' ? 'default' : 'outline'}
                            onClick={() => setNewChatType('direct')}
                            className="flex-1 h-8"
                          >
                            <User className="h-3 w-3 mr-1" />
                            Direct
                          </Button>
                          <Button
                            size="sm"
                            variant={newChatType === 'group' ? 'default' : 'outline'}
                            onClick={() => setNewChatType('group')}
                            className="flex-1 h-8"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            Group
                          </Button>
                        </div>

                        {newChatType === 'group' && (
                          <Input
                            placeholder="Group name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="h-8 bg-background/50"
                          />
                        )}

                        <Select
                          value=""
                          onValueChange={(selectedUserId) => {
                            if (selectedUserId && !selectedUsers.includes(selectedUserId)) {
                              setSelectedUsers(prev => newChatType === 'direct' ? [selectedUserId] : [...prev, selectedUserId])
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 bg-background/50">
                            <span className="text-muted-foreground text-sm">
                              {newChatType === 'direct' ? 'Select person' : 'Add members'}
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {users.filter(u => !selectedUsers.includes(u.id)).map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {user.first_name?.[0]}{user.last_name?.[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                                    <span className="text-xs text-muted-foreground">{user.department}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedUsers.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedUsers.map(userId => {
                              const selectedUser = users.find(u => u.id === userId)
                              return selectedUser ? (
                                <Badge
                                  key={userId}
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                  onClick={() => setSelectedUsers(prev => prev.filter(id => id !== userId))}
                                >
                                  {selectedUser.first_name} {selectedUser.last_name}
                                  <X className="h-3 w-3 ml-1" />
                                </Badge>
                              ) : null
                            })}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={createConversation}
                            disabled={selectedUsers.length === 0}
                            className="flex-1 h-8"
                          >
                            {newChatType === 'direct' ? 'Start Chat' : 'Create Group'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={resetNewChatForm}
                            className="h-8"
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={conversation.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => selectConversation(conversation)}
                          className={`group p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedConversation?.id === conversation.id
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-muted/50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                                <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                                  {getConversationAvatar(conversation)}
                                </AvatarFallback>
                              </Avatar>
                              {conversation.unread_count && conversation.unread_count > 0 && (
                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                  <span className="text-xs text-white font-medium">
                                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-sm text-foreground truncate">
                                  {getConversationDisplayName(conversation)}
                                </h4>
                                {conversation.last_message && (
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {format(new Date(conversation.last_message.created_at), 'HH:mm')}
                                  </span>
                                )}
                              </div>
                              {conversation.last_message ? (
                                <p className="text-xs text-muted-foreground truncate">
                                  <span className="font-medium">
                                    {conversation.last_message.sender?.first_name}:
                                  </span>
                                  {' '}{conversation.last_message.message}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No messages yet</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {filteredConversations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                          <p className="text-sm text-muted-foreground mb-2">No conversations yet</p>
                          <p className="text-xs text-muted-foreground">Start a new chat to get started</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <AnimatePresence>
          {selectedConversation && (!isMobile || showChat) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`${isMobile ? 'flex-1' : 'col-span-8'} flex flex-col`}
            >
              <Card className="h-full flex flex-col bg-gradient-card border-border/50 shadow-sm">
                {/* Chat Header */}
                <CardHeader className="flex-shrink-0 border-b border-border/50 bg-background/50">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleBackToConversations}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {getConversationAvatar(selectedConversation)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {getConversationDisplayName(selectedConversation)}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.is_group 
                          ? `${selectedConversation.members?.length || 0} members` 
                          : 'Direct message'}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isFromUser = message.sender_id === user?.id
                        const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
                        
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${isFromUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isFromUser && showAvatar && (
                              <Avatar className="h-8 w-8 border border-border/30">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  {message.sender?.first_name?.[0]}{message.sender?.last_name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`max-w-xs lg:max-w-md ${
                              isFromUser ? 'ml-12' : !showAvatar ? 'ml-11' : ''
                            }`}>
                              {!isFromUser && showAvatar && (
                                <div className="text-xs text-muted-foreground mb-1 ml-1">
                                  {message.sender?.first_name} {message.sender?.last_name}
                                </div>
                              )}
                              
                               <div className={`p-3 rounded-2xl shadow-sm ${
                                 isFromUser 
                                   ? 'bg-primary text-primary-foreground ml-auto rounded-br-md' 
                                   : 'bg-background border border-border/50 rounded-bl-md'
                               }`}>
                                 {message.file_name ? (
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
                                       <Download className="h-4 w-4" />
                                       <div className="flex-1 min-w-0">
                                         <p className="text-sm font-medium truncate">{message.file_name}</p>
                                         <p className="text-xs opacity-70">
                                           {message.file_size ? `${(message.file_size / (1024 * 1024)).toFixed(1)} MB` : 'File'}
                                         </p>
                                       </div>
                                       <Button
                                         size="sm"
                                         variant="ghost"
                                         className="h-6 w-6 p-0"
                                         onClick={() => window.open(message.file_url, '_blank')}
                                       >
                                         <Eye className="h-3 w-3" />
                                       </Button>
                                     </div>
                                     {message.message && (
                                       <p className="text-sm leading-relaxed break-words">{message.message}</p>
                                     )}
                                   </div>
                                 ) : (
                                   <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message}</p>
                                 )}
                                 <div className="flex items-center justify-end gap-1 mt-2">
                                   <span className={`text-xs ${
                                     isFromUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                   }`}>
                                     {format(new Date(message.created_at), 'HH:mm')}
                                   </span>
                                   {isFromUser && (
                                     <div className="text-primary-foreground/70">
                                       {message.read_at ? (
                                         <CheckCheck className="h-3 w-3" />
                                       ) : (
                                         <Check className="h-3 w-3" />
                                       )}
                                     </div>
                                   )}
                                 </div>
                               </div>
                            </div>
                          </motion.div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex-shrink-0 p-4 border-t border-border/50 bg-background/50">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFileUpload(true)}
                          className="h-10 w-10 p-0 shrink-0"
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 relative">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="bg-background border-border/50 focus:border-primary/50 pr-4 resize-none overflow-hidden"
                            style={{
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              maxHeight: '120px'
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="h-10 w-10 p-0 shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!selectedConversation && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-8 flex items-center justify-center"
          >
            <div className="text-center space-y-4 max-w-sm">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-primary/10 flex items-center justify-center">
                <MessageCircle className="h-12 w-12 text-primary/60" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose a conversation from the sidebar to start messaging, or create a new chat to get started.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}