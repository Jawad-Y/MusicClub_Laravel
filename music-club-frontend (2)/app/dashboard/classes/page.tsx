"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { GraduationCap, Plus, Pencil, Trash2, Users, Building2, UserPlus, ChevronRight } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"

interface Class {
  id: number
  class_name: string
  department_id: number
  class_leader_id?: number
  department?: {
    id: number
    department_name: string
  }
  class_leader?: {
    id: number
    full_name: string
  }
}

interface Department {
  id: number
  department_name: string
}

interface User {
  id: number
  full_name: string
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

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [classMembers, setClassMembers] = useState<ClassMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [selectedClass, setSelectedClass] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    class_name: "",
    department_id: "",
    class_leader_id: "",
  })
  const [memberFormData, setMemberFormData] = useState({
    class_id: "",
    user_id: "",
    role: "trainee",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchClasses()
    fetchDepartments()
    fetchUsers()
    fetchClassMembers()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await apiClient.getClasses()
      setClasses(extractArrayFromResponse(response))
    } catch (error) {
      console.error("[v0] Error fetching classes:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.getDepartments()
      setDepartments(extractArrayFromResponse(response))
    } catch (error) {
      console.error("[v0] Error fetching departments:", error?.status, error?.statusText, error?.body || error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers()
      setUsers(extractArrayFromResponse(response))
    } catch (error) {
      console.error("[v0] Error fetching users:", error?.status, error?.statusText, error?.body || error)
    }
  }

  const fetchClassMembers = async () => {
    try {
      const response = await apiClient.getClassMembers()
      setClassMembers(extractArrayFromResponse(response))
    } catch (error) {
      console.error("[v0] Error fetching class members:", error?.status, error?.statusText, error?.body || error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        class_name: formData.class_name,
        department_id: Number.parseInt(formData.department_id),
        class_leader_id: formData.class_leader_id ? Number.parseInt(formData.class_leader_id) : null,
      }

      if (editingClass) {
        await apiClient.updateClass(editingClass.id, data)
        toast({
          title: "Success",
          description: "Class updated successfully",
        })
      } else {
        await apiClient.createClass(data)
        toast({
          title: "Success",
          description: "Class created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchClasses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save class",
        variant: "destructive",
      })
    }
  }

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        class_id: Number.parseInt(memberFormData.class_id),
        user_id: Number.parseInt(memberFormData.user_id),
        role: memberFormData.role,
      }

      await apiClient.createClassMember(data)
      toast({
        title: "Success",
        description: "Member added to class successfully",
      })
      setIsMemberDialogOpen(false)
      resetMemberForm()
      fetchClassMembers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      class_name: classItem.class_name,
      department_id: classItem.department_id.toString(),
      class_leader_id: classItem.class_leader_id?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return

    try {
      await apiClient.deleteClass(id)
      toast({
        title: "Success",
        description: "Class deleted successfully",
      })
      fetchClasses()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      await apiClient.deleteClassMember(id)
      toast({
        title: "Success",
        description: "Member removed successfully",
      })
      fetchClassMembers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingClass(null)
    setFormData({
      class_name: "",
      department_id: "",
      class_leader_id: "",
    })
  }

  const resetMemberForm = () => {
    setMemberFormData({
      class_id: "",
      user_id: "",
      role: "trainee",
    })
  }

  const getClassMembers = (classId: number) => {
    return classMembers.filter((m) => m.class_id === classId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground mt-1">Manage training classes and their members</p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={isMemberDialogOpen}
              onOpenChange={(open) => {
                setIsMemberDialogOpen(open)
                if (!open) resetMemberForm()
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleMemberSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add Class Member</DialogTitle>
                    <DialogDescription>Assign a user to a class as trainer or trainee</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="member_class_id">Class</Label>
                      <Select
                        value={memberFormData.class_id}
                        onValueChange={(value) => setMemberFormData({ ...memberFormData, class_id: value })}
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
                      <Label htmlFor="member_user_id">User</Label>
                      <Select
                        value={memberFormData.user_id}
                        onValueChange={(value) => setMemberFormData({ ...memberFormData, user_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
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
                      <Label htmlFor="member_role">Role</Label>
                      <Select
                        value={memberFormData.role}
                        onValueChange={(value) => setMemberFormData({ ...memberFormData, role: value })}
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
                    <Button type="submit">Add Member</Button>
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
                  Add Class
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
                    <DialogDescription>
                      {editingClass ? "Update class information" : "Create a new training class"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="class_name">Class Name</Label>
                      <Input
                        id="class_name"
                        value={formData.class_name}
                        onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="department_id">Department</Label>
                      <Select
                        value={formData.department_id}
                        onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                              {dept.department_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="class_leader_id">Class Leader (Optional)</Label>
                      <Select
                        value={formData.class_leader_id}
                        onValueChange={(value) => setFormData({ ...formData, class_leader_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a leader" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No Leader</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingClass ? "Update Class" : "Create Class"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classes">All Classes</TabsTrigger>
            <TabsTrigger value="members">Class Members</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No classes found</p>
                    </CardContent>
                  </Card>
                ) : (
                  classes.map((classItem) => (
                    <Card key={classItem.id} className="hover:border-primary/30 transition-colors">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {classItem.department?.department_name || "No department"}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Leader: {classItem.class_leader?.full_name || "Not assigned"}
                            </div>
                          </CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                          <GraduationCap className="h-4 w-4 text-green-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            {getClassMembers(classItem.id).length} members
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={() => router.push(`/dashboard/classes/${classItem.id}`)}
                            >
                              <ChevronRight className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent"
                              onClick={() => handleEdit(classItem)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 bg-transparent"
                              onClick={() => handleDelete(classItem.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Members</CardTitle>
                <CardDescription>View all users assigned to classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classMembers.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No members assigned</p>
                  ) : (
                    classMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{member.user?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.role === "trainer"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                            }`}
                          >
                            {member.role}
                          </span>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMember(member.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
