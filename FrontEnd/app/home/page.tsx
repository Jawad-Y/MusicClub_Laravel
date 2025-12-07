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

/**
 * Role-aware Dashboard for all roles.
 * - Admin / Leader: full view
 * - Department Leader: classes in their department
 * - Class Leader: classes they lead
 * - Trainer: classes / trainees / instruments / sessions assigned to them
 * - Trainee: only their class / sessions
 *
 * Defensive: supports linking trainees -> classes via user.class_id OR classMembers
 */

interface AnyObj { [k: string]: any }

interface TrainingSession {
  id: number
  class_id?: number
  trainer_id?: number
  subject?: string
  date?: string
  start_time?: string
  end_time?: string
  location?: string
  description?: string
  class?: { id: number; class_name: string; trainer_id?: number }
  trainer?: { id: number; full_name: string }
}

export default function HomePage() {
  const router = useRouter()
  const { user, isLeader, isDepartmentLeader, isTrainer } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalInstruments: 0,
    totalEvents: 0,
    totalDepartments: 0,
    upcomingSessions: 0,
  })
  const [upcomingSessions, setUpcomingSessions] = useState<TrainingSession[]>([])

  useEffect(() => {
    if (!user) return
    fetchDashboard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const safeFetch = async (fetcher: () => Promise<any>) => {
    try {
      return await fetcher()
    } catch (err) {
      // don't throw — return empty format
      console.warn("Safe fetch failed:", err)
      return { data: [] }
    }
  }

  const fetchDashboard = async () => {
    setIsLoading(true)

    try {
      // Bulk fetch (each call wrapped so one failing doesn't break the rest)
      const [
        usersRes,
        classesRes,
        instrumentsRes,
        eventsRes,
        departmentsRes,
        sessionsRes,
        classMembersRes,
      ] = await Promise.all([
        safeFetch(() => apiClient.getUsers()),
        safeFetch(() => apiClient.getClasses()),
        safeFetch(() => apiClient.getInstruments()),
        safeFetch(() => apiClient.getEvents()),
        safeFetch(() => apiClient.getDepartments()),
        safeFetch(() => apiClient.getTrainingSessions()),
        safeFetch(() => apiClient.getClassMembers()),
      ])

      const users: AnyObj[] = extractArrayFromResponse(usersRes)
      const classes: AnyObj[] = extractArrayFromResponse(classesRes)
      const instruments: AnyObj[] = extractArrayFromResponse(instrumentsRes)
      const events: AnyObj[] = extractArrayFromResponse(eventsRes)
      const departments: AnyObj[] = extractArrayFromResponse(departmentsRes)
      const sessions: AnyObj[] = extractArrayFromResponse(sessionsRes)
      const classMembers: AnyObj[] = extractArrayFromResponse(classMembersRes)

      // Build quick lookups
      const classesById = new Map<number, AnyObj>()
      classes.forEach((c: AnyObj) => { if (c && typeof c.id !== "undefined") classesById.set(Number(c.id), c) })

      // Build map userId -> classIds from classMembers (role: 'trainee' or 'trainer')
      const userClassIds = new Map<number, Set<number>>()
      classMembers.forEach((m: AnyObj) => {
        if (!m || typeof m.user_id === "undefined" || typeof m.class_id === "undefined") return
        const uid = Number(m.user_id)
        const cid = Number(m.class_id)
        if (!userClassIds.has(uid)) userClassIds.set(uid, new Set())
        userClassIds.get(uid)!.add(cid)
      })

      // Helper: get classes for a given user (from user.class_id OR from classMembers map)
      const getClassIdsForUser = (u: AnyObj) => {
        const res = new Set<number>()
        if (!u) return res
        if (typeof u.class_id !== "undefined" && u.class_id !== null) {
          res.add(Number(u.class_id))
        }
        const fromMap = userClassIds.get(Number(u.id))
        if (fromMap) {
          fromMap.forEach((id) => res.add(id))
        }
        return res
      }

      // Role lower
      const roleName = (user?.role?.role_name || "").toString().toLowerCase()

      // Start with everything then narrow according to role
      let filteredUsers = users.slice()
      let filteredClasses = classes.slice()
      let filteredInstruments = instruments.slice()
      let filteredSessions = sessions.slice()
      let filteredEvents = events.slice()
      let filteredDepartments = departments.slice()

      if (roleName === "trainer") {
        // classes where trainer_id or class.class_leader_id or class.class_leader?.id matches user.id
        const myClassIds = new Set<number>()
        classes.forEach((c: AnyObj) => {
          const trainerId =
            (c.trainer_id ?? c.class_leader_id ?? c.class_leader?.id ?? c.leader_id) // various possible fields
          if (Number(trainerId) === Number(user.id)) myClassIds.add(Number(c.id))
        })

        // also include classes where classMembers declare this user as trainer
        classMembers.forEach((m) => {
          if (m.role && String(m.role).toLowerCase() === "trainer" && Number(m.user_id) === Number(user.id)) {
            myClassIds.add(Number(m.class_id))
          }
        })

        filteredClasses = filteredClasses.filter((c) => myClassIds.has(Number(c.id)))
        // trainees: users who belong to any myClassIds via user.class_id or classMembers
        filteredUsers = filteredUsers.filter((u) => {
          const uCids = getClassIdsForUser(u)
          for (const id of uCids) if (myClassIds.has(Number(id))) return true
          return false
        })

        // instruments tied to these classes
        filteredInstruments = filteredInstruments.filter((i: AnyObj) => {
          if (typeof i.class_id !== "undefined" && i.class_id !== null) return myClassIds.has(Number(i.class_id))
          // fallback: instrument may have owner/trainer relation
          if (i.trainer_id && Number(i.trainer_id) === Number(user.id)) return true
          return false
        })

        // sessions where trainer_id matches or class_id in myClassIds
        filteredSessions = filteredSessions.filter((s: AnyObj) =>
          (s.trainer_id && Number(s.trainer_id) === Number(user.id)) || (s.class_id && myClassIds.has(Number(s.class_id)))
        )

        // Departments/events: hide (trainer typically doesn't need)
        filteredDepartments = []
      } else if (roleName === "class leader") {
        // class leader sees classes they lead
        const myClassIds = new Set<number>()
        classes.forEach((c: AnyObj) => {
          const leaderId = c.leader_id ?? c.class_leader_id ?? c.class_leader?.id
          if (Number(leaderId) === Number(user.id)) myClassIds.add(Number(c.id))
        })

        filteredClasses = filteredClasses.filter((c) => myClassIds.has(Number(c.id)))
        filteredUsers = filteredUsers.filter((u) => {
          const uCids = getClassIdsForUser(u)
          for (const id of uCids) if (myClassIds.has(Number(id))) return true
          return false
        })
        filteredInstruments = filteredInstruments.filter((i: AnyObj) => i.class_id && myClassIds.has(Number(i.class_id)))
        filteredSessions = filteredSessions.filter((s: AnyObj) => s.class_id && myClassIds.has(Number(s.class_id)))
        filteredDepartments = []
      } else if (roleName === "department leader" || isDepartmentLeader()) {
        // department leader: need department_id on user (if not available, assume full)
        const deptId = user?.department_id ?? user?.department?.id ?? null
        if (deptId !== null && typeof deptId !== "undefined") {
          filteredClasses = filteredClasses.filter((c) => Number(c.department_id) === Number(deptId))
          const classIds = new Set(filteredClasses.map((c) => Number(c.id)))
          filteredUsers = filteredUsers.filter((u) => {
            const uCids = getClassIdsForUser(u)
            for (const id of uCids) if (classIds.has(Number(id))) return true
            return false
          })
          filteredInstruments = filteredInstruments.filter((i: AnyObj) => i.class_id && classIds.has(Number(i.class_id)))
          filteredSessions = filteredSessions.filter((s: AnyObj) => s.class_id && classIds.has(Number(s.class_id)))
        } else {
          // fallback: show nothing special (or all if your backend expects)
        }
      } else if (roleName === "trainee" || user?.role_id === 4) {
        // trainee: show only themselves and their class
        const myClassIds = getClassIdsForUser(user)
        filteredUsers = filteredUsers.filter((u) => Number(u.id) === Number(user.id))
        filteredClasses = filteredClasses.filter((c) => myClassIds.has(Number(c.id)))
        filteredInstruments = filteredInstruments.filter((i: AnyObj) => i.class_id && myClassIds.has(Number(i.class_id)))
        filteredSessions = filteredSessions.filter((s: AnyObj) => s.class_id && myClassIds.has(Number(s.class_id)))
        filteredDepartments = []
      } else {
        // leader/admin etc -> see all (no filter)
      }

      // compute upcoming sessions (relative to today)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const upcoming = filteredSessions
        .filter((s: AnyObj) => {
          if (!s?.date) return false
          const d = new Date(s.date)
          d.setHours(0, 0, 0, 0)
          return d >= today
        })
        .sort((a: AnyObj, b: AnyObj) => (new Date(a.date).getTime() - new Date(b.date).getTime()))
        .slice(0, 5)

      // Prepare visible stats — hide departments for non-admin/leader and instruments for roles that shouldn't see them
      const showDepartments = isLeader() || roleName === "admin"
      const showInstruments = roleName === "trainer" || roleName === "admin" || isLeader()

      setStats({
        totalUsers: filteredUsers.length,
        totalClasses: filteredClasses.length,
        totalInstruments: showInstruments ? filteredInstruments.length : 0,
        totalEvents: filteredEvents.length,
        totalDepartments: showDepartments ? filteredDepartments.length : 0,
        upcomingSessions: upcoming.length,
      })

      // attach class/trainer objects for nicer rendering in UI where possible
      const sessionsWithMeta = upcoming.map((s: AnyObj) => {
        const c = s.class_id ? classesById.get(Number(s.class_id)) : s.class
        return {
          ...s,
          class: s.class || c,
        }
      })

      setUpcomingSessions(sessionsWithMeta)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBA"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }
  const formatTime = (time?: string) => (time ? time.substring(0, 5) : "")

  const handleSessionClick = (id: number) => router.push(`/training/${id}`)

  // Decide which cards to show for this user (trainer gets personal labels)
  const roleName = (user?.role?.role_name || "").toString().toLowerCase()
  const statCards = [
    { title: roleName === "trainer" ? "My Trainees" : "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
    { title: roleName === "trainer" ? "My Classes" : "Classes", value: stats.totalClasses, icon: GraduationCap, color: "text-green-500" },
    { title: roleName === "trainer" ? "My Instruments" : "Instruments", value: stats.totalInstruments, icon: Guitar, color: "text-orange-500" },
    { title: "Upcoming Sessions", value: stats.upcomingSessions, icon: TrendingUp, color: "text-pink-500" },
    // departments and events are optional — show only if > 0
    { title: "Departments", value: stats.totalDepartments, icon: Building2, color: "text-purple-500", hideIfZero: true },
  ].filter(card => !(card.hideIfZero && card.value === 0) && card.value > 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name || "User"}</p>
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
                {upcomingSessions.map((session: AnyObj) => (
                  <Card
                    key={session.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleSessionClick(session.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{session.subject || "Session"}</h3>
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
                            <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
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
      </div>
    </DashboardLayout>
  )
}