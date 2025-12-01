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
import { ArrowLeft, Calendar, User, Clock, MapPin, Upload, FileText, Trash2 } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

export default function ClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const classId = Number(params.id)
  const [classData, setClassData] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [trainingSessions, setTrainingSessions] = useState<any[]>([])
  const [libraryMaterials, setLibraryMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLibraryDialogOpen, setIsLibraryDialogOpen] = useState(false)
  const [libraryFormData, setLibraryFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    material_type: "pdf",
    instrument_type_id: "",
  })
  const { toast } = useToast()

  // Check if current user is enrolled in this class
  const isEnrolled = members.some((m) => m.user_id === user?.id)
  const isTrainer = members.some((m) => m.user_id === user?.id && m.role === "trainer")
  const isAdmin = user?.role?.role_name === "admin"
  const canAccess = isAdmin || isEnrolled

  useEffect(() => {
    fetchClassData()
    fetchMembers()
    fetchTrainingSessions()
    fetchLibraryMaterials()
  }, [classId])

  const fetchClassData = async () => {
    try {
      const response = await apiClient.getClass(classId)
      if (response.success && response.data) {
        setClassData(response.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching class:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await apiClient.getClassMembers()
      if (response.success && response.data) {
        const classMembers = response.data.filter((m: any) => m.class_id === classId)
        setMembers(classMembers)
      }
    } catch (error) {
      console.error("[v0] Error fetching members:", error)
    }
  }

  const fetchTrainingSessions = async () => {
    try {
      const response = await apiClient.getTrainingSessions()
      if (response.success && response.data) {
        const classSessions = response.data.filter((s: any) => s.class_id === classId)
        setTrainingSessions(classSessions)
      }
    } catch (error) {
      console.error("[v0] Error fetching sessions:", error)
    }
  }

  const fetchLibraryMaterials = async () => {
    try {
      const response = await apiClient.getLibraryMaterials()
      if (response.success && response.data) {
        // Filter by class instrument type if available
        setLibraryMaterials(response.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching library materials:", error)
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
              <Button onClick={() => router.push("/dashboard/classes")}>Back to Classes</Button>
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
              <CardHeader>
                <CardTitle>Class Members</CardTitle>
                <CardDescription>Students and trainers in this class</CardDescription>
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
                        onClick={() => router.push(`/dashboard/users/${member.user_id}`)}
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
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Training Sessions</CardTitle>
                <CardDescription>Upcoming and past training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trainingSessions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No sessions scheduled</p>
                  ) : (
                    trainingSessions.map((session) => (
                      <div key={session.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{session.session_name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                          </div>
                          <Badge>{new Date(session.session_date) > new Date() ? "Upcoming" : "Past"}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(session.session_date).toLocaleDateString()}
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
                {(isAdmin || isTrainer) && (
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
                          {(isAdmin || isTrainer) && (
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
      </div>
    </DashboardLayout>
  )
}
