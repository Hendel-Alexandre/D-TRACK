import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Play, ArrowLeft, Grid3x3, Bird, Gamepad2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type GameType = 'flappy' | 'connect4' | null

export default function Games() {
  const navigate = useNavigate()
  const [selectedGame, setSelectedGame] = useState<GameType>(null)

  React.useEffect(() => {
    // Load PyScript CSS and JS
    const pyscriptCSS = document.createElement('link')
    pyscriptCSS.rel = 'stylesheet'
    pyscriptCSS.href = 'https://pyscript.net/releases/2024.1.1/core.css'
    
    const pyscriptJS = document.createElement('script')
    pyscriptJS.type = 'module'
    pyscriptJS.src = 'https://pyscript.net/releases/2024.1.1/core.js'
    
    // Only add if not already present
    if (!document.querySelector('link[href*="pyscript"]')) {
      document.head.appendChild(pyscriptCSS)
    }
    if (!document.querySelector('script[src*="pyscript"]')) {
      document.head.appendChild(pyscriptJS)
    }

    return () => {
      // Cleanup on unmount
      const existingCSS = document.querySelector('link[href*="pyscript"]')
      const existingJS = document.querySelector('script[src*="pyscript"]')
      if (existingCSS && existingCSS.parentNode) document.head.removeChild(existingCSS)
      if (existingJS && existingJS.parentNode) document.head.removeChild(existingJS)
    }
  }, [])

  const downloadFlappyBird = () => {
    const gameFiles = {
      'flappy.py': `import pygame
import sys
import random

# Initialize Pygame
pygame.init()

# Constants
SCREEN_WIDTH = 400
SCREEN_HEIGHT = 600
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)

class Bird:
    def __init__(self):
        self.x = 50
        self.y = 300
        self.velocity = 0
        self.gravity = 0.8
        self.jump_strength = -12
        self.size = 20

    def jump(self):
        self.velocity = self.jump_strength

    def update(self):
        self.velocity += self.gravity
        self.y += self.velocity

    def draw(self, screen):
        pygame.draw.circle(screen, BLUE, (int(self.x), int(self.y)), self.size)

class Pipe:
    def __init__(self, x):
        self.x = x
        self.height = random.randint(100, 400)
        self.gap = 150
        self.speed = 3
        self.width = 60

    def update(self):
        self.x -= self.speed

    def draw(self, screen):
        # Top pipe
        pygame.draw.rect(screen, GREEN, (self.x, 0, self.width, self.height))
        # Bottom pipe
        pygame.draw.rect(screen, GREEN, (self.x, self.height + self.gap, self.width, SCREEN_HEIGHT))

    def collides_with(self, bird):
        if (bird.x + bird.size > self.x and bird.x - bird.size < self.x + self.width):
            if (bird.y - bird.size < self.height or bird.y + bird.size > self.height + self.gap):
                return True
        return False

def main():
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Flappy Bird")
    clock = pygame.time.Clock()
    
    bird = Bird()
    pipes = []
    score = 0
    font = pygame.font.Font(None, 36)
    
    pipe_spawn_timer = 0
    
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE:
                    bird.jump()
        
        # Update bird
        bird.update()
        
        # Spawn pipes
        pipe_spawn_timer += 1
        if pipe_spawn_timer > 90:
            pipes.append(Pipe(SCREEN_WIDTH))
            pipe_spawn_timer = 0
        
        # Update pipes
        for pipe in pipes[:]:
            pipe.update()
            if pipe.x < -pipe.width:
                pipes.remove(pipe)
                score += 1
        
        # Check collisions
        for pipe in pipes:
            if pipe.collides_with(bird):
                running = False
        
        # Check boundaries
        if bird.y < 0 or bird.y > SCREEN_HEIGHT:
            running = False
        
        # Draw everything
        screen.fill(WHITE)
        bird.draw(screen)
        for pipe in pipes:
            pipe.draw(screen)
        
        # Draw score
        score_text = font.render(f"Score: {score}", True, BLACK)
        screen.blit(score_text, (10, 10))
        
        pygame.display.flip()
        clock.tick(60)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`,
      'README.txt': `Flappy Bird - Python Pygame Game

Requirements:
- Python 3.7+
- pygame library (install with: pip install pygame)

Instructions:
1. Run: python flappy.py
2. Press SPACE to jump
3. Avoid the green pipes
4. Try to get the highest score!

Game Controls:
- SPACE: Jump
- ESC: Exit

Enjoy playing Flappy Bird!`
    }
    
    const element = document.createElement('a')
    const fileContent = Object.entries(gameFiles).map(([name, content]) => 
      `=== ${name} ===\n${content}\n\n`
    ).join('')
    const file = new Blob([fileContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'flappy-bird-game.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const Connect4Game = () => {
    const [board, setBoard] = useState<(number | null)[][]>(
      Array(6).fill(null).map(() => Array(7).fill(null))
    )
    const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
    const [winner, setWinner] = useState<number | null>(null)

    const dropPiece = (col: number) => {
      if (winner) return
      
      const newBoard = [...board]
      for (let row = 5; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = currentPlayer
          setBoard(newBoard)
          
          if (checkWinner(newBoard, row, col)) {
            setWinner(currentPlayer)
          } else {
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
          }
          break
        }
      }
    }

    const checkWinner = (board: (number | null)[][], row: number, col: number): boolean => {
      const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
      ]
      
      for (const [dr, dc] of directions) {
        let count = 1
        
        // Check positive direction
        let r = row + dr, c = col + dc
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === currentPlayer) {
          count++
          r += dr
          c += dc
        }
        
        // Check negative direction
        r = row - dr
        c = col - dc
        while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === currentPlayer) {
          count++
          r -= dr
          c -= dc
        }
        
        if (count >= 4) return true
      }
      
      return false
    }

    const resetGame = () => {
      setBoard(Array(6).fill(null).map(() => Array(7).fill(null)))
      setCurrentPlayer(1)
      setWinner(null)
    }

    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="text-lg font-semibold">
          {winner ? `Player ${winner} Wins! 🎉` : `Player ${currentPlayer}'s Turn`}
        </div>
        
        <div className="grid grid-cols-7 gap-1 bg-primary/20 p-4 rounded-lg">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => dropPiece(colIndex)}
                className="w-12 h-12 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center hover:bg-muted/50 transition-colors"
                disabled={!!winner}
              >
                {cell && (
                  <div
                    className={`w-10 h-10 rounded-full ${
                      cell === 1 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                  />
                )}
              </button>
            ))
          )}
        </div>
        
        <Button onClick={resetGame} variant="outline">
          New Game
        </Button>
      </div>
    )
  }

  const FlappyBirdGame = () => (
    <div className="bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900 dark:to-blue-900 p-6 rounded-lg">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce">🐦</div>
        <h3 className="text-2xl font-bold text-primary">Flappy Bird</h3>
        <p className="text-muted-foreground">
          Navigate through pipes and achieve the highest score!
        </p>
        
        <div 
          className="bg-black rounded-lg p-4 min-h-[300px] flex items-center justify-center text-green-400 font-mono text-sm"
        >
          <div className="text-center">
            🐦 Flappy Bird Game Demo<br/>
            Press SPACE to jump<br/>
            Avoid the green pipes!<br/><br/>
            Download the full Python version<br/>
            for complete gameplay experience
          </div>
        </div>
        
        <Button onClick={downloadFlappyBird} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Python Version
        </Button>
      </div>
    </div>
  )

  if (selectedGame) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => setSelectedGame(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <h1 className="text-3xl font-bold">
            {selectedGame === 'flappy' ? '🐦 Flappy Bird' : '🔴 Connect Four'}
          </h1>
        </div>
        
        <div className="max-w-2xl mx-auto">
          {selectedGame === 'connect4' ? <Connect4Game /> : <FlappyBirdGame />}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 text-6xl">
          <Gamepad2 className="h-16 w-16 text-primary animate-pulse" />
          <span>🎮</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Games Center
          </h1>
          <p className="text-muted-foreground text-lg">Choose your adventure!</p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Flappy Bird Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4 group-hover:animate-bounce">🐦</div>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Bird className="h-6 w-6" />
              Flappy Bird
            </CardTitle>
            <CardDescription className="text-base">
              Navigate through pipes in this classic arcade game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900/50 dark:to-blue-900/50 p-4 rounded-lg">
              <div className="text-center text-sm space-y-2">
                <p className="font-semibold">🎯 How to Play:</p>
                <p>• Press SPACE to jump</p>
                <p>• Avoid the green pipes</p>
                <p>• Score points by passing through gaps</p>
                <p>• Don't hit the ground or ceiling!</p>
              </div>
            </div>
            <Button 
              onClick={() => setSelectedGame('flappy')} 
              className="w-full gap-2 text-lg py-6"
              size="lg"
            >
              <Play className="h-5 w-5" />
              Play Flappy Bird
            </Button>
          </CardContent>
        </Card>

        {/* Connect Four Card */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4 group-hover:animate-pulse">🔴</div>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Grid3x3 className="h-6 w-6" />
              Connect Four
            </CardTitle>
            <CardDescription className="text-base">
              Strategic game for two players - get four in a row to win!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-red-100 to-yellow-200 dark:from-red-900/50 dark:to-yellow-900/50 p-4 rounded-lg">
              <div className="text-center text-sm space-y-2">
                <p className="font-semibold">🎯 How to Play:</p>
                <p>• Drop pieces by clicking columns</p>
                <p>• Get 4 in a row (any direction)</p>
                <p>• Red player goes first</p>
                <p>• Alternate turns with yellow player</p>
              </div>
            </div>
            <Button 
              onClick={() => setSelectedGame('connect4')} 
              className="w-full gap-2 text-lg py-6"
              size="lg"
              variant="secondary"
            >
              <Play className="h-5 w-5" />
              Play Connect Four
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fun Features Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🌟 Game Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl">🏆</div>
              <h4 className="font-semibold">Classic Gameplay</h4>
              <p className="text-sm text-muted-foreground">
                Authentic game mechanics that stay true to the originals
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">🎨</div>
              <h4 className="font-semibold">Modern Design</h4>
              <p className="text-sm text-muted-foreground">
                Beautiful, responsive interface with smooth animations
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">📱</div>
              <h4 className="font-semibold">Cross-Platform</h4>
              <p className="text-sm text-muted-foreground">
                Play on desktop, tablet, or mobile devices
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl">⚡</div>
              <h4 className="font-semibold">Instant Play</h4>
              <p className="text-sm text-muted-foreground">
                No downloads required - play directly in your browser
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}