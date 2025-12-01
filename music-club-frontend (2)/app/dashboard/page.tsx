"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, Guitar, Calendar, TrendingUp, BookOpen } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractCountFromResponse, extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"

interface TrainingSession {
  id: number
  title: string
  date: string
  time: string
  class?: {
    name: string
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    classes: 0,
    instruments: 0,
    sessions: 0,
    events: 0,
  })
  const [upcomingSessions, setUpcomingSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all stats but handle individual failures gracefully
        const results = await Promise.allSettled([
          apiClient.getUsers(),
          apiClient.getClasses(),
          apiClient.getInstruments(),
          apiClient.getTrainingSessions(),
          apiClient.getEvents(),
        ])

        // Extract successful results, default to 0 for failed ones
        const [usersRes, classesRes, instrumentsRes, sessionsRes, eventsRes] = results.map(
          (result) => result.status === 'fulfilled' ? result.value : { success: false, data: [] }
        )

        setStats({
          users: extractCountFromResponse(usersRes),
          classes: extractCountFromResponse(classesRes),
          instruments: extractCountFromResponse(instrumentsRes),
          sessions: extractCountFromResponse(sessionsRes),
          events: extractCountFromResponse(eventsRes),
        })

        // Get upcoming sessions if available
        if (sessionsRes.success) {
          const sessions = extractArrayFromResponse(sessionsRes)
          const today = new Date()
          const upcoming = sessions
            .filter((s: TrainingSession) => s.date && new Date(s.date) >= today)
            .sort((a: TrainingSession, b: TrainingSession) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 5)
          setUpcomingSessions(upcoming)
        }

        // Log any failures for debugging
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const error = result.reason
            console.error(`[v0] Error fetching stat ${index}:`, {
              status: error?.status,
              statusText: error?.statusText,
              body: error?.body
            })
          }
        })
      } catch (error: any) {
        console.error("[v0] Unexpected error in fetchStats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Members",
      value: stats.users,
      description: "Active users in the system",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Classes",
      value: stats.classes,
      description: "Active training classes",
      icon: GraduationCap,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Instruments",
      value: stats.instruments,
      description: "In inventory",
      icon: Guitar,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Training Sessions",
      value: stats.sessions,
      description: "Scheduled sessions",
      icon: BookOpen,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      title: "Upcoming Events",
      value: stats.events,
      description: "Planned activities",
      icon: Calendar,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your Music Club management portal</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="border-border hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Activity tracking coming soon...</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>Next scheduled training sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-shrink-0 w-12 text-center">
                        <div className="text-xs font-medium text-muted-foreground">
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          {new Date(session.date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.class?.name || 'No class'} • {session.time || 'Time TBD'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming sessions scheduled</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
