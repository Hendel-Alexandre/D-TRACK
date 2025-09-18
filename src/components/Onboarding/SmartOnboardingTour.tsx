import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, X, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  icon: React.ReactNode
  action?: string
}

interface SmartOnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to D-TRACK!',
    description: 'Let\'s take a quick tour to get you started with managing your tasks, projects, and time effectively.',
    target: '',
    position: 'bottom',
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    id: 'create-project',
    title: 'Create Your First Project',
    description: 'Start by creating a project to organize your tasks. Click here to get started.',
    target: '[data-tour="create-project"]',
    position: 'bottom',
    icon: <CheckCircle className="h-5 w-5" />,
    action: 'Click to create project'
  },
  {
    id: 'add-task',
    title: 'Add Tasks',
    description: 'Add tasks to your projects and track their progress through different stages.',
    target: '[data-tour="add-task"]',
    position: 'bottom',
    icon: <CheckCircle className="h-5 w-5" />,
    action: 'Click to add task'
  },
  {
    id: 'track-time',
    title: 'Track Your Time',
    description: 'Log your work hours and monitor how much time you spend on different activities.',
    target: '[data-tour="track-time"]',
    position: 'bottom',
    icon: <CheckCircle className="h-5 w-5" />,
    action: 'Start time tracking'
  },
  {
    id: 'darvis-assistant',
    title: 'Meet Darvis - Your AI Assistant',
    description: 'Use Darvis to create tasks with natural language. Try saying "Create a task to review emails tomorrow at 2 PM".',
    target: '[data-tour="darvis"]',
    position: 'left',
    icon: <Sparkles className="h-5 w-5" />,
    action: 'Try Darvis now'
  },
  {
    id: 'dashboard',
    title: 'Monitor Your Progress',
    description: 'Check your dashboard to see overdue tasks, upcoming deadlines, and track your productivity.',
    target: '[data-tour="dashboard"]',
    position: 'bottom',
    icon: <CheckCircle className="h-5 w-5" />,
    action: 'View dashboard'
  }
]

export function SmartOnboardingTour({ onComplete, onSkip }: SmartOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    // Check if user has already completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('d-track-onboarding-completed')
    if (hasCompletedOnboarding) {
      return
    }

    // Show onboarding after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
      updateTargetPosition()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isVisible) {
      updateTargetPosition()
    }
  }, [currentStep, isVisible])

  const updateTargetPosition = () => {
    const step = onboardingSteps[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        })
      }
    }
  }

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

  const currentStepData = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Backdrop with spotlight effect */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
          {currentStepData.target && (
            <div
              className="absolute border-4 border-primary rounded-lg shadow-2xl shadow-primary/30 animate-pulse"
              style={{
                top: targetPosition.top - 8,
                left: targetPosition.left - 8,
                width: targetPosition.width + 16,
                height: targetPosition.height + 16,
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 30px hsl(var(--primary))`
              }}
            />
          )}
        </div>

        {/* Tour Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute pointer-events-auto"
          style={{
            top: currentStep === 0 
              ? '50%' 
              : currentStepData.position === 'bottom' 
                ? targetPosition.top + targetPosition.height + 20
                : currentStepData.position === 'top'
                  ? targetPosition.top - 280
                  : currentStepData.position === 'left'
                    ? targetPosition.top
                    : targetPosition.top,
            left: currentStep === 0 
              ? '50%' 
              : currentStepData.position === 'left'
                ? targetPosition.left - 320
                : currentStepData.position === 'right'
                  ? targetPosition.left + targetPosition.width + 20
                  : targetPosition.left,
            transform: currentStep === 0 ? 'translate(-50%, -50%)' : 'none',
            maxWidth: '320px',
            width: '100%'
          }}
        >
          <Card className="bg-card/95 backdrop-blur border-primary/20 shadow-2xl">
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {currentStepData.icon}
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs mb-1">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <motion.div
                  className="bg-gradient-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStepData.description}
                </p>
                {currentStepData.action && (
                  <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs text-primary font-medium">
                      💡 {currentStepData.action}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="h-8"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="h-8 text-muted-foreground"
                  >
                    Skip Tour
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="h-8 bg-gradient-primary hover:opacity-90"
                  >
                    {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}