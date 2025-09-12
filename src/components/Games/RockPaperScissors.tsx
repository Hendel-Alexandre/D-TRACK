import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

type Choice = 'rock' | 'paper' | 'scissors'
type GameResult = 'win' | 'lose' | 'draw'
type Difficulty = 'easy' | 'medium' | 'hard'

interface RockPaperScissorsProps {
  mode: 'solo' | 'multiplayer'
  difficulty: Difficulty
  room?: any
  onScoreUpdate: (score: number) => void
  onExit: () => void
}

const CHOICES: { value: Choice; emoji: string; label: string }[] = [
  { value: 'rock', emoji: '🪨', label: 'Rock' },
  { value: 'paper', emoji: '📄', label: 'Paper' },
  { value: 'scissors', emoji: '✂️', label: 'Scissors' }
]

export function RockPaperScissors({ mode, difficulty, room, onScoreUpdate, onExit }: RockPaperScissorsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false)
  const [roomMembers, setRoomMembers] = useState<any[]>([])
  const [gameHistory, setGameHistory] = useState<Array<{ round: number; playerChoice: Choice; opponentChoice: Choice; result: GameResult }>>([])

  useEffect(() => {
    if (mode === 'multiplayer' && room) {
      fetchRoomMembers()
      subscribeToMoves()
    }
  }, [mode, room])

  const fetchRoomMembers = async () => {
    if (!room) return

    try {
      const { data } = await supabase
        .from('game_room_members')
        .select(`
          *,
          users!game_room_members_user_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('room_id', room.id)

      if (data) {
        setRoomMembers(data)
      }
    } catch (error) {
      console.error('Error fetching room members:', error)
    }
  }

  const subscribeToMoves = () => {
    if (!room) return

    const channel = supabase
      .channel('rps-moves')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_moves',
          filter: `room_id=eq.${room.id}`
        },
        (payload) => {
          const moveData = payload.new.move_data as any
          if (payload.new.user_id !== user?.id && moveData.round === round) {
            // Opponent made their choice
            setOpponentChoice(moveData.choice)
            setIsWaitingForOpponent(false)
            
            if (playerChoice) {
              // Both choices made, determine result
              const result = determineWinner(playerChoice, moveData.choice)
              setGameResult(result)
              updateGameHistory(playerChoice, moveData.choice, result)
              
              if (result === 'win') {
                updateScore(score + 10)
              }
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const determineWinner = (player: Choice, opponent: Choice): GameResult => {
    if (player === opponent) return 'draw'
    
    if (
      (player === 'rock' && opponent === 'scissors') ||
      (player === 'paper' && opponent === 'rock') ||
      (player === 'scissors' && opponent === 'paper')
    ) {
      return 'win'
    }
    
    return 'lose'
  }

  const getAIChoice = (difficulty: Difficulty, playerHistory: Choice[]): Choice => {
    const choices: Choice[] = ['rock', 'paper', 'scissors']
    
    if (difficulty === 'easy') {
      // Random choice
      return choices[Math.floor(Math.random() * choices.length)]
    } else if (difficulty === 'medium') {
      // Slight pattern recognition
      if (playerHistory.length >= 2) {
        const lastChoice = playerHistory[playerHistory.length - 1]
        // Counter the player's last choice 60% of the time
        if (Math.random() < 0.6) {
          if (lastChoice === 'rock') return 'paper'
          if (lastChoice === 'paper') return 'scissors'
          if (lastChoice === 'scissors') return 'rock'
        }
      }
      return choices[Math.floor(Math.random() * choices.length)]
    } else {
      // Hard - pattern recognition and counter-strategy
      if (playerHistory.length >= 3) {
        // Look for patterns in last 3 moves
        const recent = playerHistory.slice(-3)
        const rockCount = recent.filter(c => c === 'rock').length
        const paperCount = recent.filter(c => c === 'paper').length
        const scissorsCount = recent.filter(c => c === 'scissors').length
        
        // Counter the most frequent choice
        if (rockCount > paperCount && rockCount > scissorsCount) return 'paper'
        if (paperCount > rockCount && paperCount > scissorsCount) return 'scissors'
        if (scissorsCount > rockCount && scissorsCount > paperCount) return 'rock'
      }
      return choices[Math.floor(Math.random() * choices.length)]
    }
  }

  const makeChoice = async (choice: Choice) => {
    setPlayerChoice(choice)

    if (mode === 'multiplayer' && room) {
      // Send choice to other players
      try {
        await supabase
          .from('game_moves')
          .insert({
            room_id: room.id,
            user_id: user?.id,
            move_data: { choice, round }
          })

        setIsWaitingForOpponent(true)
      } catch (error) {
        console.error('Error sending move:', error)
      }
    } else {
      // Solo mode - AI choice
      const playerHistory = gameHistory.map(g => g.playerChoice)
      const aiChoice = getAIChoice(difficulty, playerHistory)
      setOpponentChoice(aiChoice)
      
      const result = determineWinner(choice, aiChoice)
      setGameResult(result)
      updateGameHistory(choice, aiChoice, result)
      
      if (result === 'win') {
        updateScore(score + 10)
      }
    }
  }

  const updateScore = (newScore: number) => {
    setScore(newScore)
    onScoreUpdate(newScore)
  }

  const updateGameHistory = (playerChoice: Choice, opponentChoice: Choice, result: GameResult) => {
    setGameHistory(prev => [...prev, { round, playerChoice, opponentChoice, result }])
  }

  const nextRound = () => {
    setPlayerChoice(null)
    setOpponentChoice(null)
    setGameResult(null)
    setRound(round + 1)
    setIsWaitingForOpponent(false)
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setOpponentChoice(null)
    setGameResult(null)
    setRound(1)
    setIsWaitingForOpponent(false)
    setGameHistory([])
  }

  const getResultMessage = () => {
    if (!gameResult) return ''
    
    switch (gameResult) {
      case 'win':
        return '🎉 You won this round!'
      case 'lose':
        return '😔 You lost this round!'
      case 'draw':
        return '🤝 It\'s a draw!'
      default:
        return ''
    }
  }

  const getGameStats = () => {
    const wins = gameHistory.filter(g => g.result === 'win').length
    const losses = gameHistory.filter(g => g.result === 'lose').length
    const draws = gameHistory.filter(g => g.result === 'draw').length
    return { wins, losses, draws }
  }

  const stats = getGameStats()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Rock Paper Scissors</CardTitle>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">
                {mode === 'solo' ? `${difficulty} AI` : 'Multiplayer'}
              </Badge>
              <Badge variant="secondary">Score: {score}</Badge>
              <Badge variant="outline">Round {round}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Stats */}
          <div className="flex justify-center gap-6 text-sm">
            <span className="text-green-600">Wins: {stats.wins}</span>
            <span className="text-red-600">Losses: {stats.losses}</span>
            <span className="text-gray-600">Draws: {stats.draws}</span>
          </div>

          {/* Game Status */}
          <div className="text-center">
            {isWaitingForOpponent ? (
              <p className="text-lg font-medium">Waiting for opponent...</p>
            ) : gameResult ? (
              <div className="space-y-2">
                <p className="text-lg font-medium">{getResultMessage()}</p>
                <div className="flex justify-center items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">You</p>
                    <div className="text-4xl">
                      {CHOICES.find(c => c.value === playerChoice)?.emoji}
                    </div>
                  </div>
                  <div className="text-2xl">VS</div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {mode === 'solo' ? 'AI' : 'Opponent'}
                    </p>
                    <div className="text-4xl">
                      {CHOICES.find(c => c.value === opponentChoice)?.emoji}
                    </div>
                  </div>
                </div>
              </div>
            ) : playerChoice ? (
              <div className="space-y-2">
                <p className="text-lg font-medium">You chose:</p>
                <div className="text-4xl">
                  {CHOICES.find(c => c.value === playerChoice)?.emoji}
                </div>
                <p className="text-muted-foreground">
                  {mode === 'solo' ? 'AI is thinking...' : 'Waiting for opponent...'}
                </p>
              </div>
            ) : (
              <p className="text-lg font-medium">Make your choice!</p>
            )}
          </div>

          {/* Choice Buttons */}
          {!playerChoice && !gameResult && (
            <div className="flex justify-center gap-4">
              {CHOICES.map((choice) => (
                <Button
                  key={choice.value}
                  variant="outline"
                  className="flex flex-col items-center p-6 h-auto"
                  onClick={() => makeChoice(choice.value)}
                >
                  <div className="text-3xl mb-2">{choice.emoji}</div>
                  <span className="text-sm">{choice.label}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Next Round / Reset Buttons */}
          {gameResult && (
            <div className="flex justify-center gap-4">
              <Button onClick={nextRound}>
                Next Round
              </Button>
              <Button onClick={resetGame} variant="outline">
                Reset Game
              </Button>
              <Button onClick={onExit} variant="secondary">
                Exit
              </Button>
            </div>
          )}

          {/* Recent History */}
          {gameHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-center">Recent Rounds</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {gameHistory.slice(-5).map((game, index) => (
                  <div key={index} className="text-xs text-center p-2 bg-muted rounded">
                    <div className="flex gap-1">
                      <span>{CHOICES.find(c => c.value === game.playerChoice)?.emoji}</span>
                      <span>vs</span>
                      <span>{CHOICES.find(c => c.value === game.opponentChoice)?.emoji}</span>
                    </div>
                    <span className={`
                      ${game.result === 'win' ? 'text-green-600' : 
                        game.result === 'lose' ? 'text-red-600' : 'text-gray-600'}
                    `}>
                      {game.result === 'win' ? 'W' : game.result === 'lose' ? 'L' : 'D'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}