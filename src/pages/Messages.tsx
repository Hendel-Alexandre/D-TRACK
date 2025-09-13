import { useState, useEffect, useRef } from 'react'
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
import { Search, Send, Users, MessageCircle, User, ArrowLeft, Check, CheckCheck, X } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { useSearchParams } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { StatusIndicator } from '@/components/ui/status-indicator'

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
    <div className="mobile-dense">
      <div className={`h-[calc(100vh-140px)] ${isMobile ? 'flex flex-col' : 'flex gap-4'}`}>
        {/* Conversations Sidebar */}
        {(!isMobile || !showChat) && (
          <Card className={`${isMobile ? 'flex-1' : 'w-80'} flex flex-col glass-effect`}>
            <CardHeader className="pb-3 compact-spacing">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                </CardTitle>
              </div>
              
              {/* Inline Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  onClick={() => {
                    setNewChatType('direct')
                    setShowNewChatForm(true)
                  }}
                  className="button-premium flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  Direct Message
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setNewChatType('group')
                    setShowNewChatForm(true)
                  }}
                  className="flex-1 hover-lift"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Group Chat
                </Button>
              </div>

              {/* New Chat Form */}
              {showNewChatForm && (
                <div className="space-y-3 p-3 border border-border rounded-lg bg-muted/30 animate-slide-up">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">
                      {newChatType === 'direct' ? 'Start Direct Message' : 'Create Group Chat'}
                    </Label>
                    <Button size="sm" variant="ghost" onClick={resetNewChatForm}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {newChatType === 'group' && (
                    <Input
                      placeholder="Group name"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="input-sleek"
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
                    <SelectTrigger className="input-sleek">
                      <span className="text-muted-foreground">
                        {newChatType === 'direct' ? 'Select a person' : 'Add members'}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => !selectedUsers.includes(u.id)).map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.first_name} {user.last_name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <StatusIndicator status={user.status || 'Available'} />
                                {user.department}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(userId => {
                        const selectedUser = users.find(u => u.id === userId)
                        return selectedUser ? (
                          <Badge key={userId} variant="secondary" className="cursor-pointer hover-lift" onClick={() => {
                            setSelectedUsers(prev => prev.filter(id => id !== userId))
                          }}>
                            {selectedUser.first_name} {selectedUser.last_name}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}

                  <Button 
                    onClick={createConversation} 
                    disabled={selectedUsers.length === 0}
                    className="w-full button-premium"
                  >
                    {newChatType === 'direct' ? 'Start Chat' : 'Create Group'}
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 p-0">
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 input-sleek"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-1 px-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/70 card-interactive ${
                        selectedConversation?.id === conversation.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getConversationAvatar(conversation)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-primary pulse-glow">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm truncate">
                              {getConversationDisplayName(conversation)}
                            </p>
                            {conversation.last_message && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(conversation.last_message.created_at), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          {conversation.last_message && (
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.last_message.sender?.first_name}: {conversation.last_message.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Chat Area */}
        {(selectedConversation && (!isMobile || showChat)) && (
          <Card className="flex-1 flex flex-col glass-effect">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button size="sm" variant="ghost" onClick={handleBackToConversations}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getConversationAvatar(selectedConversation)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{getConversationDisplayName(selectedConversation)}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.is_group ? `${selectedConversation.members?.length || 0} members` : 'Direct message'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message, index) => {
                    const isFromUser = message.sender_id === user?.id
                    const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
                    
                    return (
                      <div key={message.id} className={`flex gap-2 ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                        {!isFromUser && showAvatar && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {message.sender?.first_name?.[0]}{message.sender?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`max-w-xs ${isFromUser ? 'ml-12' : !showAvatar ? 'ml-10' : ''}`}>
                          {!isFromUser && showAvatar && (
                            <div className="text-xs text-muted-foreground mb-1">
                              {message.sender?.first_name} {message.sender?.last_name}
                            </div>
                          )}
                          
                          <div className={`p-3 rounded-lg ${
                            isFromUser 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <span className="text-xs opacity-70">
                                {format(new Date(message.created_at), 'HH:mm')}
                              </span>
                              {isFromUser && (
                                message.read_at ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form onSubmit={sendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 input-sleek"
                  />
                  <Button type="submit" size="sm" className="button-premium">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!selectedConversation && !isMobile && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}