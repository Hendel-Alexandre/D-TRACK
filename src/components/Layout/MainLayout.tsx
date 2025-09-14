import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { HelpChat } from '@/components/HelpChat/HelpChat'
import NoteNotificationPopup from '@/components/notifications/NoteNotificationPopup'
import { useNoteNotifications } from '@/hooks/useNoteNotifications'

export function MainLayout() {
  const { notification, isPopupOpen, closePopup, onNotificationHandled } = useNoteNotifications()

  return (
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
        <HelpChat />
        
        <NoteNotificationPopup
          notification={notification}
          open={isPopupOpen}
          onClose={closePopup}
          onHandled={onNotificationHandled}
        />
      </div>
    </SidebarProvider>
  )
}