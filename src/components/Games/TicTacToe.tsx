import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

type Player = 'X' | 'O' | null
type Board = Player[]
type Difficulty = 'easy' | 'medium' | 'hard'

interface TicTacToeProps {
  mode: 'solo' | 'multiplayer'
  difficulty: Difficulty
  room?: any
  onScoreUpdate: (score: number) => void
  onExit: () => void
}

export function TicTacToe({ mode, difficulty, room, onScoreUpdate, onExit }: TicTacToeProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing')
  const [score, setScore] = useState(0)
  const [roomMembers, setRoomMembers] = useState<any[]>([])
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState<'X' | 'O'>('X')

  useEffect(() => {
    if (mode === 'multiplayer' && room) {
      // Set up real-time subscriptions
      fetchRoomMembers()
      subscribeToMoves()
      subscribeToRoomUpdates()
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
        // Set player symbol based on join order
        const userIndex = data.findIndex((member: any) => member.user_id === user?.id)
        setCurrentPlayerSymbol(userIndex === 0 ? 'X' : 'O')
        setIsPlayerTurn(userIndex === 0) // Host goes first
      }
    } catch (error) {
      console.error('Error fetching room members:', error)
    }
  }

  const subscribeToMoves = () => {
    if (!room) return

    const channel = supabase
      .channel('game-moves')
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
          if (payload.new.user_id !== user?.id) {
            // Apply opponent's move
            setBoard(moveData.board)
            setIsPlayerTurn(true)
            checkGameEnd(moveData.board)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const subscribeToRoomUpdates = () => {
    if (!room) return

    const channel = supabase
      .channel('room-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${room.id}`
        },
        (payload) => {
          const roomData = payload.new as any
          if (roomData.status === 'finished') {
            // Game ended
            const winner = roomData.game_state?.winner
            if (winner === user?.id) {
              setGameStatus('won')
              updateScore(score + 10)
            } else {
              setGameStatus('lost')
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const checkWinner = (board: Board): Player => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]
      }
    }

    return null
  }

  const checkGameEnd = (newBoard: Board) => {
    const winner = checkWinner(newBoard)
    const isBoardFull = newBoard.every(cell => cell !== null)

    if (winner) {
      if (mode === 'solo') {
        if (winner === 'X') {
          setGameStatus('won')
          updateScore(score + 10)
        } else {
          setGameStatus('lost')
        }
      }
    } else if (isBoardFull) {
      setGameStatus('draw')
    }
  }

  const updateScore = (newScore: number) => {
    setScore(newScore)
    onScoreUpdate(newScore)
  }

  const makeMove = async (index: number) => {
    if (board[index] || gameStatus !== 'playing') return

    if (mode === 'multiplayer' && !isPlayerTurn) {
      toast({
        title: "Not your turn!",
        description: "Wait for your opponent to make a move.",
        variant: "destructive"
      })
      return
    }

    const newBoard = [...board]
    newBoard[index] = mode === 'solo' ? 'X' : currentPlayerSymbol
    setBoard(newBoard)

    if (mode === 'multiplayer' && room) {
      // Send move to other players
      try {
        await supabase
          .from('game_moves')
          .insert({
            room_id: room.id,
            user_id: user?.id,
            move_data: { board: newBoard, position: index }
          })

        setIsPlayerTurn(false)
      } catch (error) {
        console.error('Error sending move:', error)
      }
    } else {
      // Solo mode - AI move
      checkGameEnd(newBoard)
      if (gameStatus === 'playing') {
        setTimeout(() => makeAIMove(newBoard), 500)
      }
    }

    checkGameEnd(newBoard)
  }

  const makeAIMove = (currentBoard: Board) => {
    const availableMoves = currentBoard
      .map((cell, index) => cell === null ? index : null)
      .filter(val => val !== null) as number[]

    if (availableMoves.length === 0) return

    let aiMove: number

    if (difficulty === 'easy') {
      // Random move
      aiMove = availableMoves[Math.floor(Math.random() * availableMoves.length)]
    } else if (difficulty === 'medium') {
      // 50% chance of optimal move, 50% random
      aiMove = Math.random() < 0.5 
        ? getBestMove(currentBoard, 'O') 
        : availableMoves[Math.floor(Math.random() * availableMoves.length)]
    } else {
      // Hard - always optimal move
      aiMove = getBestMove(currentBoard, 'O')
    }

    const newBoard = [...currentBoard]
    newBoard[aiMove] = 'O'
    setBoard(newBoard)
    checkGameEnd(newBoard)
  }

  const getBestMove = (board: Board, player: Player): number => {
    // Simple minimax implementation
    const availableMoves = board
      .map((cell, index) => cell === null ? index : null)
      .filter(val => val !== null) as number[]

    // Check for winning move
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = player
      if (checkWinner(testBoard) === player) {
        return move
      }
    }

    // Block opponent's winning move
    const opponent = player === 'X' ? 'O' : 'X'
    for (const move of availableMoves) {
      const testBoard = [...board]
      testBoard[move] = opponent
      if (checkWinner(testBoard) === opponent) {
        return move
      }
    }

    // Take center if available
    if (board[4] === null) return 4

    // Take a corner
    const corners = [0, 2, 6, 8]
    const availableCorners = corners.filter(corner => board[corner] === null)
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)]
    }

    // Take any edge
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setGameStatus('playing')
  }

  const getStatusMessage = () => {
    if (mode === 'multiplayer') {
      if (gameStatus === 'playing') {
        return isPlayerTurn ? "Your turn" : "Waiting for opponent..."
      }
    }

    switch (gameStatus) {
      case 'won':
        return '🎉 You won!'
      case 'lost':
        return '😔 You lost!'
      case 'draw':
        return '🤝 It\'s a draw!'
      default:
        return mode === 'solo' ? 'Your turn (X)' : 'Playing...'
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tic Tac Toe</CardTitle>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">
                {mode === 'solo' ? `${difficulty} AI` : 'Multiplayer'}
              </Badge>
              <Badge variant="secondary">Score: {score}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Status */}
          <div className="text-center">
            <p className="text-lg font-medium">{getStatusMessage()}</p>
            {mode === 'multiplayer' && roomMembers.length > 0 && (
              <div className="flex justify-center gap-4 mt-2 text-sm text-muted-foreground">
                {roomMembers.map((member: any, index) => (
                  <span key={member.id} className="flex items-center gap-1">
                    {member.users.first_name} ({index === 0 ? 'X' : 'O'})
                    {member.user_id === user?.id && ' (You)'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Game Board */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {board.map((cell, index) => (
              <Button
                key={index}
                variant="outline"
                className="aspect-square text-2xl font-bold h-20 w-20 p-0"
                onClick={() => makeMove(index)}
                disabled={cell !== null || gameStatus !== 'playing' || (mode === 'multiplayer' && !isPlayerTurn)}
              >
                {cell}
              </Button>
            ))}
          </div>

          {/* Game Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={resetGame} variant="outline">
              New Game
            </Button>
            <Button onClick={onExit} variant="secondary">
              Exit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}