import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { HelpChat } from '@/components/HelpChat/HelpChat'

export function MainLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto bg-gradient-subtle">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
        <HelpChat />
      </div>
    </SidebarProvider>
  )
}