"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, User, Clock, MapPin, Upload, FileText, Trash2, Plus, UserPlus, CheckCircle2, XCircle } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Checkbox } from "@/components/ui/checkbox"

export default function ClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const classId = Number(params.id)
  const [classData, setClassData] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [trainingSessions, setTrainingSessions] = useState<any[]>([])
  const [libraryMaterials, setLibraryMaterials] = useState<any[]>([])
  const [homework, setHomework] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false)
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false)
  const [isHomeworkDialogOpen, setIsHomeworkDialogOpen] = useState(false)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [attendance, setAttendance] = useState<{[key: number]: boolean}>({})
  const [libraryFormData, setLibraryFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    material_type: "pdf",
    instrument_type_id: "",
  })
  const [sessionFormData, setSessionFormData] = useState({
    session_name: "",
    description: "",
    session_date: "",
    start_time: "",
    end_time: "",
    location: "",
    trainer_id: user?.id ? user.id.toString() : "",
  })
  const [homeworkFormData, setHomeworkFormData] = useState({
    title: "",
    description: "",
    due_date: "",
    session_id: "",
    assign_scope: "class",
  })
  const [addUserFormData, setAddUserFormData] = useState({
    user_id: "",
    role: "trainee",
  })
  const { toast } = useToast()

  // Helper: parse a date-only string (YYYY-MM-DD) into local Date, return null if invalid
  const parseDateOnly = (d?: string | null): Date | null => {
    if (!d || typeof d !== 'string') return null
    const parts = d.split('-')
    if (parts.length === 3) {
      const [y, m, day] = parts.map(Number)
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(day)) {
        return new Date(y, m - 1, day)
      }
    }
    const dt = new Date(d)
    if (Number.isNaN(dt.getTime())) return null
    // Normalize to local date (midnight) to avoid timezone shift issues
    return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
  }

  const formatYMD = (d?: string | null) => {
    const dt = parseDateOnly(d)
    if (!dt) return d || 'TBA'
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Check if current user is enrolled in this class
  const isEnrolled = members.some((m) => m.user_id === user?.id)
  const isTrainer = members.some((m) => m.user_id === user?.id && m.role === "trainer")
  const isLeader = user?.role?.role_name?.toLowerCase() === "leader"
  const isDeptLeader = user?.role?.role_name?.toLowerCase() === "department leader"
  const isClassLeader = user?.role?.role_name?.toLowerCase() === "class leader"
  const canManage = isLeader || isDeptLeader || isClassLeader || isTrainer
  const canAccess = canManage || isEnrolled

  useEffect(() => {
    fetchClassData()
    fetchMembers()
    fetchTrainingSessions()
    fetchLibraryMaterials()
    fetchHomework()
    fetchUsers()
  }, [classId])

  const fetchClassData = async () => {
    try {
      const response = await apiClient.getClass(classId)
      if (response.success && response.data) {
        setClassData(response.data)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching class:", {
        status: error?.status,
        statusText: error?.statusText,
        body: error?.body,
        error
      })
      toast({
        title: "Error",
        description: `Failed to load class: ${error?.status || 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await apiClient.getClassMembers()
      if (response.success) {
        const allMembers = extractArrayFromResponse(response)
        const classMembers = allMembers.filter((m: any) => m.class_id === classId)
        setMembers(classMembers)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching members:", {
        status: error?.status,
        statusText: error?.statusText,
        body: error?.body
      })
    }
  }

  const fetchTrainingSessions = async () => {
    try {
      const response = await apiClient.getTrainingSessions()
      if (response.success) {
        const allSessions = extractArrayFromResponse(response)
        const classSessions = allSessions.filter((s: any) => s.class_id === classId)
        setTrainingSessions(classSessions)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching training sessions:", error)
    }
  }

  const fetchLibraryMaterials = async () => {
    try {
      const response = await apiClient.getLibraryMaterials()
      if (response.success) {
        const allMaterials = extractArrayFromResponse(response)
        const classMaterials = allMaterials.filter((m: any) => m.class_id === classId)
        setLibraryMaterials(classMaterials)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching library materials:", {
        status: error?.status,
        statusText: error?.statusText,
        body: error?.body,
      })
    }
  }

  const fetchHomework = async () => {
    try {
      // use the collection endpoint and filter by class_id
      const response = await apiClient.getHomeworks()
      if (response.success) {
        const allHomework = extractArrayFromResponse(response)

        // Attempt multiple strategies to determine homework's class:
        // 1. Direct `class_id` on homework record
        // 2. `session_id` that refers to a session in `trainingSessions`
        // 3. Related `training_session` object with nested `class` or `class_id`

        const classHomework = allHomework.filter((h: any) => {
          // direct class_id
          if (typeof h.class_id !== 'undefined' && h.class_id === classId) return true

          // session_id -> lookup trainingSessions
          if (typeof h.session_id !== 'undefined' && trainingSessions.some((s: any) => s.id === Number(h.session_id) && s.class_id === classId)) return true

          // related object (try several possible shapes)
          const rel = h.training_session || h.trainingSession || h.session || null
          if (rel) {
            if (typeof rel.class_id !== 'undefined' && rel.class_id === classId) return true
            if (rel.class && (rel.class.id === classId || rel.class.class_id === classId)) return true
          }

          return false
        })

        setHomework(classHomework)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching homework:", {
        status: error?.status,
        statusText: error?.statusText,
        body: error?.body
      })
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers()
      if (response.success) {
        setUsers(extractArrayFromResponse(response))
      }
    } catch (error) {
      console.error("[v0] Error fetching users:", error)
    }
  }

  const handleLibrarySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createLibraryMaterial({
        ...libraryFormData,
        instrument_type_id: libraryFormData.instrument_type_id ? Number(libraryFormData.instrument_type_id) : null,
      })
      toast({
        title: "Success",
        description: "Library material added successfully",
      })
      setIsLibraryDialogOpen(false)
      setLibraryFormData({
        title: "",
        description: "",
        file_url: "",
        material_type: "pdf",
        instrument_type_id: "",
      })
      fetchLibraryMaterials()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add library material",
        variant: "destructive",
      })
    }
  }

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Map frontend names to backend expected fields
      await apiClient.createTrainingSession({
        subject: sessionFormData.session_name,
        description: sessionFormData.description,
        date: sessionFormData.session_date,
        start_time: sessionFormData.start_time,
        end_time: sessionFormData.end_time,
        location: sessionFormData.location,
        class_id: classId,
        trainer_id: Number(sessionFormData.trainer_id),
      })
      toast({
        title: "Success",
        description: "Training session created successfully",
      })
      setIsSessionDialogOpen(false)
      setSessionFormData({
        session_name: "",
        description: "",
        session_date: "",
        start_time: "",
        end_time: "",
        location: "",
        trainer_id: "",
      })
      fetchTrainingSessions()
    } catch (error: any) {
      console.error("Session creation error:", error)
      toast({
        title: "Error",
        description: error?.body?.message || error.message || "Failed to create session",
        variant: "destructive",
      })
    }
  }

  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        session_id: homeworkFormData.session_id ? Number(homeworkFormData.session_id) : null,
        assign_scope: homeworkFormData.assign_scope,
        title: homeworkFormData.title,
        description: homeworkFormData.description,
        due_date: homeworkFormData.due_date || null,
        class_id: classId,
      }

      await apiClient.createHomework(payload)
      toast({
        title: "Success",
        description: "Homework created successfully",
      })
      setIsHomeworkDialogOpen(false)
      setHomeworkFormData({
        title: "",
        description: "",
        due_date: "",
        session_id: "",
        assign_scope: "class",
      })
      fetchHomework()
    } catch (error: any) {
      console.error("Homework creation error:", error)
      let message = "Failed to create homework"
      if (error) {
        if (typeof error === "string") message = error
        else if (error.body && typeof error.body === "object" && error.body.message) message = error.body.message
        else if (error.body && typeof error.body === "string") message = error.body
        else if (error.message) message = error.message
        else if (error.status) message = `Request failed (${error.status} ${error.statusText || ""})`
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createClassMember({
        class_id: classId,
        user_id: Number(addUserFormData.user_id),
        role: addUserFormData.role,
      })
      toast({
        title: "Success",
        description: "User added to class successfully",
      })
      setIsAddUserDialogOpen(false)
      setAddUserFormData({
        user_id: "",
        role: "trainee",
      })
      fetchMembers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add user",
        variant: "destructive",
      })
    }
  }

  const handleOpenAttendance = (session: any) => {
    setSelectedSession(session)
    // Initialize attendance state
    const initialAttendance: {[key: number]: boolean} = {}
    members.forEach(member => {
      initialAttendance[member.user_id] = false
    })
    setAttendance(initialAttendance)
    setIsAttendanceDialogOpen(true)
  }

  const handleSubmitAttendance = async () => {
    if (!selectedSession) return
    
    try {
      // Submit attendance for each member
      const attendancePromises = Object.entries(attendance).map(([userId, present]) => 
        // backend expects `session_id` and `trainee_id`
        apiClient.createSessionAttendance({
          session_id: selectedSession.id,
          trainee_id: Number(userId),
          status: present ? "present" : "absent",
        })
      )
      await Promise.all(attendancePromises)
      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      })
      setIsAttendanceDialogOpen(false)
      setSelectedSession(null)
      setAttendance({})
    } catch (error: any) {
      console.error("Attendance error:", error)
      toast({
        title: "Error",
        description: error?.body?.message || error.message || "Failed to record attendance",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (id: number) => {
    if (!confirm("Are you sure you want to remove this member from the class?")) return
    try {
      await apiClient.deleteClassMember(id)
      toast({ title: "Success", description: "Member removed successfully" })
      fetchMembers()
    } catch (error: any) {
      console.error("Remove member error:", error)
      toast({ title: "Error", description: error?.body?.message || error.message || "Failed to remove member", variant: "destructive" })
    }
  }

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return
    try {
      await apiClient.deleteLibraryMaterial(id)
      toast({
        title: "Success",
        description: "Material deleted successfully",
      })
      fetchLibraryMaterials()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      })
    }
  }

  // Role-based access control
  if (!isLoading && !canAccess && user?.role?.role_name === "trainee") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You are not enrolled in this class</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/classes")}>Back to Classes</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{classData?.class_name}</h1>
            <p className="text-muted-foreground mt-1">Complete class details and management</p>
          </div>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Class Info</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="sessions">Training Sessions</TabsTrigger>
            <TabsTrigger value="homework">Homework</TabsTrigger>
            <TabsTrigger value="library">Class Library</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Class Name</Label>
                    <p className="text-lg font-medium mt-1">{classData?.class_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p className="text-lg font-medium mt-1">{classData?.department?.department_name || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Class Leader</Label>
                    <p className="text-lg font-medium mt-1">{classData?.class_leader?.full_name || "Not assigned"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Members</Label>
                    <p className="text-lg font-medium mt-1">{members.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Class Members</CardTitle>
                  <CardDescription>Students and trainers in this class</CardDescription>
                </div>
                {canManage && (
                  <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <form onSubmit={handleAddUser}>
                        <DialogHeader>
                          <DialogTitle>Add User to Class</DialogTitle>
                          <DialogDescription>Assign a user as trainer or trainee</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="user_id">User</Label>
                            <Select
                              value={addUserFormData.user_id}
                              onValueChange={(value) => setAddUserFormData({ ...addUserFormData, user_id: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.filter(u => !members.some(m => m.user_id === u.id)).map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.full_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                              value={addUserFormData.role}
                              onValueChange={(value) => setAddUserFormData({ ...addUserFormData, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="trainer">Trainer</SelectItem>
                                <SelectItem value="trainee">Trainee</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Add User</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No members enrolled</p>
                  ) : (
                    members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/5 cursor-pointer"
                        onClick={() => router.push(`/users/${member.user_id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.user?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={member.role === "trainer" ? "default" : "secondary"}
                            className={
                              member.role === "trainer"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                            }
                          >
                            {member.role}
                          </Badge>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveMember(member.id)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Training Sessions</CardTitle>
                  <CardDescription>Upcoming and past training sessions</CardDescription>
                </div>
                {canManage && (
                  <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Session
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <form onSubmit={handleSessionSubmit}>
                        <DialogHeader>
                          <DialogTitle>Create Training Session</DialogTitle>
                          <DialogDescription>Schedule a new training session for this class</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="session_name">Session Name</Label>
                            <Input
                              id="session_name"
                              value={sessionFormData.session_name}
                              onChange={(e) => setSessionFormData({ ...sessionFormData, session_name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="trainer_id">Trainer</Label>
                            <Select
                              value={sessionFormData.trainer_id}
                              onValueChange={(value) => setSessionFormData({ ...sessionFormData, trainer_id: value })}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a trainer" />
                              </SelectTrigger>
                              <SelectContent>
                                {members
                                  .filter((m) => m.role === "trainer")
                                  .map((m) => (
                                    <SelectItem key={m.user_id} value={m.user_id.toString()}>
                                      {m.user?.full_name}
                                    </SelectItem>
                                  ))}
                                {members
                                  .filter((m) => m.role !== "trainer")
                                  .map((m) => (
                                    <SelectItem key={`alt-${m.user_id}`} value={m.user_id.toString()}>
                                      {m.user?.full_name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="session_description">Description</Label>
                            <Textarea
                              id="session_description"
                              value={sessionFormData.description}
                              onChange={(e) => setSessionFormData({ ...sessionFormData, description: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="session_date">Date</Label>
                              <Input
                                id="session_date"
                                type="date"
                                value={sessionFormData.session_date}
                                onChange={(e) => setSessionFormData({ ...sessionFormData, session_date: e.target.value })}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                value={sessionFormData.location}
                                onChange={(e) => setSessionFormData({ ...sessionFormData, location: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="start_time">Start Time</Label>
                              <Input
                                id="start_time"
                                type="time"
                                value={sessionFormData.start_time}
                                onChange={(e) => setSessionFormData({ ...sessionFormData, start_time: e.target.value })}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="end_time">End Time</Label>
                              <Input
                                id="end_time"
                                type="time"
                                value={sessionFormData.end_time}
                                onChange={(e) => setSessionFormData({ ...sessionFormData, end_time: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Create Session</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Upcoming Sessions */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Upcoming Sessions
                    </h3>
                    {trainingSessions.filter(s => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const sessionDate = parseDateOnly(s.date)
                      return sessionDate ? sessionDate >= today : false
                    }).length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No upcoming sessions</p>
                    ) : (
                      <div className="space-y-3">
                        {trainingSessions
                          .filter(s => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const sessionDate = parseDateOnly(s.date)
                            return sessionDate ? sessionDate >= today : false
                          })
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((session) => (
                            <div 
                              key={session.id} 
                              className="p-4 border rounded-lg space-y-2 hover:border-primary/50 transition-colors cursor-pointer"
                              onClick={() => router.push(`/training/${session.id}`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{session.subject}</h4>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{session.description}</p>
                                </div>
                                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                  Upcoming
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {session.date ? new Date(session.date).toLocaleDateString() : "N/A"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {session.start_time} - {session.end_time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.location || "TBA"}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* All Sessions */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      All Sessions
                    </h3>
                    {trainingSessions.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No sessions scheduled</p>
                    ) : (
                      <div className="space-y-3">
                        {trainingSessions
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((session) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const sessionDate = parseDateOnly(session.date)
                            const isPast = sessionDate ? sessionDate < today : false
                            return (
                              <div 
                                key={session.id} 
                                className="p-4 border rounded-lg space-y-2 hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/training/${session.id}`)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold">{session.subject}</h4>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{session.description}</p>
                                  </div>
                                  <Badge className={isPast ? "bg-gray-500/10 text-gray-500 border-gray-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}>
                                    {isPast ? "Past" : "Upcoming"}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {session.date ? new Date(session.date).toLocaleDateString() : "N/A"}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {session.start_time} - {session.end_time}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {session.location || "TBA"}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Homework Assignments</CardTitle>
                  <CardDescription>Assignments for this class</CardDescription>
                </div>
                {canManage && (
                  <Dialog open={isHomeworkDialogOpen} onOpenChange={setIsHomeworkDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Homework
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <form onSubmit={handleHomeworkSubmit}>
                        <DialogHeader>
                          <DialogTitle>Create Homework</DialogTitle>
                          <DialogDescription>Assign homework to this class</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="homework_title">Title</Label>
                            <Input
                              id="homework_title"
                              value={homeworkFormData.title}
                              onChange={(e) => setHomeworkFormData({ ...homeworkFormData, title: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="homework_description">Description</Label>
                            <Textarea
                              id="homework_description"
                              value={homeworkFormData.description}
                              onChange={(e) => setHomeworkFormData({ ...homeworkFormData, description: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="session_id">Session</Label>
                              <Select
                                value={homeworkFormData.session_id}
                                onValueChange={(value) => setHomeworkFormData({ ...homeworkFormData, session_id: value })}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a session" />
                                </SelectTrigger>
                                <SelectContent>
                                  {trainingSessions.map((session) => (
                                    <SelectItem key={session.id} value={session.id.toString()}>
                                      {session.subject} - {formatYMD(session.date)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="assign_scope">Assignment Scope</Label>
                              <Select
                                value={homeworkFormData.assign_scope}
                                onValueChange={(value) => setHomeworkFormData({ ...homeworkFormData, assign_scope: value })}
                                required
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="class">Entire Class</SelectItem>
                                  <SelectItem value="trainee">Individual Trainee</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                              <Label htmlFor="due_date">Due Date</Label>
                              <Input
                                id="due_date"
                                type="date"
                                value={homeworkFormData.due_date}
                                onChange={(e) => setHomeworkFormData({ ...homeworkFormData, due_date: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Create Homework</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {homework.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No homework assigned</p>
                  ) : (
                    homework.map((hw) => (
                      <div key={hw.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{hw.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{hw.description}</p>
                          </div>
                          <Badge variant={(parseDateOnly(hw.due_date) ?? new Date(0)) > new Date() ? "default" : "destructive"}>
                            {(parseDateOnly(hw.due_date) ?? new Date(0)) > new Date() ? "Pending" : "Overdue"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Due: {formatYMD(hw.due_date)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Class Library</CardTitle>
                  <CardDescription>Educational materials and resources</CardDescription>
                </div>
                {canManage && (
                  <Dialog open={isLibraryDialogOpen} onOpenChange={setIsLibraryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Add Material
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <form onSubmit={handleLibrarySubmit}>
                        <DialogHeader>
                          <DialogTitle>Add Library Material</DialogTitle>
                          <DialogDescription>Upload new learning resource for this class</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={libraryFormData.title}
                              onChange={(e) => setLibraryFormData({ ...libraryFormData, title: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={libraryFormData.description}
                              onChange={(e) => setLibraryFormData({ ...libraryFormData, description: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="file_url">File URL</Label>
                            <Input
                              id="file_url"
                              value={libraryFormData.file_url}
                              onChange={(e) => setLibraryFormData({ ...libraryFormData, file_url: e.target.value })}
                              placeholder="https://example.com/file.pdf"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="material_type">Type</Label>
                            <Select
                              value={libraryFormData.material_type}
                              onValueChange={(value) =>
                                setLibraryFormData({ ...libraryFormData, material_type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                                <SelectItem value="sheet_music">Sheet Music</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Add Material</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {libraryMaterials.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No materials available</p>
                  ) : (
                    libraryMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <FileText className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{material.title}</p>
                            <p className="text-sm text-muted-foreground">{material.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {material.material_type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Attendance Dialog */}
        <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Take Attendance</DialogTitle>
              <DialogDescription>
                {selectedSession?.subject} - {selectedSession?.date && new Date(selectedSession.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto py-4">
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{member.user?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={attendance[member.user_id] || false}
                        onCheckedChange={(checked) => 
                          setAttendance({...attendance, [member.user_id]: checked === true})
                        }
                      />
                      {attendance[member.user_id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAttendanceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmitAttendance}>Submit Attendance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
