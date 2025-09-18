import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Check, X, Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  department: string
  status: string
}

interface FriendRequest {
  id: string
  sender_id: string
  recipient_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  sender?: User
}

export function FriendRequestSystem() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)

  const fetchFriendRequests = async () => {
    if (!user) return

    try {
      // Simple query for now since types aren't generated yet
      const { data, error } = await supabase
        .from('friend_requests' as any)
        .select('*')
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Get sender details for each request
      const requestsWithSenders = await Promise.all(
        (data || []).map(async (request: any) => {
          const { data: senderData } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, department')
            .eq('id', request.sender_id)
            .single()
          
          return {
            ...request,
            sender: senderData
          }
        })
      )
      
      setFriendRequests(requestsWithSenders as FriendRequest[])
    } catch (error: any) {
      console.error('Error fetching friend requests:', error)
      setFriendRequests([])
    }
  }

  useEffect(() => {
    fetchFriendRequests()
  }, [user])

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return

    // Only search if user enters at least first and last name
    const nameParts = searchQuery.trim().split(' ')
    if (nameParts.length < 2) {
      toast({
        title: 'Search Requirement',
        description: 'Please enter the full name (first and last name) to search for users.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setSearchPerformed(true)

    try {
      const [firstName, ...lastNameParts] = nameParts
      const lastName = lastNameParts.join(' ')

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, department, status')
        .ilike('first_name', `%${firstName}%`)
        .ilike('last_name', `%${lastName}%`)
        .neq('id', user.id)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
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

  const sendFriendRequest = async (recipientId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('friend_requests' as any)
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          status: 'pending'
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Friend request sent successfully!'
      })

      // Remove user from search results
      setSearchResults(prev => prev.filter(u => u.id !== recipientId))
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('friend_requests' as any)
        .update({ status })
        .eq('id', requestId)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Friend request ${status}!`
      })

      fetchFriendRequests()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-success'
      case 'Away': return 'bg-warning'
      case 'Busy': return 'bg-destructive'
      default: return 'bg-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      {/* Friend Requests Notification */}
      {friendRequests.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              Friend Requests
              <Badge variant="default" className="bg-primary">
                {friendRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {getInitials(request.sender?.first_name || '', request.sender?.last_name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {request.sender?.first_name} {request.sender?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.sender?.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => respondToFriendRequest(request.id, 'accepted')}
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToFriendRequest(request.id, 'declined')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Users */}
      <Card>
        <CardHeader>
          <CardTitle>Find Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter full name (e.g., John Smith)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              />
            </div>
            <Button onClick={searchUsers} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchPerformed && searchResults.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No users found matching "{searchQuery}". Try using the exact full name.
              </p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((searchUser) => (
                <motion.div
                  key={searchUser.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {getInitials(searchUser.first_name, searchUser.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(searchUser.status)} rounded-full border-2 border-background`} />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {searchUser.first_name} {searchUser.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {searchUser.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {searchUser.department}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${searchUser.status === 'Available' ? 'border-success text-success' : 
                            searchUser.status === 'Away' ? 'border-warning text-warning' : 
                            'border-destructive text-destructive'}`}
                        >
                          {searchUser.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => sendFriendRequest(searchUser.id)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add to Team
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}