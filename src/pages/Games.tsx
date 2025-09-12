import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Crown, Gamepad2, Users, Bot, Trophy, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { TicTacToe } from '@/components/Games/TicTacToe'
import { RockPaperScissors } from '@/components/Games/RockPaperScissors'
import { Hangman } from '@/components/Games/Hangman'

interface GameScore {
  id: string
  user_id: string
  game_name: string
  score: number
  created_at: string
  updated_at: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface GameRoom {
  id: string
  game_name: string
  host_id: string
  status: string
  room_code: string
  created_at: string
}

interface LeaderboardEntry extends GameScore {
  user: User
  isGoat: boolean
}

const GAMES = [
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic 3x3 grid strategy game',
    icon: '🎯',
    gradient: 'from-blue-500 to-purple-600',
    color: 'text-blue-600',
    component: TicTacToe
  },
  {
    id: 'rock-paper-scissors',
    name: 'Rock Paper Scissors',
    description: 'The timeless hand game',
    icon: '✂️',
    gradient: 'from-green-500 to-teal-600',
    color: 'text-green-600',
    component: RockPaperScissors
  },
  {
    id: 'hangman',
    name: 'Hangman',
    description: 'Guess the word letter by letter',
    icon: '🔤',
    gradient: 'from-orange-500 to-red-600',
    color: 'text-orange-600',
    component: Hangman
  }
]

