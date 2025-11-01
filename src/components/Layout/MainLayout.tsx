import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { LumenAssistant } from '@/components/AI/LumenAssistant'
import { OnboardingProvider } from '@/components/Onboarding/OnboardingProvider'
import { OnboardingRedirect } from '@/components/Dashboard/OnboardingRedirect'

export function MainLayout() {
  return (
    <OnboardingProvider>
      <OnboardingRedirect>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-subtle">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <main className="flex-1 overflow-auto bg-gradient-subtle">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 max-w-full sm:max-w-7xl">
                  <Outlet />
                </div>
              </main>
            </div>
            <LumenAssistant />
        </div>
      </SidebarProvider>
      </OnboardingRedirect>
    </OnboardingProvider>
  )
}