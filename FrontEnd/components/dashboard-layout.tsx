"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  Guitar,
  Shirt,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Music,
  ChevronDown,
  BarChart3,
  UserCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  { name: "Dashboard", href: "/home", icon: LayoutDashboard, roles: ["leader", "department leader", "class leader", "trainer", "trainee", "inventory manager"] },
  { name: "Users & Roles", href: "/users", icon: Users, roles: ["leader", "class leader"] },
  { name: "Departments", href: "/departments", icon: Building2, roles: ["leader", "department leader"] },
  { name: "Classes", href: "/classes", icon: GraduationCap, roles: ["leader", "department leader", "class leader", "trainer"] },
  { name: "Instruments", href: "/instruments", icon: Guitar, roles: ["leader", "inventory manager"] },
  { name: "Clothing", href: "/clothing", icon: Shirt, roles: ["leader", "inventory manager"] },
  { name: "Training Sessions", href: "/training", icon: BookOpen, roles: ["leader", "department leader", "class leader", "trainer"] },
  { name: "Homework", href: "/homework", icon: ClipboardList, roles: ["leader", "department leader", "class leader", "trainer"] },
  { name: "Events", href: "/events", icon: Calendar, roles: ["leader", "class leader"] },
  { name: "Library", href: "/library", icon: FileText, roles: ["leader", "trainer"] },
  { name: "Performance", href: "/performance", icon: TrendingUp, roles: ["leader", "trainer"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["leader", "department leader"] },
  { name: "Profile", href: "/profile", icon: UserCircle, roles: ["leader", "department leader", "class leader", "trainer", "trainee", "inventory manager"] },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Filter navigation items based on user role
  const visibleNavItems = useMemo(() => {
    if (!user?.role?.role_name) return []
    const userRole = user.role.role_name.toLowerCase()
    return navigationItems.filter(item => item.roles.includes(userRole))
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-border bg-card">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Music className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-semibold text-foreground">Music Club</span>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${
                    isActive
                      ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Button>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">Music Club</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Button
                      key={item.name}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                      onClick={() => {
                        router.push(item.href)
                        setSidebarOpen(false)
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Button>
                  )
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/95 backdrop-blur-sm px-4 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user?.role?.role_name || "User"}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{user?.full_name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
