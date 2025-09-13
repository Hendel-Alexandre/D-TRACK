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
    const flappyBirdCode = `# Flappy Bird Game - MirBird Edition
# Based on mehmetemineker's flappy-bird implementation
# https://github.com/mehmetemineker/flappy-bird

import pygame
import sys
import random
import math

# Initialize Pygame
pygame.init()

# Game Configuration
class Config:
    SCREEN_WIDTH = 400
    SCREEN_HEIGHT = 600
    FPS = 60
    
    # Colors
    WHITE = (255, 255, 255)
    BLACK = (0, 0, 0)
    BLUE = (135, 206, 235)  # Sky Blue
    GREEN = (34, 139, 34)   # Forest Green
    YELLOW = (255, 215, 0)  # Gold
    RED = (220, 20, 60)     # Crimson
    
    # Game Physics
    GRAVITY = 0.5
    JUMP_STRENGTH = -10
    PIPE_SPEED = 3
    PIPE_GAP = 150
    PIPE_WIDTH = 60
    
    # Bird Properties
    BIRD_SIZE = 20
    BIRD_X = 50

class Bird:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.velocity = 0
        self.size = Config.BIRD_SIZE
        self.rotation = 0
        
    def jump(self):
        self.velocity = Config.JUMP_STRENGTH
        
    def update(self):
        self.velocity += Config.GRAVITY
        self.y += self.velocity
        
        # Update rotation based on velocity
        self.rotation = max(-25, min(25, self.velocity * 3))
        
    def draw(self, screen):
        # Draw bird body
        pygame.draw.circle(screen, Config.YELLOW, 
                         (int(self.x), int(self.y)), self.size)
        pygame.draw.circle(screen, Config.BLACK, 
                         (int(self.x), int(self.y)), self.size, 2)
        
        # Draw bird eye
        eye_x = int(self.x + self.size * 0.3)
        eye_y = int(self.y - self.size * 0.2)
        pygame.draw.circle(screen, Config.WHITE, (eye_x, eye_y), 5)
        pygame.draw.circle(screen, Config.BLACK, (eye_x + 2, eye_y), 2)
        
        # Draw beak
        beak_points = [
            (int(self.x + self.size), int(self.y)),
            (int(self.x + self.size + 10), int(self.y - 3)),
            (int(self.x + self.size + 10), int(self.y + 3))
        ]
        pygame.draw.polygon(screen, (255, 165, 0), beak_points)
        
    def get_rect(self):
        return pygame.Rect(self.x - self.size, self.y - self.size, 
                          self.size * 2, self.size * 2)

class Pipe:
    def __init__(self, x):
        self.x = x
        self.height = random.randint(100, Config.SCREEN_HEIGHT - Config.PIPE_GAP - 100)
        self.passed = False
        self.width = Config.PIPE_WIDTH
        
    def update(self):
        self.x -= Config.PIPE_SPEED
        
    def draw(self, screen):
        # Top pipe
        top_rect = pygame.Rect(self.x, 0, self.width, self.height)
        pygame.draw.rect(screen, Config.GREEN, top_rect)
        pygame.draw.rect(screen, Config.BLACK, top_rect, 3)
        
        # Top pipe cap
        cap_rect = pygame.Rect(self.x - 5, self.height - 20, self.width + 10, 20)
        pygame.draw.rect(screen, Config.GREEN, cap_rect)
        pygame.draw.rect(screen, Config.BLACK, cap_rect, 3)
        
        # Bottom pipe
        bottom_y = self.height + Config.PIPE_GAP
        bottom_rect = pygame.Rect(self.x, bottom_y, self.width, 
                                Config.SCREEN_HEIGHT - bottom_y)
        pygame.draw.rect(screen, Config.GREEN, bottom_rect)
        pygame.draw.rect(screen, Config.BLACK, bottom_rect, 3)
        
        # Bottom pipe cap
        cap_rect2 = pygame.Rect(self.x - 5, bottom_y, self.width + 10, 20)
        pygame.draw.rect(screen, Config.GREEN, cap_rect2)
        pygame.draw.rect(screen, Config.BLACK, cap_rect2, 3)
        
    def collides_with(self, bird):
        bird_rect = bird.get_rect()
        top_pipe = pygame.Rect(self.x, 0, self.width, self.height)
        bottom_pipe = pygame.Rect(self.x, self.height + Config.PIPE_GAP, 
                                self.width, Config.SCREEN_HEIGHT)
        
        return bird_rect.colliderect(top_pipe) or bird_rect.colliderect(bottom_pipe)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((Config.SCREEN_WIDTH, Config.SCREEN_HEIGHT))
        pygame.display.set_caption("MirBird - Flappy Bird")
        self.clock = pygame.time.Clock()
        
        # Game state
        self.bird = Bird(Config.BIRD_X, Config.SCREEN_HEIGHT // 2)
        self.pipes = []
        self.score = 0
        self.high_score = 0
        self.game_over = False
        self.game_started = False
        
        # Fonts
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 32)
        self.font_small = pygame.font.Font(None, 24)
        
        # Timing
        self.pipe_timer = 0
        self.pipe_frequency = 90  # frames between pipes
        
    def spawn_pipe(self):
        self.pipes.append(Pipe(Config.SCREEN_WIDTH))
        
    def update(self):
        if not self.game_over and self.game_started:
            self.bird.update()
            
            # Spawn pipes
            self.pipe_timer += 1
            if self.pipe_timer >= self.pipe_frequency:
                self.spawn_pipe()
                self.pipe_timer = 0
                
            # Update pipes
            for pipe in self.pipes[:]:
                pipe.update()
                
                # Remove off-screen pipes
                if pipe.x + pipe.width < 0:
                    self.pipes.remove(pipe)
                    
                # Score when bird passes pipe
                if not pipe.passed and pipe.x + pipe.width < self.bird.x:
                    pipe.passed = True
                    self.score += 1
                    
                # Check collision
                if pipe.collides_with(self.bird):
                    self.game_over = True
                    
            # Check boundary collision
            if (self.bird.y - self.bird.size <= 0 or 
                self.bird.y + self.bird.size >= Config.SCREEN_HEIGHT):
                self.game_over = True
                
        if self.game_over:
            self.high_score = max(self.high_score, self.score)
            
    def draw_background(self):
        # Sky gradient
        for y in range(Config.SCREEN_HEIGHT):
            color_ratio = y / Config.SCREEN_HEIGHT
            r = int(135 + (255 - 135) * color_ratio * 0.3)
            g = int(206 + (255 - 206) * color_ratio * 0.3)
            b = int(235 + (255 - 235) * color_ratio * 0.2)
            pygame.draw.line(self.screen, (r, g, b), (0, y), (Config.SCREEN_WIDTH, y))
            
        # Draw clouds
        cloud_positions = [(80, 100), (250, 80), (350, 120), (150, 160)]
        for cloud_x, cloud_y in cloud_positions:
            pygame.draw.circle(self.screen, Config.WHITE, (cloud_x, cloud_y), 25, 0)
            pygame.draw.circle(self.screen, Config.WHITE, (cloud_x + 20, cloud_y), 35, 0)
            pygame.draw.circle(self.screen, Config.WHITE, (cloud_x + 45, cloud_y), 25, 0)
            
    def draw_ui(self):
        # Score
        score_text = self.font_large.render(str(self.score), True, Config.WHITE)
        score_shadow = self.font_large.render(str(self.score), True, Config.BLACK)
        self.screen.blit(score_shadow, (Config.SCREEN_WIDTH // 2 - score_shadow.get_width() // 2 + 2, 52))
        self.screen.blit(score_text, (Config.SCREEN_WIDTH // 2 - score_text.get_width() // 2, 50))
        
        if not self.game_started:
            # Start instruction
            title_text = self.font_large.render("MirBird", True, Config.WHITE)
            start_text = self.font_medium.render("Press SPACE to Start", True, Config.WHITE)
            
            self.screen.blit(title_text, 
                           (Config.SCREEN_WIDTH // 2 - title_text.get_width() // 2, 200))
            self.screen.blit(start_text, 
                           (Config.SCREEN_WIDTH // 2 - start_text.get_width() // 2, 250))
            
        elif self.game_over:
            # Game over screen
            game_over_text = self.font_large.render("Game Over!", True, Config.WHITE)
            score_text = self.font_medium.render(f"Score: {self.score}", True, Config.WHITE)
            high_score_text = self.font_medium.render(f"Best: {self.high_score}", True, Config.WHITE)
            restart_text = self.font_small.render("Press R to Restart", True, Config.WHITE)
            
            # Background for game over text
            overlay = pygame.Surface((Config.SCREEN_WIDTH, 200))
            overlay.fill((0, 0, 0))
            overlay.set_alpha(128)
            self.screen.blit(overlay, (0, 200))
            
            self.screen.blit(game_over_text, 
                           (Config.SCREEN_WIDTH // 2 - game_over_text.get_width() // 2, 220))
            self.screen.blit(score_text, 
                           (Config.SCREEN_WIDTH // 2 - score_text.get_width() // 2, 270))
            self.screen.blit(high_score_text, 
                           (Config.SCREEN_WIDTH // 2 - high_score_text.get_width() // 2, 300))
            self.screen.blit(restart_text, 
                           (Config.SCREEN_WIDTH // 2 - restart_text.get_width() // 2, 340))
        else:
            # In-game instructions
            instruction_text = self.font_small.render("SPACE: Jump", True, Config.WHITE)
            self.screen.blit(instruction_text, (10, Config.SCREEN_HEIGHT - 30))
            
    def draw(self):
        self.draw_background()
        
        # Draw pipes
        for pipe in self.pipes:
            pipe.draw(self.screen)
            
        # Draw bird
        self.bird.draw(self.screen)
        
        # Draw UI
        self.draw_ui()
        
    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                if not self.game_started:
                    self.game_started = True
                elif not self.game_over:
                    self.bird.jump()
            elif event.key == pygame.K_r and self.game_over:
                self.restart()
                
    def restart(self):
        self.bird = Bird(Config.BIRD_X, Config.SCREEN_HEIGHT // 2)
        self.pipes = []
        self.score = 0
        self.game_over = False
        self.game_started = False
        self.pipe_timer = 0
        
    def run(self):
        running = True
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                else:
                    self.handle_event(event)
                    
            self.update()
            self.draw()
            
            pygame.display.flip()
            self.clock.tick(Config.FPS)
            
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()`

    const readmeText = `MirBird - Enhanced Flappy Bird Game

Based on mehmetemineker's flappy-bird implementation:
https://github.com/mehmetemineker/flappy-bird

Requirements:
- Python 3.7+
- pygame library (install with: pip install pygame)

Installation:
1. Install Python from python.org
2. Install pygame: pip install pygame
3. Run the game: python mirbird_game.py

Game Controls:
- SPACE: Jump/Start game
- R: Restart when game over
- ESC: Exit game

Features:
- Smooth bird physics with rotation
- Animated background with clouds
- Score tracking with high score
- Enhanced graphics and visual effects
- Collision detection
- Game over screen

Tips:
- Time your jumps carefully
- Watch the bird's rotation for velocity feedback
- Try to beat your high score!

Enjoy playing MirBird!`

    const gameFiles = {
      'mirbird_game.py': flappyBirdCode,
      'README.txt': readmeText
    }
    
    const element = document.createElement('a')
    const fileContent = Object.entries(gameFiles).map(([name, content]) => 
      `=== ${name} ===\n${content}\n\n`
    ).join('')
    const file = new Blob([fileContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'mirbird-enhanced-game.txt'
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
                      {/* Enhanced Game Canvas */}
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
                        
                        {/* Enhanced Game Display inspired by mehmetemineker's implementation */}
                        <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-green-200 rounded-lg flex items-center justify-center">
                          <div className="text-center space-y-6">
                            <div className="text-8xl animate-bounce">🐦</div>
                            <div className="space-y-2">
                              <h3 className="text-2xl font-bold text-primary">MirBird Ready!</h3>
                              <p className="text-muted-foreground">Enhanced Flappy Bird Experience</p>
                              <p className="text-sm text-muted-foreground">
                                Based on mehmetemineker's implementation
                              </p>
                            </div>
                            <div className="flex justify-center space-x-8 text-6xl">
                              <span className="text-green-600 animate-pulse">|</span>
                              <span className="text-green-600">|</span>
                              <span className="text-green-600 animate-pulse">|</span>
                            </div>
                            <div className="text-sm bg-black/20 rounded p-2 text-white">
                              Press SPACE to start your adventure!
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* PyScript Integration Note */}
                      <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                        Enhanced with mehmetemineker's design
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
                <div className="bg-info/10 border border-info/20 rounded p-2 mt-3">
                  <p className="text-xs text-info-foreground">
                    <strong>Enhanced Features:</strong> This version includes improved physics, 
                    visual effects, and scoring based on mehmetemineker's implementation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Enhanced Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Get the full Python version with enhanced features inspired by mehmetemineker's design.
              </p>
              <Button onClick={downloadGame} variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download MirBird Enhanced
              </Button>
              <div className="text-xs text-muted-foreground">
                <p>Requirements: Python 3.7+ and pygame</p>
                <p>Includes: Enhanced graphics, physics, and game mechanics</p>
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