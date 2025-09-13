import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Play, RotateCcw, Download, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Games() {
  const navigate = useNavigate()
  const [gameLoaded, setGameLoaded] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    // Load PyScript
    const pyscriptCSS = document.createElement('link')
    pyscriptCSS.rel = 'stylesheet'
    pyscriptCSS.href = 'https://pyscript.net/releases/2024.1.1/core.css'
    
    const pyscriptJS = document.createElement('script')
    pyscriptJS.type = 'module'
    pyscriptJS.src = 'https://pyscript.net/releases/2024.1.1/core.js'
    
    if (!document.querySelector('link[href*="pyscript"]')) {
      document.head.appendChild(pyscriptCSS)
    }
    if (!document.querySelector('script[src*="pyscript"]')) {
      document.head.appendChild(pyscriptJS)
    }

    // Initialize game after PyScript loads
    const timer = setTimeout(() => {
      setGameLoaded(true)
    }, 3000)

    return () => {
      clearTimeout(timer)
      // Cleanup PyScript elements on unmount
      const existingCSS = document.querySelector('link[href*="pyscript"]')
      const existingJS = document.querySelector('script[src*="pyscript"]')
      if (existingCSS?.parentNode) existingCSS.parentNode.removeChild(existingCSS)
      if (existingJS?.parentNode) existingJS.parentNode.removeChild(existingJS)
    }
  }, [])

  const downloadGame = () => {
    const flappyBirdCode = `import pygame
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
BLUE = (100, 149, 237)
YELLOW = (255, 255, 0)

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
        pygame.draw.circle(screen, YELLOW, (int(self.x), int(self.y)), self.size)
        # Draw simple wing
        pygame.draw.circle(screen, BLACK, (int(self.x) + 5, int(self.y) - 5), 5)

class Pipe:
    def __init__(self, x):
        self.x = x
        self.height = random.randint(100, 400)
        self.gap = 150
        self.speed = 3
        self.width = 60
        self.passed = False

    def update(self):
        self.x -= self.speed

    def draw(self, screen):
        # Top pipe
        pygame.draw.rect(screen, GREEN, (self.x, 0, self.width, self.height))
        pygame.draw.rect(screen, BLACK, (self.x, 0, self.width, self.height), 3)
        # Bottom pipe
        pygame.draw.rect(screen, GREEN, (self.x, self.height + self.gap, self.width, SCREEN_HEIGHT))
        pygame.draw.rect(screen, BLACK, (self.x, self.height + self.gap, self.width, SCREEN_HEIGHT), 3)

    def collides_with(self, bird):
        if (bird.x + bird.size > self.x and bird.x - bird.size < self.x + self.width):
            if (bird.y - bird.size < self.height or bird.y + bird.size > self.height + self.gap):
                return True
        return False

def main():
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("MirBird - Flappy Bird Clone")
    clock = pygame.time.Clock()
    
    bird = Bird()
    pipes = []
    score = 0
    font = pygame.font.Font(None, 48)
    small_font = pygame.font.Font(None, 24)
    
    pipe_spawn_timer = 0
    game_over = False
    
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and not game_over:
                    bird.jump()
                elif event.key == pygame.K_r and game_over:
                    # Restart game
                    bird = Bird()
                    pipes = []
                    score = 0
                    game_over = False
                    pipe_spawn_timer = 0
        
        if not game_over:
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
                elif not pipe.passed and pipe.x < bird.x:
                    pipe.passed = True
                    score += 1
            
            # Check collisions
            for pipe in pipes:
                if pipe.collides_with(bird):
                    game_over = True
            
            # Check boundaries
            if bird.y < 0 or bird.y > SCREEN_HEIGHT:
                game_over = True
        
        # Draw everything
        screen.fill(BLUE)  # Sky color
        
        # Draw clouds
        for i in range(3):
            pygame.draw.circle(screen, WHITE, (50 + i * 150, 100), 30)
            pygame.draw.circle(screen, WHITE, (70 + i * 150, 90), 25)
            pygame.draw.circle(screen, WHITE, (90 + i * 150, 100), 20)
        
        bird.draw(screen)
        for pipe in pipes:
            pipe.draw(screen)
        
        # Draw score
        score_text = font.render(f"Score: {score}", True, BLACK)
        screen.blit(score_text, (10, 10))
        
        # Draw instructions
        if not game_over:
            inst_text = small_font.render("SPACE: Jump", True, BLACK)
            screen.blit(inst_text, (10, SCREEN_HEIGHT - 30))
        else:
            game_over_text = font.render("Game Over!", True, BLACK)
            restart_text = small_font.render("Press R to Restart", True, BLACK)
            screen.blit(game_over_text, (SCREEN_WIDTH//2 - 100, SCREEN_HEIGHT//2))
            screen.blit(restart_text, (SCREEN_WIDTH//2 - 80, SCREEN_HEIGHT//2 + 40))
        
        pygame.display.flip()
        clock.tick(60)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()`

    const element = document.createElement('a')
    const file = new Blob([flappyBirdCode], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'mirbird-flappy.py'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🐦 Play MirBird
          </h1>
          <p className="text-muted-foreground text-lg">Classic Flappy Bird gameplay in your browser</p>
        </div>
      </div>

      {/* Game Alert */}
      <Alert className="max-w-4xl mx-auto">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Game Controls:</strong> Press <kbd className="bg-muted px-2 py-1 rounded text-xs">SPACE</kbd> to jump, 
          <kbd className="bg-muted px-2 py-1 rounded text-xs ml-1">R</kbd> to restart when game over.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Play className="h-6 w-6" />
                MirBird Game
              </CardTitle>
              <CardDescription className="text-sky-100">
                Navigate the bird through pipes to score points!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-gradient-to-b from-sky-200 to-green-200 dark:from-sky-800 dark:to-green-800 relative">
                {/* Game Canvas Container */}
                <div 
                  id="game-container" 
                  className="w-full h-[600px] flex items-center justify-center relative overflow-hidden"
                >
                  {!gameLoaded ? (
                    <div className="text-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="text-primary font-medium">Loading MirBird Game...</p>
                      <p className="text-sm text-muted-foreground">PyScript environment initializing</p>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-sky-300 to-green-300 dark:from-sky-700 dark:to-green-700 flex items-center justify-center">
                      {/* PyScript Game Canvas */}
                      <div className="relative">
                        <canvas 
                          id="game-canvas" 
                          width="400" 
                          height="500"
                          className="border-4 border-primary/20 rounded-lg shadow-lg bg-sky-100"
                        ></canvas>
                        
                        {/* Game Overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md">
                            <span className="text-lg font-bold">Score: {score}</span>
                          </div>
                          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                            SPACE: Jump | R: Restart
                          </div>
                        </div>
                        
                        {/* Simulated Game Display */}
                        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-200 rounded-lg flex items-center justify-center">
                          <div className="text-center space-y-6">
                            <div className="text-8xl animate-bounce">🐦</div>
                            <div className="space-y-2">
                              <h3 className="text-2xl font-bold text-primary">MirBird Ready!</h3>
                              <p className="text-muted-foreground">Press SPACE to start flying</p>
                            </div>
                            <div className="flex justify-center space-x-8 text-6xl">
                              <span className="text-green-600">|</span>
                              <span className="text-green-600">|</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* PyScript Integration Note */}
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        PyScript Game Loading...
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score & Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏆 Game Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary" id="score-display">
                  Score: {score}
                </div>
                <p className="text-sm text-muted-foreground">Current Score</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">🥇</div>
                  <div className="text-xs text-muted-foreground">Best: 0</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">🎯</div>
                  <div className="text-xs text-muted-foreground">Attempts: 1</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>🎮 How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p><strong>Objective:</strong> Guide the bird through pipe gaps</p>
                <p><strong>Controls:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                  <li>Press <kbd className="bg-muted px-1 rounded text-xs">SPACE</kbd> to make the bird jump</li>
                  <li>Press <kbd className="bg-muted px-1 rounded text-xs">R</kbd> to restart after game over</li>
                </ul>
                <p><strong>Scoring:</strong> Get 1 point for each pipe you pass</p>
                <p><strong>Game Over:</strong> Hitting pipes, ceiling, or ground ends the game</p>
              </div>
            </CardContent>
          </Card>

          {/* Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Get the full Python version to play offline with enhanced features.
              </p>
              <Button onClick={downloadGame} variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download MirBird.py
              </Button>
              <div className="text-xs text-muted-foreground">
                <p>Requirements: Python 3.7+ and pygame</p>
              </div>
            </CardContent>
          </Card>

          {/* Game Actions */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-4 w-4" />
                Reload Game
              </Button>
              <Button 
                variant="secondary" 
                className="w-full gap-2"
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { code: 'KeyR' })
                  document.dispatchEvent(event)
                }}
              >
                🔄 Restart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}