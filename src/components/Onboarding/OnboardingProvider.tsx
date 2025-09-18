import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SmartOnboardingTour } from './SmartOnboardingTour'

interface OnboardingContextType {
  showOnboarding: boolean
  startOnboarding: () => void
  completeOnboarding: () => void
  skipOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('d-track-onboarding-completed')
    if (!hasCompletedOnboarding) {
      // Show onboarding after a short delay to let the app load
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  const startOnboarding = () => {
    setShowOnboarding(true)
  }

  const completeOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('d-track-onboarding-completed', 'true')
  }

  const skipOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('d-track-onboarding-completed', 'true')
  }

  return (
    <OnboardingContext.Provider value={{
      showOnboarding,
      startOnboarding,
      completeOnboarding,
      skipOnboarding
    }}>
      {children}
      {showOnboarding && (
        <SmartOnboardingTour
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}