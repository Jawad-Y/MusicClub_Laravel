"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  GraduationCap,
  Shirt,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = Number(params.id)
  const [userData, setUserData] = useState<any>(null)
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([])
  const [clothingAssignments, setClothingAssignments] = useState<any[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user: currentUser, hasRole } = useAuth()

  // Determine what sections this user can see
  const canViewClasses = !hasRole('inventory manager')
  const canViewClothing = hasRole('leader') || hasRole('inventory manager') || hasRole('individual affair')
  const canViewAttendance = !hasRole('inventory manager')

  useEffect(() => {
    fetchUserData()
    if (canViewClasses) fetchEnrolledClasses()
    if (canViewClothing) fetchClothingAssignments()
    if (canViewAttendance) fetchAttendanceHistory()
  }, [userId])

  const fetchUserData = async () => {
    try {
      const response = await apiClient.getUser(userId)
      if (response.success && response.data) {
        setUserData(response.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching user:", error)
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEnrolledClasses = async () => {
    try {
      const membersResponse = await apiClient.getClassMembers()
      if (membersResponse.success && membersResponse.data) {
        const membersData = Array.isArray(membersResponse.data) ? membersResponse.data : []
        const userClasses = membersData.filter((m: any) => m.user_id === userId)

        // Fetch full class details
        const classesResponse = await apiClient.getClasses()
        if (classesResponse.success && classesResponse.data) {
          const classesData = Array.isArray(classesResponse.data) ? classesResponse.data : []
          const enrolledClassesData = userClasses.map((member: any) => ({
            ...member,
            class: classesData.find((c: any) => c.id === member.class_id),
          }))
          setEnrolledClasses(enrolledClassesData)
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching enrolled classes:", error)
      setEnrolledClasses([])
    }
  }

  const fetchClothingAssignments = async () => {
    try {
      const response = await apiClient.getClothingAssignments()
      if (response.success && response.data) {
        const assignmentsData = Array.isArray(response.data) ? response.data : []
        const userAssignments = assignmentsData.filter((a: any) => a.user_id === userId)
        setClothingAssignments(userAssignments)
      }
    } catch (error) {
      console.error("[v0] Error fetching clothing assignments:", error)
      setClothingAssignments([])
    }
  }

  const fetchAttendanceHistory = async () => {
    try {
      const response = await apiClient.getSessionAttendances()
      if (response.success && response.data) {
        const attendanceData = Array.isArray(response.data) ? response.data : []
        const userAttendance = attendanceData.filter((a: any) => a.user_id === userId)
        setAttendanceHistory(userAttendance)
      }
    } catch (error) {
      console.error("[v0] Error fetching attendance:", error)
      setAttendanceHistory([])
    }
  }

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getAttendanceBadgeClass = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "absent":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "late":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      default:
        return ""
    }
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
            <h1 className="text-3xl font-bold text-foreground">{userData?.full_name}</h1>
            <p className="text-muted-foreground mt-1">User profile and activity</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{userData?.full_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userData?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Phone className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{userData?.phone_number || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge className="mt-1">{userData?.role?.role_name || "N/A"}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={canViewClasses ? "classes" : canViewClothing ? "clothing" : "attendance"} className="space-y-4">
          <TabsList>
            {canViewClasses && <TabsTrigger value="classes">Enrolled Classes</TabsTrigger>}
            {canViewClothing && <TabsTrigger value="clothing">Clothing Assignments</TabsTrigger>}
            {canViewAttendance && <TabsTrigger value="attendance">Attendance History</TabsTrigger>}
          </TabsList>

          {canViewClasses && <TabsContent value="classes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Classes</CardTitle>
                <CardDescription>All classes this user is enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrolledClasses.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Not enrolled in any classes</p>
                  ) : (
                    enrolledClasses.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/5"
                        onClick={() => router.push(`/classes/${enrollment.class_id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <GraduationCap className="h-5 w-5 text-green-500" />
                          </div>
                          <div>
                            <p className="font-medium">{enrollment.class?.class_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {enrollment.class?.department?.department_name}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={enrollment.role === "trainer" ? "default" : "secondary"}
                          className={
                            enrollment.role === "trainer"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                          }
                        >
                          {enrollment.role}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>}

          {canViewClothing && <TabsContent value="clothing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clothing Assignments</CardTitle>
                <CardDescription>Uniforms and clothing items assigned to this user</CardDescription>
              </CardHeader>
              <CardContent>
                  {clothingAssignments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No clothing assigned</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clothingAssignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="flex items-center gap-2">
                              <Shirt className="h-4 w-4 text-muted-foreground" />
                              {assignment.item?.category || assignment.item?.id || "Item"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{assignment.item?.size || "-"}</Badge>
                            </TableCell>
                            <TableCell>{assignment.quantity ?? 1}</TableCell>
                            <TableCell>{assignment.assigned_at ? new Date(assignment.assigned_at).toLocaleDateString() : "N/A"}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  assignment.returned_at
                                    ? "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                    : "bg-green-500/10 text-green-500 border-green-500/20"
                                }
                              >
                                {assignment.returned_at ? "Returned" : "Active"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
              </CardContent>
            </Card>
          </TabsContent>}

          {canViewAttendance && <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Training session attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                {attendanceHistory.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No attendance records</p>
                ) : (
                  <div className="space-y-3">
                    {attendanceHistory.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{record.training_session?.subject || "Session"}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.training_session?.date
                                ? new Date(record.training_session.date).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getAttendanceIcon(record.status)}
                          <Badge className={getAttendanceBadgeClass(record.status)}>{record.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
