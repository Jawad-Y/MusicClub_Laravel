"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  GraduationCap, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users
} from "lucide-react"
import { format } from "date-fns"

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
}

interface ClassMember {
  id: number
  class_id: number
  user_id: number
  role: string
  user?: {
    id: number
    full_name: string
    email: string
  }
}

export default function TrainingSessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const sessionId = Number(params.id)
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [attendances, setAttendances] = useState<SessionAttendance[]>([])
  const [classMembers, setClassMembers] = useState<ClassMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState<{[key: number]: string}>({})
  const [userConfirmation, setUserConfirmation] = useState<SessionAttendance | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSessionData()
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      const [sessionRes, attendancesRes, membersRes] = await Promise.all([
        apiClient.getTrainingSession(sessionId),
        apiClient.getSessionAttendances(),
        apiClient.getClassMembers(),
      ])

      if (sessionRes.success && sessionRes.data) {
        setSession(sessionRes.data)
        
        // Filter class members for this session's class
        const allMembers = extractArrayFromResponse(membersRes)
        const sessionMembers = allMembers.filter(
          (m: ClassMember) => m.class_id === sessionRes.data.class_id && m.role === 'trainee'
        )
        setClassMembers(sessionMembers)

        // Filter attendances for this session
        const allAttendances = extractArrayFromResponse(attendancesRes)
        const sessionAttendances = allAttendances.filter(
          (a: SessionAttendance) => a.session_id === sessionId
        )
        setAttendances(sessionAttendances)

        // Find user's confirmation if trainee
        const myConfirmation = sessionAttendances.find(
          (a: SessionAttendance) => a.trainee_id === user?.id
        )
        setUserConfirmation(myConfirmation || null)

        // Initialize attendance data
        const initialData: {[key: number]: string} = {}
        sessionMembers.forEach((member: ClassMember) => {
          const existingAttendance = sessionAttendances.find(
            (a: SessionAttendance) => a.trainee_id === member.user_id
          )
          if (existingAttendance) {
            initialData[member.user_id] = existingAttendance.status
          } else {
            // Pre-fill based on confirmation
            const hasConfirmed = sessionAttendances.some(
              (a: SessionAttendance) => 
                a.trainee_id === member.user_id && 
                a.confirmation === 'confirmed'
            )
            initialData[member.user_id] = hasConfirmed ? 'present' : 'absent'
          }
        })
        setAttendanceData(initialData)
      }
    } catch (error: any) {
      console.error("[v0] Error fetching session data:", error)
      toast({
        title: "Error",
        description: "Failed to load session details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmAttendance = async () => {
    if (!session || !user) return

    try {
      if (userConfirmation) {
        // Update existing confirmation
        await apiClient.updateSessionAttendance(userConfirmation.id, {
          confirmation: 'confirmed',
          status: 'pending'
        })
      } else {
        // Create new confirmation
        await apiClient.createSessionAttendance({
          session_id: sessionId,
          trainee_id: user.id,
          status: 'pending',
          confirmation: 'confirmed'
        })
      }
      
      toast({
        title: "Success",
        description: "You have confirmed your attendance",
      })
      fetchSessionData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm attendance",
        variant: "destructive",
      })
    }
  }

  const handleSubmitAttendance = async () => {
    if (!session) return

    try {
      // Submit or update attendance for each trainee
      for (const member of classMembers) {
        const status = attendanceData[member.user_id] || 'absent'
        const existingAttendance = attendances.find(a => a.trainee_id === member.user_id)

        if (existingAttendance) {
          await apiClient.updateSessionAttendance(existingAttendance.id, {
            status,
            confirmation: 'accepted'
          })
        } else {
          await apiClient.createSessionAttendance({
            session_id: sessionId,
            trainee_id: member.user_id,
            status,
            confirmation: 'accepted'
          })
        }
      }

      toast({
        title: "Success",
        description: "Attendance recorded successfully",
      })
      fetchSessionData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance",
        variant: "destructive",
      })
    }
  }

  const handleAttendanceChange = (userId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [userId]: status
    }))
  }

  // Parse a date-only string (YYYY-MM-DD) into a local Date, return null if invalid
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

  // Parse a time string (HH:mm or HH:mm:ss) and combine with a Date to get a DateTime
  const combineDateAndTime = (date: Date | null, time?: string | null): Date | null => {
    if (!date) return null
    if (!time || typeof time !== 'string') return date
    const parts = time.split(':').map(Number)
    if (parts.length >= 2 && !parts.some(p => Number.isNaN(p))) {
      const [h, m, s] = parts
      const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m || 0, s || 0)
      return dt
    }
    // fallback: try parsing full datetime
    const dt = new Date(`${date.toISOString().split('T')[0]}T${time}`)
    return Number.isNaN(dt.getTime()) ? date : dt
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading session details...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-muted-foreground">Session not found</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    )
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sessionDate = parseDateOnly(session?.date ?? null)
  const sessionStartDateTime = combineDateAndTime(sessionDate, session?.start_time ?? null)
  const now = new Date()

  const isSessionPast = sessionDate ? sessionDate < today : false
  const isSessionFuture = sessionDate ? sessionDate > today : false
  // Allow taking attendance when the session's start datetime has passed (or if session date is before today)
  const canTakeAttendance = sessionStartDateTime ? now >= sessionStartDateTime : (sessionDate ? sessionDate <= today : false)
  
  // Check if attendance is completed
  const attendanceCompleted = classMembers.length > 0 && 
    classMembers.every(member => 
      attendances.some(a => a.trainee_id === member.user_id && a.confirmation === 'accepted')
    )

  // Role checks
  const isTrainee = user?.role?.role_name?.toLowerCase() === 'trainee'
  const isTrainer = session.trainer_id === user?.id
  const isLeader = user?.role?.role_name?.toLowerCase() === 'leader'
  const isClassLeader = user?.role?.role_name?.toLowerCase() === 'class leader'
  const isDeptLeader = user?.role?.role_name?.toLowerCase() === 'department leader'
  const canManageAttendance = isTrainer || isLeader || isClassLeader || isDeptLeader

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{session.subject}</h1>
            <p className="text-muted-foreground mt-1">Training Session Details</p>
          </div>
          
          {/* Status Badge */}
          {canTakeAttendance && attendanceCompleted && (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Attendance Completed
            </Badge>
          )}
          {canTakeAttendance && !attendanceCompleted && canManageAttendance && (
            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Attendance Must Be Taken
            </Badge>
          )}
          {!canTakeAttendance && (
            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              <Clock className="h-3 w-3 mr-1" />
              Upcoming
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Details about this training session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {sessionDate ? format(sessionDate, 'MMMM dd, yyyy') : (session.date || 'N/A')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {session.start_time} - {session.end_time}
                    </p>
                  </div>
                </div>

                {session.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Trainer</p>
                    <p className="text-sm text-muted-foreground">
                      {session.trainer?.full_name || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Class</p>
                    <p className="text-sm text-muted-foreground">
                      {session.class?.class_name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {session.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground">{session.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendance Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Students</span>
                  <span className="text-lg font-bold">{classMembers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Present</span>
                  <span className="text-lg font-bold text-green-600">
                    {attendances.filter(a => a.status === 'present').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Absent</span>
                  <span className="text-lg font-bold text-red-600">
                    {attendances.filter(a => a.status === 'absent').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-600">Late</span>
                  <span className="text-lg font-bold text-orange-600">
                    {attendances.filter(a => a.status === 'late').length}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-blue-600">Confirmed</span>
                  <span className="text-lg font-bold text-blue-600">
                    {attendances.filter(a => a.confirmation === 'confirmed').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainee Confirmation Section */}
        {isTrainee && !canTakeAttendance && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Your Attendance</CardTitle>
              <CardDescription>
                Please confirm if you plan to attend this session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userConfirmation?.confirmation === 'confirmed' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>You have confirmed your attendance</span>
                </div>
              ) : (
                <Button onClick={handleConfirmAttendance} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Attendance
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Attendance Management Section */}
        {canManageAttendance && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>
                {canTakeAttendance 
                  ? "Mark attendance for each trainee" 
                  : "Attendance can only be taken on or after the session date"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canTakeAttendance ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Attendance will be available on {sessionDate ? format(sessionDate, 'MMMM dd, yyyy') : (session.date || 'N/A')}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {classMembers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No students enrolled in this class
                      </p>
                    ) : (
                      classMembers.map((member) => {
                        const hasConfirmed = attendances.some(
                          a => a.trainee_id === member.user_id && a.confirmation === 'confirmed'
                        )
                        return (
                          <div 
                            key={member.user_id} 
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{member.user?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                              </div>
                              {hasConfirmed && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  Confirmed
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`attendance-${member.user_id}`}
                                  value="present"
                                  checked={attendanceData[member.user_id] === 'present'}
                                  onChange={() => handleAttendanceChange(member.user_id, 'present')}
                                  className="cursor-pointer"
                                />
                                <span className="text-sm text-green-600">Present</span>
                              </Label>
                              <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`attendance-${member.user_id}`}
                                  value="late"
                                  checked={attendanceData[member.user_id] === 'late'}
                                  onChange={() => handleAttendanceChange(member.user_id, 'late')}
                                  className="cursor-pointer"
                                />
                                <span className="text-sm text-orange-600">Late</span>
                              </Label>
                              <Label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name={`attendance-${member.user_id}`}
                                  value="absent"
                                  checked={attendanceData[member.user_id] === 'absent'}
                                  onChange={() => handleAttendanceChange(member.user_id, 'absent')}
                                  className="cursor-pointer"
                                />
                                <span className="text-sm text-red-600">Absent</span>
                              </Label>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {classMembers.length > 0 && (
                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={handleSubmitAttendance} className="gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {attendanceCompleted ? 'Update Attendance' : 'Submit Attendance'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* View-only attendance for trainees */}
        {isTrainee && canTakeAttendance && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Record</CardTitle>
              <CardDescription>Your attendance status for this session</CardDescription>
            </CardHeader>
            <CardContent>
              {userConfirmation ? (
                <div className="flex items-center gap-3">
                  {userConfirmation.status === 'present' && (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-medium">Present</span>
                    </>
                  )}
                  {userConfirmation.status === 'absent' && (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-medium">Absent</span>
                    </>
                  )}
                  {userConfirmation.status === 'late' && (
                    <>
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-orange-600 font-medium">Late</span>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Attendance not yet recorded</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
