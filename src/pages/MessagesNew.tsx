import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
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
  const inputRef = useRef<HTMLInputElement>(null)

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
      const memberInserts = membersToAdd.map(userId => ({
        conversation_id: conversationData.id,
        user_id: userId
      }))

      const { error: memberError } = await supabase
        .from('conversation_members')
        .insert(memberInserts)

      if (memberError) throw memberError

      toast({
        title: 'Success',
        description: `${newChatType === 'group' ? 'Group chat' : 'Conversation'} created successfully`
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

  const handleStartConversationWithUser = async (targetUserId: string) => {
    try {
      const { data: conversationId, error } = await supabase.rpc('start_direct_conversation', {
        recipient_id: targetUserId
      })

      if (error) throw error

      const existingConversation = conversations.find(c => c.id === conversationId)
      if (existingConversation) {
        setSelectedConversation(existingConversation)
        fetchMessages(conversationId)
        if (isMobile) setShowChat(true)
      } else {
        await fetchConversations()
        setTimeout(() => {
          const newConversation = conversations.find(c => c.id === conversationId)
          if (newConversation) {
            setSelectedConversation(newConversation)
            fetchMessages(conversationId)
            if (isMobile) setShowChat(true)
          }
        }, 500)
      }
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
    if (isMobile) setShowChat(true)
  }

  const resetNewChatForm = () => {
    setShowNewChatForm(false)
    setSelectedUsers([])
    setGroupName('')
    setNewChatType('direct')
  }

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.is_group) {
      return conversation.name || 'Group Chat'
    }
    
    const otherMember = conversation.members?.find(member => member.id !== user?.id)
    return otherMember ? `${otherMember.first_name} ${otherMember.last_name}` : 'Unknown User'
  }

  const getConversationSubtitle = (conversation: Conversation) => {
    if (conversation.is_group) {
      return `${conversation.members?.length || 0} members`
    }
    
    const otherMember = conversation.members?.find(member => member.id !== user?.id)
    return otherMember?.department || 'Team Member'
  }

  const handleFileShare = async (files: SharedFile[]) => {
    if (!selectedConversation || !user) return

    for (const file of files) {
      const fileMessage = `📎 Shared file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
      
      try {
        await supabase
          .from('messages')
          .insert({
            conversation_id: selectedConversation.id,
            sender_id: user.id,
            message: fileMessage,
            file_name: file.name,
            file_url: file.url,
            file_size: file.size
          })

        toast({
          title: 'File shared',
          description: `${file.name} has been shared successfully`
        })
      } catch (error: any) {
        toast({
          title: 'Error',
          description: `Failed to share ${file.name}`,
          variant: 'destructive'
        })
      }
    }

    setShowFileUpload(false)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm')
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEE HH:mm')
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  const isConsecutiveMessage = (currentMsg: Message, prevMsg: Message) => {
    if (!prevMsg) return false
    
    const timeDiff = new Date(currentMsg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
    return currentMsg.sender_id === prevMsg.sender_id && timeDiff < 60000 // Within 1 minute
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex bg-background rounded-lg overflow-hidden border">
      {/* Sidebar - Conversations List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r bg-card flex flex-col",
        isMobile && showChat && "hidden"
      )}>
        {/* Header */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <Button
              size="sm"
              onClick={() => setShowNewChatForm(true)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 bg-background"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations
              .filter(conv => {
                const title = getConversationTitle(conv).toLowerCase()
                const lastMessage = conv.last_message?.message.toLowerCase() || ''
                return title.includes(searchTerm.toLowerCase()) || lastMessage.includes(searchTerm.toLowerCase())
              })
              .map((conversation) => (
                <motion.div
                  key={conversation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1",
                    selectedConversation?.id === conversation.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold">
                        {conversation.is_group ? 
                          <Users className="h-6 w-6" /> : 
                          getConversationTitle(conversation).split(' ').map(n => n[0]).join('').slice(0, 2)
                        }
                      </AvatarFallback>
                    </Avatar>
                    {!conversation.is_group && (
                      <StatusIndicator 
                        status={conversation.members?.find(m => m.id !== user?.id)?.status || 'Available'}
                        className="absolute -bottom-0.5 -right-0.5 h-4 w-4 border-2 border-background"
                      />
                    )}
                    {conversation.unread_count > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate text-sm">
                        {getConversationTitle(conversation)}
                      </h3>
                      {conversation.last_message && (
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                          {formatMessageTime(conversation.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {conversation.last_message ? (
                          <span>
                            {conversation.last_message.sender_id === user?.id ? 'You: ' : ''}
                            {conversation.last_message.message}
                          </span>
                        ) : (
                          <span className="italic">No messages yet</span>
                        )}
                      </p>
                      {conversation.last_message?.sender_id === user?.id && (
                        <div className="ml-2 flex-shrink-0">
                          {conversation.last_message.read_at ? (
                            <CheckCheck className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Check className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No conversations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start a conversation with a colleague
                </p>
                <Button onClick={() => setShowNewChatForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        isMobile && !showChat && "hidden"
      )}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChat(false)}
                    className="mr-2 h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold">
                    {selectedConversation.is_group ? 
                      <Users className="h-5 w-5" /> : 
                      getConversationTitle(selectedConversation).split(' ').map(n => n[0]).join('').slice(0, 2)
                    }
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold text-sm">
                    {getConversationTitle(selectedConversation)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {getConversationSubtitle(selectedConversation)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                  className="h-8 w-8 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isCurrentUser = message.sender_id === user?.id
                  const prevMessage = messages[index - 1]
                  const isConsecutive = isConsecutiveMessage(message, prevMessage)
                  const showAvatar = !isCurrentUser && !isConsecutive
                  
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        isCurrentUser ? "justify-end" : "justify-start",
                        isConsecutive && "mt-1"
                      )}
                    >
                      {/* Avatar for other users */}
                      {!isCurrentUser && (
                        <div className="flex-shrink-0 w-8">
                          {showAvatar ? (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary text-xs">
                                {message.sender ? 
                                  `${message.sender.first_name[0]}${message.sender.last_name[0]}` : 
                                  'U'
                                }
                              </AvatarFallback>
                            </Avatar>
                          ) : null}
                        </div>
                      )}
                      
                      <div className={cn(
                        "max-w-[70%] flex flex-col",
                        isCurrentUser ? "items-end" : "items-start"
                      )}>
                        {/* Sender name for non-consecutive messages */}
                        {!isCurrentUser && showAvatar && (
                          <span className="text-xs text-muted-foreground mb-1 ml-3">
                            {message.sender ? `${message.sender.first_name} ${message.sender.last_name}` : 'Unknown'}
                          </span>
                        )}
                        
                        {/* Message bubble */}
                        <div className={cn(
                          "rounded-2xl px-4 py-2 break-words transition-all duration-200 hover:shadow-sm",
                          isCurrentUser 
                            ? "bg-primary text-primary-foreground rounded-br-md" 
                            : "bg-muted rounded-bl-md",
                          isConsecutive && isCurrentUser && "rounded-tr-2xl rounded-br-md",
                          isConsecutive && !isCurrentUser && "rounded-tl-2xl rounded-bl-md"
                        )}>
                          {/* File attachment */}
                          {message.file_name && (
                            <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-black/10">
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm font-medium">{message.file_name}</span>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 ml-auto">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          
                          <p className="text-sm leading-relaxed">
                            {message.message}
                          </p>
                        </div>
                        
                        {/* Timestamp and read status */}
                        <div className={cn(
                          "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        )}>
                          <span>{formatMessageTime(message.created_at)}</span>
                          {isCurrentUser && (
                            <div className="flex items-center">
                              {message.read_at ? (
                                <CheckCheck className="h-3 w-3 text-blue-500" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-12 py-3 rounded-full bg-background border-0 ring-1 ring-border focus:ring-2 focus:ring-primary"
                    style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFileUpload(true)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="h-12 w-12 rounded-full p-0 shadow-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Dialog */}
      <AnimatePresence>
        {showNewChatForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && resetNewChatForm()}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card rounded-lg p-6 w-full max-w-md border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">New Conversation</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetNewChatForm}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={newChatType} onValueChange={(value: 'direct' | 'group') => setNewChatType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Message</SelectItem>
                      <SelectItem value="group">Group Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newChatType === 'group' && (
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                    />
                  </div>
                )}

                <div>
                  <Label>Select {newChatType === 'direct' ? 'User' : 'Users'}</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                          selectedUsers.includes(u.id) ? "bg-primary/10" : "hover:bg-muted"
                        )}
                        onClick={() => {
                          if (newChatType === 'direct') {
                            setSelectedUsers([u.id])
                          } else {
                            setSelectedUsers(prev => 
                              prev.includes(u.id) 
                                ? prev.filter(id => id !== u.id)
                                : [...prev, u.id]
                            )
                          }
                        }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {u.first_name[0]}{u.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-muted-foreground">{u.department}</p>
                        </div>
                        {selectedUsers.includes(u.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetNewChatForm}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createConversation}
                    disabled={selectedUsers.length === 0}
                  >
                    Create
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Upload Dialog */}
      <FileUploadDialog
        open={showFileUpload}
        onOpenChange={setShowFileUpload}
        onFileUpload={(file, url) => {
          handleFileShare([{ name: file.name, url, size: file.size }])
        }}
      />
    </div>
  )
}