"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, Guitar, Calendar, TrendingUp, Building2 } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalInstruments: 0,
    totalEvents: 0,
    totalDepartments: 0,
    upcomingSessions: 0,
  })
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

      const upcomingSessions = sessions.filter((s: any) => new Date(s.date) > new Date()).length

      setStats({
        totalUsers: users.length,
        totalClasses: classes.length,
        totalInstruments: instruments.length,
        totalEvents: events.length,
        totalDepartments: departments.length,
        upcomingSessions,
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
