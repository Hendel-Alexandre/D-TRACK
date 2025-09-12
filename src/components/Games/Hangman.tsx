import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

type Difficulty = 'easy' | 'medium' | 'hard'
type GameStatus = 'playing' | 'won' | 'lost'

interface HangmanProps {
  mode: 'solo' | 'multiplayer'
  difficulty: Difficulty
  room?: any
  onScoreUpdate: (score: number) => void
  onExit: () => void
}

const WORD_LISTS = {
  easy: ['CAT', 'DOG', 'SUN', 'TREE', 'BOOK', 'DOOR', 'FISH', 'BIRD', 'CAKE', 'BALL'],
  medium: ['COMPUTER', 'ELEPHANT', 'RAINBOW', 'KITCHEN', 'BIRTHDAY', 'DRAGON', 'GARDEN', 'PLANET'],
  hard: ['JAVASCRIPT', 'ALGORITHM', 'ARCHITECTURE', 'EXTRAORDINARY', 'PHOTOSYNTHESIS', 'INTERNATIONAL']
}

const HANGMAN_STAGES = [
  '',
  '  ___\n  |  |\n     |\n     |\n     |\n_____|',
  '  ___\n  |  |\n  O  |\n     |\n     |\n_____|',
  '  ___\n  |  |\n  O  |\n  |  |\n     |\n_____|',
  '  ___\n  |  |\n  O  |\n /|  |\n     |\n_____|',
  '  ___\n  |  |\n  O  |\n /|\\ |\n     |\n_____|',
  '  ___\n  |  |\n  O  |\n /|\\ |\n /   |\n_____|',
  '  ___\n  |  |\n  O  |\n /|\\ |\n / \\ |\n_____|'
]

