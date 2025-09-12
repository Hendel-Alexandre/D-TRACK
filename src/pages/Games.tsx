import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Crown, Gamepad2, Users, Bot, Trophy } from 'lucide-react'
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
    component: TicTacToe
  },
  {
    id: 'rock-paper-scissors',
    name: 'Rock Paper Scissors',
    description: 'The timeless hand game',
    icon: '✂️',
    component: RockPaperScissors
  },
  {
    id: 'hangman',
    name: 'Hangman',
    description: 'Guess the word letter by letter',
    icon: '🔤',
    component: Hangman
  }
]

export default function Games() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leaderboard, setLeaderboard] = useState<Record<string, LeaderboardEntry[]>>({})
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<'solo' | 'multiplayer' | null>(null)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [roomCode, setRoomCode] = useState('')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null)

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard()
  }, [])

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">Games Center</h1>
        <p className="text-muted-foreground">Play solo or challenge your team!</p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Join Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join Game Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <Button 
                onClick={() => joinRoom(roomCode)} 
                disabled={roomCode.length !== 6}
                className="w-full"
              >
                Join Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{game.icon}</span>
                <div>
                  <CardTitle className="text-xl">{game.name}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Leaderboard Preview */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Top Scores
                </h4>
                {leaderboard[game.id]?.length > 0 ? (
                  <div className="space-y-1">
                    {leaderboard[game.id].slice(0, 3).map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          {entry.isGoat && <Crown className="h-3 w-3 text-yellow-500" />}
                          {entry.user.first_name} {entry.user.last_name}
                          {entry.isGoat && (
                            <Badge variant="secondary" className="text-xs">
                              CURRENT GOAT
                            </Badge>
                          )}
                        </span>
                        <span className="font-medium">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No scores yet</p>
                )}
              </div>

              {/* Game Actions */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 gap-2">
                        <Bot className="h-4 w-4" />
                        Solo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solo Game - {game.name}</DialogTitle>
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
                    className="flex-1 gap-2"
                    onClick={() => createRoom(game.id)}
                    disabled={isCreatingRoom}
                  >
                    <Users className="h-4 w-4" />
                    Multiplayer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Current GOATs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GAMES.map((game) => {
              const gameLeaders = leaderboard[game.id]?.slice(0, 5) || []
              return (
                <div key={game.id} className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <span>{game.icon}</span>
                    {game.name}
                  </h4>
                  {gameLeaders.length > 0 ? (
                    <div className="space-y-1">
                      {gameLeaders.map((entry, index) => (
                        <div key={entry.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="flex items-center gap-2">
                            {index === 0 && entry.score > 0 && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="text-sm">
                              {entry.user.first_name} {entry.user.last_name}
                            </span>
                            {index === 0 && entry.score > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                GOAT
                              </Badge>
                            )}
                          </span>
                          <span className="font-medium">{entry.score}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No scores yet</p>
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