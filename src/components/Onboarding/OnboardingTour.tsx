import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, X, Sparkles, Target, BarChart3, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  highlight: string
  position: 'center' | 'left' | 'right' | 'top' | 'bottom'
}

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to D-Track! 🎉',
    description: 'Your intelligent task and time management companion. Let\'s take a quick tour to get you started.',
    icon: Sparkles,
    highlight: 'Welcome to the future of productivity!',
    position: 'center'
  },
  {
    id: 'smart-tasks',
    title: 'Smart Task Creation',
    description: 'Just describe what you need to do in natural language. "Call client tomorrow at 3pm" becomes a perfectly structured task.',
    icon: Target,
    highlight: 'AI-powered task parsing',
    position: 'center'
  },
  {
    id: 'progress',
    title: 'Track Your Progress',
    description: 'Watch your productivity soar with gamified progress tracking, streaks, and achievements that keep you motivated.',
    icon: BarChart3,
    highlight: 'Gamified productivity',
    position: 'center'
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team. Share projects, assign tasks, and stay in sync with real-time updates.',
    icon: Users,
    highlight: 'Built for teams',
    position: 'center'
  }
]

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('d-track-onboarding-completed')
    if (hasSeenOnboarding) {
      setIsVisible(false)
      return
    }
  }, [])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('d-track-onboarding-completed', 'true')
    setIsVisible(false)
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('d-track-onboarding-completed', 'true')
    setIsVisible(false)
    onSkip()
  }

  if (!isVisible) return null

  const step = onboardingSteps[currentStep]
  const Icon = step.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="border-0 shadow-xl bg-gradient-card">
            <CardContent className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-primary shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="text-center mb-8">
                <motion.h2
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold mb-4"
                >
                  {step.title}
                </motion.h2>
                
                <motion.div
                  key={step.highlight}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-block mb-4"
                >
                  <Badge className="bg-gradient-primary text-white px-4 py-1 text-sm">
                    {step.highlight}
                  </Badge>
                </motion.div>

                <motion.p
                  key={step.description}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-8">
                {onboardingSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-primary w-6'
                        : index < currentStep
                        ? 'bg-primary/60'
                        : 'bg-muted'
                    }`}
                    animate={{
                      scale: index === currentStep ? 1.2 : 1
                    }}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  Skip Tour
                </Button>

                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2 button-premium"
                >
                  {currentStep === onboardingSteps.length - 1 ? (
                    'Get Started'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}