"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, Pencil, Trash2, CalendarIcon, Clock, MapPin, CheckCircle2 } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"

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

interface Class {
  id: number
  class_name: string
}

interface User {
  id: number
  full_name: string
}

interface SessionAttendance {
  id: number
  session_id: number
  trainee_id: number
  status: string
  confirmation: string
  trainee?: {
    id: number
    full_name: string
  }
  session?: TrainingSession
}

export default function TrainingPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [attendances, setAttendances] = useState<SessionAttendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null)
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    class_id: "",
    trainer_id: "",
    subject: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
  })
  const [attendanceFormData, setAttendanceFormData] = useState({
    session_id: "",
    trainee_id: "",
    status: "present",
    confirmation: "accepted",
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [sessionsRes, classesRes, usersRes, attendancesRes] = await Promise.all([
        apiClient.getTrainingSessions(),
        apiClient.getClasses(),
        apiClient.getUsers(),
        apiClient.getSessionAttendances(),
      ])

      setSessions(extractArrayFromResponse(sessionsRes))
      setClasses(extractArrayFromResponse(classesRes))
      setUsers(extractArrayFromResponse(usersRes))
      setAttendances(extractArrayFromResponse(attendancesRes))
    } catch (error) {
      console.error("[v0] Error fetching data:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load training sessions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        class_id: Number.parseInt(formData.class_id),
        trainer_id: Number.parseInt(formData.trainer_id),
      }

      if (editingSession) {
        await apiClient.updateTrainingSession(editingSession.id, data)
        toast({ title: "Success", description: "Session updated successfully" })
      } else {
        await apiClient.createTrainingSession(data)
        toast({ title: "Success", description: "Session created successfully" })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save session", variant: "destructive" })
    }
  }

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        session_id: Number.parseInt(attendanceFormData.session_id),
        trainee_id: Number.parseInt(attendanceFormData.trainee_id),
        status: attendanceFormData.status,
        confirmation: attendanceFormData.confirmation,
      }

      await apiClient.createSessionAttendance(data)
      toast({ title: "Success", description: "Attendance recorded successfully" })
      setIsAttendanceDialogOpen(false)
      setAttendanceFormData({
        session_id: "",
        trainee_id: "",
        status: "present",
        confirmation: "accepted",
      })
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to record attendance", variant: "destructive" })
    }
  }

  const handleEdit = (session: TrainingSession) => {
    setEditingSession(session)
    setFormData({
      class_id: session.class_id.toString(),
      trainer_id: session.trainer_id.toString(),
      subject: session.subject,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      location: session.location || "",
      description: session.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this session?")) return
    try {
      await apiClient.deleteTrainingSession(id)
      toast({ title: "Success", description: "Session deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete session", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setEditingSession(null)
    setFormData({
      class_id: "",
      trainer_id: "",
      subject: "",
      date: "",
      start_time: "",
      end_time: "",
      location: "",
      description: "",
    })
  }

  const getSessionAttendances = (sessionId: number) => {
    return attendances.filter((a) => a.session_id === sessionId)
  }

  const getAttendanceStats = (sessionId: number) => {
    const sessionAttendances = getSessionAttendances(sessionId)
    const present = sessionAttendances.filter((a) => a.status === "present").length
    const absent = sessionAttendances.filter((a) => a.status === "absent").length
    const late = sessionAttendances.filter((a) => a.status === "late").length
    return { present, absent, late, total: sessionAttendances.length }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Training Sessions</h1>
            <p className="text-muted-foreground mt-1">Manage training sessions and track attendance</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <CheckCircle2 className="h-4 w-4" />
                  Record Attendance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAttendanceSubmit}>
                  <DialogHeader>
                    <DialogTitle>Record Attendance</DialogTitle>
                    <DialogDescription>Mark attendance for a training session</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="attendance_session">Session</Label>
                      <Select
                        value={attendanceFormData.session_id}
                        onValueChange={(value) => setAttendanceFormData({ ...attendanceFormData, session_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a session" />
                        </SelectTrigger>
                        <SelectContent>
                          {sessions.map((session) => (
                            <SelectItem key={session.id} value={session.id.toString()}>
                              {session.subject} - {new Date(session.date).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="attendance_trainee">Trainee</Label>
                      <Select
                        value={attendanceFormData.trainee_id}
                        onValueChange={(value) => setAttendanceFormData({ ...attendanceFormData, trainee_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a trainee" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="attendance_status">Status</Label>
                      <Select
                        value={attendanceFormData.status}
                        onValueChange={(value) => setAttendanceFormData({ ...attendanceFormData, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="attendance_confirmation">Confirmation</Label>
                      <Select
                        value={attendanceFormData.confirmation}
                        onValueChange={(value) => setAttendanceFormData({ ...attendanceFormData, confirmation: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="declined">Declined</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Record Attendance</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingSession ? "Edit Training Session" : "Add New Training Session"}</DialogTitle>
                    <DialogDescription>
                      {editingSession ? "Update session information" : "Schedule a new training session"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="class_id">Class</Label>
                        <Select
                          value={formData.class_id}
                          onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id.toString()}>
                                {cls.class_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="trainer_id">Trainer</Label>
                        <Select
                          value={formData.trainer_id}
                          onValueChange={(value) => setFormData({ ...formData, trainer_id: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a trainer" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.full_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        placeholder="e.g., Advanced Violin Techniques"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Room 101"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Additional details about the session..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingSession ? "Update Session" : "Create Session"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sessions
                  .filter((s) => new Date(s.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((session) => {
                    const stats = getAttendanceStats(session.id)
                    return (
                      <Card key={session.id} className="hover:border-primary/30 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-lg">{session.subject}</CardTitle>
                              <CardDescription>
                                <div className="flex items-center gap-1 mt-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {new Date(session.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {session.start_time} - {session.end_time}
                                </div>
                                {session.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {session.location}
                                  </div>
                                )}
                              </CardDescription>
                            </div>
                            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                              <BookOpen className="h-4 w-4 text-orange-500" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="text-sm">
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span>Class: {session.class?.class_name}</span>
                                <span>Trainer: {session.trainer?.full_name}</span>
                              </div>
                            </div>
                            {stats.total > 0 && (
                              <div className="flex gap-2 text-xs">
                                <span className="px-2 py-1 rounded bg-green-500/10 text-green-500">
                                  ✓ {stats.present} Present
                                </span>
                                <span className="px-2 py-1 rounded bg-red-500/10 text-red-500">
                                  ✗ {stats.absent} Absent
                                </span>
                                <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500">
                                  ⚠ {stats.late} Late
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => handleEdit(session)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 bg-transparent"
                                onClick={() => handleDelete(session.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                {sessions.filter((s) => new Date(s.date) >= new Date()).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No upcoming sessions</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-lg">{session.subject}</CardTitle>
                    <CardDescription>
                      {new Date(session.date).toLocaleDateString()} • {session.start_time} - {session.end_time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>Class: {session.class?.class_name}</div>
                      <div>Trainer: {session.trainer?.full_name}</div>
                      {session.location && <div>Location: {session.location}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Records</CardTitle>
                <CardDescription>All recorded attendance entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendances.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No attendance records</p>
                  ) : (
                    attendances.map((attendance) => (
                      <div key={attendance.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{attendance.trainee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">Session: {attendance.session?.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              attendance.status === "present"
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : attendance.status === "late"
                                  ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                  : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}
                          >
                            {attendance.status}
                          </span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              attendance.confirmation === "accepted"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : attendance.confirmation === "declined"
                                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                  : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                            }`}
                          >
                            {attendance.confirmation}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
