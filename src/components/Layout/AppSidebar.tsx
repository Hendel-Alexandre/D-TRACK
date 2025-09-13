import { 
  BarChart3, 
  CheckSquare, 
  Clock, 
  FileText, 
  FolderOpen, 
  Home, 
  Settings, 
  Users,
  Activity,
  MessageCircle
} from 'lucide-react'
import datatrackLogo from '@/assets/datatrack-logo.png'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'


const navigationItems = [
  { 
    title: 'dashboard', 
    url: '/dashboard', 
    icon: Home 
  },
  { 
    title: 'timesheets', 
    url: '/timesheets', 
    icon: Clock 
  },
  { 
    title: 'tasks', 
    url: '/tasks', 
    icon: CheckSquare 
  },
  { 
    title: 'projects', 
    url: '/projects', 
    icon: FolderOpen 
  },
  { 
    title: 'notes', 
    url: '/notes', 
    icon: FileText 
  },
  { 
    title: 'reports', 
    url: '/reports', 
    icon: BarChart3 
  },
  { 
    title: 'team', 
    url: '/team', 
    icon: Users 
  },
  { 
    title: 'messages', 
    url: '/messages', 
    icon: MessageCircle 
  },
  { 
    title: 'history', 
    url: '/history', 
    icon: Activity 
  },
  { 
    title: 'settings', 
    url: '/settings', 
    icon: Settings 
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { t } = useTranslation()
  
  const currentPath = location.pathname
  const isActive = (path: string) => currentPath === path
  const isCollapsed = state === "collapsed"
  
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-primary-foreground font-medium shadow-sm" 
      : "hover:bg-accent hover:text-accent-foreground transition-colors"

  return (
    <Sidebar
      className="border-r border-border transition-all duration-300"
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <div className="px-4 py-4 border-b border-sidebar-border">
            <img 
              src={datatrackLogo} 
              alt="DataTrack" 
              className={`transition-all duration-300 ${isCollapsed ? 'h-24 w-auto' : 'h-32 w-auto'}`}
            />
          </div>
          
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${getNavClasses({ isActive })}`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">
                          {t(item.title)}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}