export default function Games() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showWarning, setShowWarning] = useState(true)
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({})
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<'solo' | 'multiplayer' | null>(null)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [roomCode, setRoomCode] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null)

  // Check if warning has been shown this session
  useEffect(() => {
    const warningShown = sessionStorage.getItem('gamesWarningShown')
    if (warningShown === 'true') {
      setShowWarning(false)
    }
  }, [])

  // Fetch leaderboard data
  useEffect(() => {
    if (!showWarning) {
      fetchLeaderboard()
    }
  }, [showWarning])

  const fetchLeaderboard = async () => {
    try {
      const { data: scores } = await supabase
        .from('game_scores')
        .select(`
          *,
          users!game_scores_user_id_fkey (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('score', { ascending: false })

      if (scores) {
        const leaderboardData: Record<string, LeaderboardEntry[]> = {}
        
        GAMES.forEach(game => {
          const gameScores = scores
            .filter((score: any) => score.game_name === game.id)
            .map((score: any, index: number) => ({
              ...score,
              user: score.users,
              isGoat: index === 0 && score.score > 0
            }))
          
          leaderboardData[game.id] = gameScores.slice(0, 5)
        })

        setLeaderboard(leaderboardData)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const updateScore = async (gameName: string, newScore: number) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_name: gameName,
          score: newScore
        }, {
          onConflict: 'user_id,game_name'
        })

      if (error) throw error

      // Refresh leaderboard
      fetchLeaderboard()
      
      toast({
        title: "Score Updated!",
        description: `Your ${GAMES.find(g => g.id === gameName)?.name} score: ${newScore}`,
      })
    } catch (error) {
      console.error('Error updating score:', error)
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive"
      })
    }
  }

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = async (gameName: string) => {
    if (!user) return

    setIsCreatingRoom(true)
    try {
      const code = generateRoomCode()
      
      const { data: room, error } = await supabase
        .from('game_rooms')
        .insert({
          game_name: gameName,
          host_id: user.id,
          room_code: code,
          status: 'waiting'
        })
        .select()
        .single()

      if (error) throw error

      // Join the room as host
      await supabase
        .from('game_room_members')
        .insert({
          room_id: room.id,
          user_id: user.id
        })

      setCurrentRoom(room)
      setSelectedGame(gameName)
      setGameMode('multiplayer')
      
      toast({
        title: "Room Created!",
        description: `Room code: ${code}`,
      })
    } catch (error) {
      console.error('Error creating room:', error)
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive"
      })
    } finally {
      setIsCreatingRoom(false)
    }
  }

  const joinRoom = async (code: string) => {
    if (!user || !code) return

    try {
      const { data: room, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', code.toUpperCase())
        .eq('status', 'waiting')
        .single()

      if (error) throw error

      // Join the room
      await supabase
        .from('game_room_members')
        .insert({
          room_id: room.id,
          user_id: user.id
        })

      setCurrentRoom(room)
      setSelectedGame(room.game_name)
      setGameMode('multiplayer')
      
      toast({
        title: "Joined Room!",
        description: `Playing ${GAMES.find(g => g.id === room.game_name)?.name}`,
      })
    } catch (error) {
      console.error('Error joining room:', error)
      toast({
        title: "Error",
        description: "Room not found or already full",
        variant: "destructive"
      })
    }
  }

  const startSoloGame = (gameName: string) => {
    setSelectedGame(gameName)
    setGameMode('solo')
  }

  const acknowledgeWarning = () => {
    setShowWarning(false)
    sessionStorage.setItem('gamesWarningShown', 'true')
  }

  // Show warning modal if not acknowledged
  if (showWarning) {
    return (
      <div className="container mx-auto p-6">
        <Dialog open={showWarning} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                Company Hours Notice
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please do not spend excessive time on games during work hours. Respect company policies regarding work time.
              </p>
              <div className="flex justify-center">
                <Button onClick={acknowledgeWarning} className="px-8">
                  OK
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  const exitGame = () => {
    setSelectedGame(null)
    setGameMode(null)
    setCurrentRoom(null)
    setRoomCode('')
  }

  if (selectedGame && gameMode) {
    const GameComponent = GAMES.find(g => g.id === selectedGame)?.component
    if (GameComponent) {
      return (
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">
              {GAMES.find(g => g.id === selectedGame)?.name}
            </h1>
            <Button variant="outline" onClick={exitGame}>
              Exit Game
            </Button>
          </div>
          
          <GameComponent
            mode={gameMode}
            difficulty={difficulty}
            room={currentRoom}
            onScoreUpdate={(score) => updateScore(selectedGame, score)}
            onExit={exitGame}
          />
        </div>
      )
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header with animated background */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-3xl animate-pulse"></div>
        <div className="relative z-10 py-8">
          <h1 className="text-5xl font-bold text-foreground mb-4 flex items-center justify-center gap-4">
            <span className="animate-bounce">🎮</span>
            Games Center
            <span className="animate-bounce delay-75">🏆</span>
          </h1>
          <p className="text-xl text-muted-foreground">Play solo or challenge your team!</p>
        </div>
      </div>

      {/* Quick Actions with fun styling */}
      <div className="flex justify-center gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border-2 border-blue-300 dark:border-blue-700">
                  <Users className="h-4 w-4" />
                  🚪 Join Room
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Join Game Room
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter room code (e.g. ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="text-center text-lg font-mono"
                  />
                  <Button 
                    onClick={() => joinRoom(roomCode)} 
                    disabled={roomCode.length !== 6}
                    className="w-full gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Join Room
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Games Grid with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {GAMES.map((game) => (
          <Card key={game.id} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-2 hover:border-primary/50">
            {/* Animated background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${game.gradient} rounded-full blur opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                  <div className="relative text-4xl bg-white dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <CardTitle className={`text-2xl group-hover:${game.color} transition-colors duration-300`}>
                    {game.name}
                  </CardTitle>
                  <CardDescription className="text-base mt-1">{game.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              {/* Leaderboard Preview with enhanced styling */}
              <div className="space-y-3">
                <h4 className="font-bold flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-yellow-500 animate-pulse" />
                  🏆 Top Champions
                </h4>
                {leaderboard[game.id]?.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard[game.id].slice(0, 3).map((entry, index) => (
                      <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-300 dark:border-yellow-700' :
                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/50 dark:to-gray-700/50' :
                        'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/20'
                      }`}>
                        <span className="flex items-center gap-2 font-medium">
                          {entry.isGoat && <Crown className="h-4 w-4 text-yellow-500 animate-bounce" />}
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          {entry.user.first_name} {entry.user.last_name}
                          {entry.isGoat && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 animate-pulse">
                              ⚡ GOAT
                            </Badge>
                          )}
                        </span>
                        <span className="font-bold text-lg">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">🎯 Be the first to score!</p>
                  </div>
                )}
              </div>

              {/* Game Actions with enhanced styling */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full gap-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 border-green-300 dark:border-green-700 group">
                        <Bot className="h-4 w-4 group-hover:animate-spin" />
                        🤖 Solo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          Solo Game - {game.name}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Difficulty</label>
                          <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={() => startSoloGame(game.id)}
                          className="w-full"
                        >
                          Start Game
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    size="sm" 
                    className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    onClick={() => createRoom(game.id)}
                    disabled={isCreatingRoom}
                  >
                    <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    {isCreatingRoom ? '🎮 Creating...' : '👥 Multiplayer'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Full Leaderboard */}
      <Card className="bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-yellow-950/10 dark:via-gray-900 dark:to-orange-950/10 border-2 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl">
            <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              👑 Hall of Champions 👑
            </span>
            <Crown className="h-8 w-8 text-yellow-500 animate-bounce delay-75" />
          </CardTitle>
          <p className="text-muted-foreground text-lg">The greatest players of all time!</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {GAMES.map((game) => {
              const gameLeaders = leaderboard[game.id]?.slice(0, 5) || []
              return (
                <div key={game.id} className={`space-y-4 p-6 rounded-xl bg-gradient-to-br ${game.gradient} bg-opacity-10 border border-opacity-20`}>
                  <h4 className="font-bold text-xl flex items-center gap-3 justify-center">
                    <span className="text-3xl">{game.icon}</span>
                    <span className={game.color}>{game.name}</span>
                  </h4>
                  {gameLeaders.length > 0 ? (
                    <div className="space-y-3">
                      {gameLeaders.map((entry, index) => (
                        <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg transition-all shadow-md ${
                          index === 0 && entry.score > 0 ? 
                            'bg-gradient-to-r from-yellow-200 to-yellow-100 dark:from-yellow-800/30 dark:to-yellow-700/30 border-2 border-yellow-400 shadow-yellow-200 dark:shadow-yellow-800/20' :
                          index === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50' :
                          index === 2 ? 'bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-800/30 dark:to-orange-700/30' :
                          'bg-white/50 dark:bg-gray-800/50'
                        }`}>
                          <span className="flex items-center gap-3 font-medium">
                            {index === 0 && entry.score > 0 && (
                              <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />
                            )}
                            <span className="text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎯'}
                            </span>
                            <span className="text-base">
                              {entry.user.first_name} {entry.user.last_name}
                            </span>
                            {index === 0 && entry.score > 0 && (
                              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 animate-pulse font-bold">
                                👑 GOAT
                              </Badge>
                            )}
                          </span>
                          <span className="font-bold text-xl">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
                      <p className="text-muted-foreground text-lg">🎯 Be the first champion!</p>
                      <p className="text-sm text-muted-foreground mt-1">Start playing to claim your throne!</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}