export function Hangman({ mode, difficulty, room, onScoreUpdate, onExit }: HangmanProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentWord, setCurrentWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing')
  const [score, setScore] = useState(0)
  const [currentGuess, setCurrentGuess] = useState('')
  const [hint, setHint] = useState('')
  const [roomMembers, setRoomMembers] = useState<any[]>([])
  const [isMyTurn, setIsMyTurn] = useState(true)

  const maxWrongGuesses = 6

  useEffect(() => {
    startNewGame()
  }, [difficulty])

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
        // Host goes first
        const isHost = data[0]?.user_id === user?.id
        setIsMyTurn(isHost)
      }
    } catch (error) {
      console.error('Error fetching room members:', error)
    }
  }

  const subscribeToMoves = () => {
    if (!room) return

    const channel = supabase
      .channel('hangman-moves')
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
            // Opponent made a move
            processMove(moveData.letter, false)
            setIsMyTurn(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const startNewGame = () => {
    const wordList = WORD_LISTS[difficulty]
    const word = wordList[Math.floor(Math.random() * wordList.length)]
    setCurrentWord(word)
    setGuessedLetters(new Set())
    setWrongGuesses(0)
    setGameStatus('playing')
    setCurrentGuess('')
    setHint(getHint(word))
  }

  const getHint = (word: string): string => {
    const hints: Record<string, string> = {
      'CAT': 'A furry pet that meows',
      'DOG': 'Man\'s best friend',
      'SUN': 'Source of light in our solar system',
      'TREE': 'Tall plant with branches and leaves',
      'COMPUTER': 'Electronic device for processing data',
      'ELEPHANT': 'Large gray mammal with a trunk',
      'JAVASCRIPT': 'Popular programming language',
      'ALGORITHM': 'Step-by-step problem solving method'
    }
    
    return hints[word] || `A ${word.length}-letter word`
  }

  const processMove = (letter: string, isMyMove: boolean = true) => {
    if (gameStatus !== 'playing') return

    const upperLetter = letter.toUpperCase()
    if (guessedLetters.has(upperLetter)) return

    const newGuessedLetters = new Set([...guessedLetters, upperLetter])
    setGuessedLetters(newGuessedLetters)

    if (currentWord.includes(upperLetter)) {
      // Correct guess
      const isWordComplete = currentWord.split('').every(letter => newGuessedLetters.has(letter))
      if (isWordComplete) {
        setGameStatus('won')
        if (isMyMove) {
          const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20
          updateScore(score + points)
        }
      }
    } else {
      // Wrong guess
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameStatus('lost')
      }
    }
  }

  const makeGuess = async (letter: string) => {
    if (mode === 'multiplayer' && !isMyTurn) {
      toast({
        title: "Not your turn!",
        description: "Wait for your opponent to guess.",
        variant: "destructive"
      })
      return
    }

    if (mode === 'multiplayer' && room) {
      // Send move to other players
      try {
        await supabase
          .from('game_moves')
          .insert({
            room_id: room.id,
            user_id: user?.id,
            move_data: { letter }
          })

        setIsMyTurn(false)
      } catch (error) {
        console.error('Error sending move:', error)
      }
    }

    processMove(letter)
    setCurrentGuess('')
  }

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentGuess.length === 1 && /[A-Za-z]/.test(currentGuess)) {
      makeGuess(currentGuess)
    }
  }

  const updateScore = (newScore: number) => {
    setScore(newScore)
    onScoreUpdate(newScore)
  }

  const getDisplayWord = () => {
    return currentWord
      .split('')
      .map(letter => guessedLetters.has(letter) ? letter : '_')
      .join(' ')
  }

  const getAvailableLetters = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    return alphabet.split('').filter(letter => !guessedLetters.has(letter))
  }

  const getStatusMessage = () => {
    if (mode === 'multiplayer') {
      if (gameStatus === 'playing') {
        return isMyTurn ? "Your turn to guess!" : "Waiting for opponent..."
      }
    }

    switch (gameStatus) {
      case 'won':
        return '🎉 You won! Word guessed!'
      case 'lost':
        return `😔 You lost! The word was: ${currentWord}`
      default:
        return `Guess the word! (${wrongGuesses}/${maxWrongGuesses} wrong guesses)`
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Hangman</CardTitle>
            <div className="flex gap-2 items-center">
              <Badge variant="outline">
                {mode === 'solo' ? `${difficulty} mode` : 'Multiplayer'}
              </Badge>
              <Badge variant="secondary">Score: {score}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game Status */}
          <div className="text-center">
            <p className="text-lg font-medium mb-2">{getStatusMessage()}</p>
            {hint && (
              <p className="text-sm text-muted-foreground">💡 Hint: {hint}</p>
            )}
          </div>

          {/* Hangman Drawing */}
          <div className="flex justify-center">
            <pre className="text-sm font-mono bg-muted p-4 rounded">
              {HANGMAN_STAGES[wrongGuesses]}
            </pre>
          </div>

          {/* Word Display */}
          <div className="text-center">
            <div className="text-3xl font-mono font-bold tracking-wider mb-4">
              {getDisplayWord()}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentWord.length} letters
            </p>
          </div>

          {/* Guess Input */}
          {gameStatus === 'playing' && (mode !== 'multiplayer' || isMyTurn) && (
            <form onSubmit={handleGuessSubmit} className="flex gap-2 justify-center">
              <Input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
                placeholder="Enter a letter"
                maxLength={1}
                className="w-20 text-center text-lg font-bold"
              />
              <Button type="submit" disabled={!currentGuess || guessedLetters.has(currentGuess)}>
                Guess
              </Button>
            </form>
          )}

          {/* Letter Grid */}
          <div className="space-y-4">
            <h4 className="font-semibold text-center">Available Letters</h4>
            <div className="grid grid-cols-6 gap-2">
              {getAvailableLetters().map(letter => (
                <Button
                  key={letter}
                  variant="outline"
                  size="sm"
                  onClick={() => makeGuess(letter)}
                  disabled={gameStatus !== 'playing' || (mode === 'multiplayer' && !isMyTurn)}
                  className="aspect-square"
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>

          {/* Guessed Letters */}
          {guessedLetters.size > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-center">Guessed Letters</h4>
              <div className="flex flex-wrap gap-1 justify-center">
                {Array.from(guessedLetters).map(letter => (
                  <Badge
                    key={letter}
                    variant={currentWord.includes(letter) ? "default" : "destructive"}
                  >
                    {letter}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Game Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={startNewGame} variant="outline">
              New Game
            </Button>
            <Button onClick={onExit} variant="secondary">
              Exit
            </Button>
          </div>

          {/* Multiplayer Info */}
          {mode === 'multiplayer' && roomMembers.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Players: {roomMembers.map(m => m.users.first_name).join(', ')}</p>
              {room && <p>Room Code: {room.room_code}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}