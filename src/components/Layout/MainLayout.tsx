import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { HelpChat } from '@/components/HelpChat/HelpChat'

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
        <HelpChat />
      </div>
    </SidebarProvider>
  )
}