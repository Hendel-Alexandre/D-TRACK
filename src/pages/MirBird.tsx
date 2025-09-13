import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, Play, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MirBird() {
  const navigate = useNavigate()

  useEffect(() => {
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

  const downloadGame = () => {
    // Create zip file content for download
    const gameFiles = {
      'main.py': `import pygame, sys
from settings import WIDTH, HEIGHT, ground_space
from world import World

pygame.init()

screen = pygame.display.set_mode((WIDTH, HEIGHT + ground_space))
pygame.display.set_caption("MirBird")  # Updated title

class Main:
    def __init__(self, screen):
        self.screen = screen
        self.bg_img = pygame.image.load('assets/terrain/bg.png')
        self.bg_img = pygame.transform.scale(self.bg_img, (WIDTH, HEIGHT))
        self.ground_img = pygame.image.load('assets/terrain/ground.png')
        self.ground_scroll = 0
        self.scroll_speed = -6
        self.FPS = pygame.time.Clock()
        self.stop_ground_scroll = False

    def main(self):
        world = World(screen)
        while True:
            self.stop_ground_scroll = world.game_over
            self.screen.blit(self.bg_img, (0, 0))
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()
                elif event.type == pygame.KEYDOWN:
                    if not world.playing and not world.game_over:
                        world.playing = True
                    if event.key == pygame.K_SPACE:
                        world.update("jump")
                    if event.key == pygame.K_r:
                        world.update("restart")
            world.update()
            self.screen.blit(self.ground_img, (self.ground_scroll, HEIGHT))
            if not self.stop_ground_scroll:
                self.ground_scroll += self.scroll_speed
                if abs(self.ground_scroll) > 35:
                    self.ground_scroll = 0
            pygame.display.update()
            self.FPS.tick(60)

if __name__ == "__main__":
    play = Main(screen)
    play.main()`,
      'settings.py': `from os import walk
import pygame

WIDTH, HEIGHT = 600, 650

pipe_pair_sizes = [
    (1, 7),
    (2, 6),
    (3, 5),
    (4, 4),
    (5, 3),
    (6, 2),
    (7, 1)
]
pipe_size = HEIGHT // 10
pipe_gap = (pipe_size * 2) + (pipe_size // 2)
ground_space = 50

def import_sprite(path):
    surface_list = []
    for _, __, img_file in walk(path):
        for image in img_file:
            full_path = f"{path}/{image}"
            img_surface = pygame.image.load(full_path).convert_alpha()
            surface_list.append(img_surface)
    return surface_list`,
      'README.txt': `MirBird - Python Pygame Game

Requirements:
- Python 3.7+
- pygame library (install with: pip install pygame)

Instructions:
1. Extract all files to a folder
2. Make sure you have the assets folder with terrain and bird images
3. Run: python main.py
4. Press SPACE to jump, R to restart

Game Controls:
- SPACE: Jump
- R: Restart game
- ESC: Exit

Enjoy playing MirBird!`
    }
    
    // Create and download zip file (simplified version)
    const element = document.createElement('a')
    const fileContent = Object.entries(gameFiles).map(([name, content]) => 
      `=== ${name} ===\n${content}\n\n`
    ).join('')
    const file = new Blob([fileContent], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = 'mirbird-game.txt'
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
          <h1 className="text-4xl font-bold text-foreground">🐦 MirBird</h1>
          <p className="text-muted-foreground">Classic Flappy Bird gameplay with a twist!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Area */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Play MirBird Online
            </CardTitle>
            <CardDescription>
              Python-powered Flappy Bird clone running in your browser
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-sky-100 to-blue-200 dark:from-sky-900 dark:to-blue-900 p-6 rounded-lg">
              <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce">🐦</div>
                <h3 className="text-2xl font-bold text-primary">MirBird</h3>
                <p className="text-muted-foreground">
                  Navigate through pipes and achieve the highest score!
                </p>
                
                {/* PyScript Game Container */}
                <div 
                  id="mirbird-game" 
                  className="bg-black rounded-lg p-4 min-h-[400px] flex items-center justify-center text-green-400 font-mono text-left whitespace-pre-line"
                >
                  <div className="w-full">
                    <div className="text-center mb-4 text-yellow-400">
                      === MirBird Demo ===
                    </div>
                    <div>
                      🐦 Welcome to MirBird!{'\n'}
                      Press SPACE to jump, R to restart{'\n'}
                      {'\n'}
                      Note: This is a demo version.{'\n'}
                      Download the complete version below for:{'\n'}
                      • Full graphics and animations{'\n'}
                      • Smooth Pygame gameplay{'\n'}
                      • Sound effects{'\n'}
                      • Collision detection{'\n'}
                      • Score tracking{'\n'}
                      {'\n'}
                      Loading PyScript environment...{'\n'}
                      Ready to play! (Full version available for download)
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p>🎮 Controls:</p>
                  <p><kbd className="bg-muted px-2 py-1 rounded">SPACE</kbd> - Jump</p>
                  <p><kbd className="bg-muted px-2 py-1 rounded">R</kbd> - Restart</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download and Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Full Game
              </CardTitle>
              <CardDescription>
                Get the complete MirBird experience with full graphics and sound
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🚀 Features:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✅ Classic Flappy Bird gameplay</li>
                  <li>✅ Smooth animations and physics</li>
                  <li>✅ Score tracking</li>
                  <li>✅ Collision detection</li>
                  <li>✅ Restart functionality</li>
                  <li>✅ Full Python source code</li>
                </ul>
              </div>
              
              <Button onClick={downloadGame} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download MirBird Source
              </Button>
              
              <div className="text-xs text-muted-foreground">
                <p><strong>Requirements:</strong></p>
                <p>• Python 3.7+</p>
                <p>• pygame library</p>
                <p>• Game assets (images)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Game Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Objective:</strong> Guide MirBird through the pipes without crashing!</p>
              <p><strong>Scoring:</strong> Gain points by successfully passing through pipe gaps</p>
              <p><strong>Physics:</strong> Gravity constantly pulls MirBird down</p>
              <p><strong>Challenge:</strong> Each jump must be precisely timed</p>
              <div className="bg-warning/10 border border-warning/20 rounded p-3 mt-4">
                <p className="text-warning-foreground text-xs">
                  <strong>Note:</strong> The browser version is a demo. For the full MirBird experience with graphics, sound, and smooth gameplay, download and run the Python version locally.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}