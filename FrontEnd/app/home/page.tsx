"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Guitar, Calendar, TrendingUp, Building2, Clock, MapPin, User } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useAuth } from "@/lib/auth-context"

interface TrainingSession {
  id: number
  class_id: number
  trainer_id: number
  subject: string
  date: string
  start_time: string
  end_time: string
  location?: string
  description?: string
  class?: {
    id: number
    class_name: string
  }
  trainer?: {
    id: number
    full_name: string
  }
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalInstruments: 0,
    totalEvents: 0,
    totalDepartments: 0,
    upcomingSessions: 0,
  })
  const [upcomingSessions, setUpcomingSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, classesRes, instrumentsRes, eventsRes, departmentsRes, sessionsRes] = await Promise.all([
        apiClient.getUsers().catch(() => ({ data: [] })),
        apiClient.getClasses().catch(() => ({ data: [] })),
        apiClient.getInstruments().catch(() => ({ data: [] })),
        apiClient.getEvents().catch(() => ({ data: [] })),
        apiClient.getDepartments().catch(() => ({ data: [] })),
        apiClient.getTrainingSessions().catch(() => ({ data: [] })),
      ])

      const users = extractArrayFromResponse(usersRes)
      const classes = extractArrayFromResponse(classesRes)
      const instruments = extractArrayFromResponse(instrumentsRes)
      const events = extractArrayFromResponse(eventsRes)
      const departments = extractArrayFromResponse(departmentsRes)
      const sessions = extractArrayFromResponse(sessionsRes)

      // Filter and sort upcoming sessions
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const upcoming = sessions
        .filter((s: any) => {
          const sessionDate = new Date(s.date)
          sessionDate.setHours(0, 0, 0, 0)
          return sessionDate >= today
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5) // Show only next 5 sessions

      setUpcomingSessions(upcoming)

      setStats({
        totalUsers: users.length,
        totalClasses: classes.length,
        totalInstruments: instruments.length,
        totalEvents: events.length,
        totalDepartments: departments.length,
        upcomingSessions: upcoming.length,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: "Departments", value: stats.totalDepartments, icon: Building2, color: "text-purple-500" },
    { title: "Classes", value: stats.totalClasses, icon: GraduationCap, color: "text-green-500" },
    { title: "Instruments", value: stats.totalInstruments, icon: Guitar, color: "text-orange-500" },
    { title: "Upcoming Sessions", value: stats.upcomingSessions, icon: TrendingUp, color: "text-pink-500" },
    { title: "Total Events", value: stats.totalEvents, icon: Calendar, color: "text-indigo-500" },
  ]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    return time.substring(0, 5) // Get HH:MM from HH:MM:SS
  }

  const handleSessionClick = (sessionId: number) => {
    router.push(`/training/${sessionId}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.full_name || "User"}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Training Sessions</CardTitle>
            <CardDescription>Next scheduled training sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading sessions...</div>
            ) : upcomingSessions.length === 0 ? (
              <p className="text-muted-foreground">No upcoming training sessions scheduled.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <Card 
                    key={session.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{session.subject}</h3>
                            {session.class?.class_name && (
                              <Badge variant="outline">{session.class.class_name}</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(session.date)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(session.start_time)} - {formatTime(session.end_time)}</span>
                            </div>
                            
                            {session.trainer?.full_name && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{session.trainer.full_name}</span>
                              </div>
                            )}
                            
                            {session.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{session.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {session.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {session.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
            <CardDescription>Music Club Management System</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage your music club operations, training sessions, inventory, and more from this centralized dashboard.
              Use the navigation menu to access different sections of the system.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
