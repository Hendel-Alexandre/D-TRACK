import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Phone, MapPin, UserPlus, Search, Calendar, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { FriendRequestSystem } from '@/components/Teams/FriendRequestSystem'

interface TeamMember {
  id: string
  first_name: string
  last_name: string
  department: string
  status: string
  created_at: string
  connection_type?: 'friend' | 'conversation' | 'game'
}

export default function Team() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchTeamMembers = async () => {
    if (!user) return
    
    try {
      // Fetch users with accepted friend connections
      const { data: friendData, error: friendError } = await supabase
        .from('friend_requests')
        .select('sender_id, recipient_id')
        .eq('status', 'accepted')

      if (friendError) throw friendError

      // Fetch users in shared conversations
      const { data: conversationData, error: convError } = await supabase
        .from('conversation_members')
        .select('conversation_id')
        .eq('user_id', user.id)

      if (convError) throw convError

      const conversationIds = conversationData?.map(c => c.conversation_id) || []
      
      let conversationUserIds: string[] = []
      if (conversationIds.length > 0) {
        const { data: convMembers } = await supabase
          .from('conversation_members')
          .select('user_id')
          .in('conversation_id', conversationIds)
          .neq('user_id', user.id)
        
        conversationUserIds = convMembers?.map(m => m.user_id) || []
      }

      // Fetch users in shared game rooms
      const { data: gameRoomData, error: gameError } = await supabase
        .from('game_room_members')
        .select('room_id')
        .eq('user_id', user.id)

      if (gameError) throw gameError

      const roomIds = gameRoomData?.map(r => r.room_id) || []
      
      let gameUserIds: string[] = []
      if (roomIds.length > 0) {
        const { data: gameMembers } = await supabase
          .from('game_room_members')
          .select('user_id')
          .in('room_id', roomIds)
          .neq('user_id', user.id)
        
        gameUserIds = gameMembers?.map(m => m.user_id) || []
      }

      // Collect all connected user IDs
      const friendUserIds = friendData?.flatMap(f => 
        f.sender_id === user.id ? [f.recipient_id] : 
        f.recipient_id === user.id ? [f.sender_id] : []
      ) || []

      const allConnectedUserIds = Array.from(new Set([
        ...friendUserIds,
        ...conversationUserIds,
        ...gameUserIds
      ]))

      // Fetch user details only for connected users
      if (allConnectedUserIds.length === 0) {
        setTeamMembers([])
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, first_name, last_name, department, status, created_at')
        .in('id', allConnectedUserIds)
        .order('created_at', { ascending: false })

      if (userError) throw userError
      setTeamMembers(userData || [])
    } catch (error: any) {
      console.error('Error fetching team members:', error)
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [user])

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500'
      case 'Away': return 'bg-yellow-500'
      case 'Busy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDepartmentStats = () => {
    const stats = teamMembers.reduce((acc: { [key: string]: number }, member) => {
      acc[member.department] = (acc[member.department] || 0) + 1
      return acc
    }, {})
    return Object.entries(stats).sort(([,a], [,b]) => b - a)
  }

  const getStatusStats = () => {
    const stats = teamMembers.reduce((acc: { [key: string]: number }, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1
      return acc
    }, {})
    return stats
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const handleMessageUser = (memberId: string) => {
    // Navigate to Messages page with the target user ID
    navigate(`/messages?user=${memberId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const departmentStats = getDepartmentStats()
  const statusStats = getStatusStats()

  return (
    <div className="mobile-dense compact-spacing">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Connected Team</h1>
          <p className="text-muted-foreground text-balance">View team members you're connected with</p>
        </div>
      </div>

      {/* Friend Request System */}
      <div className="mb-6">
        <FriendRequestSystem />
      </div>

      {/* Stats Cards - Compact Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 dense-grid mb-6">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Members
              <Users className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-gradient">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              {departmentStats.length} departments
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Available
              <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">{statusStats.Available || 0}</div>
            <p className="text-xs text-muted-foreground">online now</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Largest Dept
              <Users className="h-4 w-4 text-info" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-info">{departmentStats[0]?.[1] || 0}</div>
            <p className="text-xs text-muted-foreground truncate">
              {departmentStats[0]?.[0] || 'No departments'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Away/Busy
              <div className="h-2 w-2 bg-warning rounded-full" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-warning">
              {(statusStats.Away || 0) + (statusStats.Busy || 0)}
            </div>
            <p className="text-xs text-muted-foreground">unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 input-sleek"
          />
        </div>
        
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-40 input-sleek">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departmentStats.map(([dept]) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 input-sleek">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Away">Away</SelectItem>
            <SelectItem value="Busy">Busy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dense Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 dense-grid">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <Card className="h-full card-interactive glass-effect hover:shadow-premium">
              <CardContent className="p-4 space-y-3">
                <div className="text-center">
                  <div className="relative mx-auto w-fit">
                    <Avatar className="h-14 w-14 mx-auto">
                      <AvatarFallback className="text-lg font-bold bg-gradient-primary text-white">
                        {getInitials(member.first_name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(member.status)} rounded-full border-2 border-background shadow-sm`}></div>
                  </div>
                  
                  <h3 className="font-bold text-base mt-2 text-balance">
                    {member.first_name} {member.last_name}
                  </h3>
                  
                  <Badge variant="secondary" className="text-xs mt-1">
                    {member.department}
                  </Badge>
                </div>

                <div className="flex items-center justify-center">
                  <Badge className={`${getStatusColor(member.status)} text-white text-xs px-2 py-1`}>
                    {member.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground justify-center">
                    <Calendar className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="text-xs">
                      Joined {new Date(member.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button 
                  size="sm"
                  onClick={() => handleMessageUser(member.id)}
                  className="w-full button-sleek text-xs"
                >
                  <MessageCircle className="h-3 w-3 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No connections yet</h3>
          <p className="text-muted-foreground mb-6 text-balance">
            {searchTerm || filterDepartment !== 'all' || filterStatus !== 'all'
              ? 'No members match your current filters. Try adjusting your search.'
              : 'Send friend requests to connect with team members. Once accepted, they will appear here.'}
          </p>
        </div>
      )}

      {/* Department Analytics - More Compact */}
      {departmentStats.length > 0 && (
        <Card className="mt-8 card-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departmentStats.map(([department, count], index) => (
                <motion.div
                  key={department}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover-lift"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm" 
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} 
                    />
                    <span className="font-medium">{department}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{count}</div>
                    <div className="text-xs text-muted-foreground">
                      {((count / teamMembers.length) * 100).toFixed(1)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}