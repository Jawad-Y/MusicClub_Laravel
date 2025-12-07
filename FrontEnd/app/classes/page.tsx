"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Plus, Pencil, Trash2, Users, Building2, UserPlus, ChevronRight } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { filterClassLeaders } from "@/lib/role-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Class {
  id: number
  class_name: string
  department_id: number
  class_leader_id?: number | null
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
  role?: {
    id: number
    role_name: string
  }
  role_id?: number
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
  const auth = useAuth()
  const currentUser = auth.user
  const authIsLoading = auth.isLoading

 useEffect(() => {
  fetchUsers()
  fetchClassMembers()

  if (!authIsLoading && currentUser) {
    const roleName = currentUser.role?.role_name?.toLowerCase() ?? ""
    if (auth.isLeader() || auth.isDepartmentLeader() || roleName === "admin") {
      fetchDepartments()
    }
  }
}, [currentUser, authIsLoading])

  // fetch classes after auth resolves
  useEffect(() => {
    if (authIsLoading) {
      setIsLoading(true)
      return
    }

    if (!currentUser) {
      // no user -> hide classes
      setClasses([])
      setIsLoading(false)
      return
    }

    ;(async () => {
      setIsLoading(true)
      try {
        await fetchClassMembers()
        await fetchClassesForCurrentUser()
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, authIsLoading])

  // --- fetch helpers ---
  const fetchDepartments = async () => {
    try {
      const resp = await apiClient.getDepartments()
      setDepartments(extractArrayFromResponse(resp))
    } catch (err) {
      console.error("Error loading departments", err)
    }
  }

  const fetchUsers = async () => {
    try {
      const resp = await apiClient.getUsers()
      setUsers(extractArrayFromResponse(resp))
    } catch (err) {
      console.error("Error loading users", err)
    }
  }

  const fetchClassMembers = async () => {
    try {
      const resp = await apiClient.getClassMembers()
      setClassMembers(extractArrayFromResponse(resp))
    } catch (err) {
      console.error("Error loading class members", err)
    }
  }

  // fetch classes but scoped to current user (prefer backend query if available)
  const fetchClassesForCurrentUser = async () => {
    if (!currentUser) {
      setClasses([])
      return
    }

    try {
      const roleName = currentUser.role?.role_name?.toLowerCase?.() ?? ""
      const leader = auth.isLeader()
      const deptLeader = auth.isDepartmentLeader()
      const isAdmin = roleName === "admin"
      const isTrainerRole = auth.isTrainer()

      if (leader || deptLeader || isAdmin) {
        const resp = await apiClient.getClasses()
        setClasses(extractArrayFromResponse(resp))
        return
      }

      if (isTrainerRole) {
        // try backend filtered call
        try {
          const maybe = await (apiClient.getClasses as any)({ trainerId: Number(currentUser.id) })
          if (maybe) {
            setClasses(extractArrayFromResponse(maybe))
            return
          }
        } catch (err) {
          // fallback to client filtering
          console.warn("Backend trainer-filter failed, fallback to client filter", err)
        }

        const resp = await apiClient.getClasses()
        const all = (extractArrayFromResponse(resp) as Class[]) || []
        const allowed = new Set<number>()
        all.forEach((c) => {
          if (Number(c.class_leader_id) === Number(currentUser.id)) allowed.add(Number(c.id))
        })
        classMembers.forEach((m) => {
          if (Number(m.user_id) === Number(currentUser.id) && String(m.role).toLowerCase() === "trainer") {
            allowed.add(Number(m.class_id))
          }
        })
        setClasses(all.filter((c) => allowed.has(Number(c.id))))
        return
      }

      // other roles: none
      setClasses([])
    } catch (err) {
      console.error("Error fetching classes for user", err)
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      })
    }
  }

  // --- visibility / permission helpers ---
  const isTrainerForClass = (classId: number) => {
    if (!currentUser) return false
    const cls = classes.find((c) => Number(c.id) === Number(classId))
    if (cls && Number(cls.class_leader_id) === Number(currentUser.id)) return true
    return classMembers.some(
      (m) => Number(m.class_id) === Number(classId) && Number(m.user_id) === Number(currentUser.id) && m.role === "trainer"
    )
  }

  // Strict visible classes: trainers only see their classes; leaders/admins see all
  const visibleClasses = useMemo(() => {
    if (!currentUser) return []
    const role = String(currentUser.role?.role_name || "").toLowerCase()
    if (auth.isLeader() || auth.isDepartmentLeader() || role === "admin") return classes
    if (role === "trainer") {
      const allowed = new Set<number>()
      classes.forEach((c) => {
        if (Number(c.class_leader_id) === Number(currentUser.id)) allowed.add(Number(c.id))
      })
      classMembers.forEach((m) => {
        if (Number(m.user_id) === Number(currentUser.id) && String(m.role).toLowerCase() === "trainer") {
          allowed.add(Number(m.class_id))
        }
      })
      return classes.filter((c) => allowed.has(Number(c.id)))
    }
    return []
  }, [classes, classMembers, currentUser, auth])

  // classes user can manage (used in Add Member dropdown)
  const manageableClassesForMemberAdd = useMemo(() => {
    if (!currentUser) return []
    const role = String(currentUser.role?.role_name || "").toLowerCase()
    if (auth.isLeader() || auth.isDepartmentLeader() || role === "admin") return visibleClasses
    if (role === "trainer") return visibleClasses
    return []
  }, [visibleClasses, currentUser, auth])

  // --- handlers (create/edit/delete/add-member) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      toast({ title: "Unauthorized", description: "Login required", variant: "destructive" })
      return
    }
    const role = String(currentUser.role?.role_name || "").toLowerCase()
    if (!(auth.isLeader() || auth.isDepartmentLeader() || role === "admin")) {
      toast({ title: "Forbidden", description: "No permission to create/update classes", variant: "destructive" })
      return
    }

    try {
      const payload = {
        class_name: formData.class_name,
        department_id: Number(formData.department_id),
        class_leader_id: formData.class_leader_id ? Number(formData.class_leader_id) : null,
      }

      if (editingClass) {
        const canEdit = auth.isLeader() || auth.isDepartmentLeader() || role === "admin" || isTrainerForClass(editingClass.id)
        if (!canEdit) {
          toast({ title: "Forbidden", description: "No permission to edit this class", variant: "destructive" })
          return
        }
        await apiClient.updateClass(editingClass.id, payload)
        toast({ title: "Success", description: "Class updated" })
      } else {
        await apiClient.createClass(payload)
        toast({ title: "Success", description: "Class created" })
      }

      setIsDialogOpen(false)
      setFormData({ class_name: "", department_id: "", class_leader_id: "" })
      await fetchClassesForCurrentUser()
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err?.message || "Failed to save class", variant: "destructive" })
    }
  }

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      toast({ title: "Unauthorized", description: "Login required", variant: "destructive" })
      return
    }
    const selectedClassId = Number(memberFormData.class_id || 0)
    if (!selectedClassId) {
      toast({ title: "Error", description: "Select a class", variant: "destructive" })
      return
    }
    // trainers can add members only to their classes
    if (auth.isTrainer() && !isTrainerForClass(selectedClassId)) {
      toast({ title: "Forbidden", description: "You cannot add members to this class", variant: "destructive" })
      return
    }

    try {
      await apiClient.createClassMember({
        class_id: selectedClassId,
        user_id: Number(memberFormData.user_id),
        role: memberFormData.role,
      })
      toast({ title: "Success", description: "Member added" })
      setIsMemberDialogOpen(false)
      setMemberFormData({ class_id: "", user_id: "", role: "trainee" })
      await fetchClassMembers()
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err?.message || "Failed to add member", variant: "destructive" })
    }
  }

  const handleEdit = (classItem: Class) => {
    const role = String(currentUser?.role?.role_name || "").toLowerCase()
    const canEdit = auth.isLeader() || auth.isDepartmentLeader() || role === "admin" || isTrainerForClass(classItem.id)
    if (!canEdit) {
      toast({ title: "Forbidden", description: "No permission", variant: "destructive" })
      return
    }
    setEditingClass(classItem)
    setFormData({
      class_name: classItem.class_name,
      department_id: String(classItem.department_id ?? ""),
      class_leader_id: classItem.class_leader_id ? String(classItem.class_leader_id) : "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this class?")) return
    if (!currentUser) return
    const role = String(currentUser.role?.role_name || "").toLowerCase()
    const canDelete = auth.isLeader() || auth.isDepartmentLeader() || role === "admin" || isTrainerForClass(id)
    if (!canDelete) {
      toast({ title: "Forbidden", description: "No permission", variant: "destructive" })
      return
    }
    try {
      await apiClient.deleteClass(id)
      toast({ title: "Success", description: "Class deleted" })
      await fetchClassesForCurrentUser()
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm("Are you sure you want to remove this member?")) return
    const member = classMembers.find((m) => m.id === id)
    if (!member) {
      toast({ title: "Not found", description: "Member not found", variant: "destructive" })
      return
    }
    const role = String(currentUser?.role?.role_name || "").toLowerCase()
    const canManage = auth.isLeader() || auth.isDepartmentLeader() || role === "admin" || isTrainerForClass(member.class_id)
    if (!canManage) {
      toast({ title: "Forbidden", description: "No permission", variant: "destructive" })
      return
    }
    try {
      await apiClient.deleteClassMember(id)
      toast({ title: "Success", description: "Member removed" })
      await fetchClassMembers()
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to remove member", variant: "destructive" })
    }
  }

  const getClassMembers = (classId: number) => classMembers.filter((m) => Number(m.class_id) === Number(classId))

  // UI
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Classes</h1>
            <p className="text-muted-foreground mt-1">Manage training classes and their members</p>
          </div>

          <div className="flex gap-2">
            {((auth.isLeader() || auth.isDepartmentLeader() || currentUser?.role?.role_name?.toLowerCase?.() === "admin") ||
              (auth.isTrainer() && visibleClasses.length > 0)) && (
              <>
                <Dialog open={isMemberDialogOpen} onOpenChange={(open) => { setIsMemberDialogOpen(open); if (!open) setMemberFormData({ class_id: "", user_id: "", role: "trainee" }) }}>
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
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Class</Label>
                          <Select value={memberFormData.class_id} onValueChange={(v) => setMemberFormData({ ...memberFormData, class_id: v })} required>
                            <SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger>
                            <SelectContent>
                              {manageableClassesForMemberAdd.map((cls) => (
                                <SelectItem key={cls.id} value={String(cls.id)}>{cls.class_name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>User</Label>
                          <Select value={memberFormData.user_id} onValueChange={(v) => setMemberFormData({ ...memberFormData, user_id: v })} required>
                            <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                            <SelectContent>
                              {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.full_name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Role</Label>
                          <Select value={memberFormData.role} onValueChange={(v) => setMemberFormData({ ...memberFormData, role: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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

                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setFormData({ class_name: "", department_id: "", class_leader_id: "" }) }}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="h-4 w-4" />Add Class</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Class Name</Label>
                          <Input value={formData.class_name} onChange={(e) => setFormData({ ...formData, class_name: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                          <Label>Department</Label>
                          <Select value={formData.department_id} onValueChange={(v) => setFormData({ ...formData, department_id: v })} required>
                            <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                            <SelectContent>
                              {departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.department_name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Class Leader (Optional)</Label>
                          <Select value={formData.class_leader_id} onValueChange={(v) => setFormData({ ...formData, class_leader_id: v })}>
                            <SelectTrigger><SelectValue placeholder="Select a leader" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">No Leader</SelectItem>
                              {filterClassLeaders(users).map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.full_name}</SelectItem>)}
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
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleClasses.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No classes found</p>
                  </CardContent>
                </Card>
              ) : (
                visibleClasses.map((classItem) => {
                  const canManage =
                    auth.isLeader() || auth.isDepartmentLeader() || (currentUser?.role?.role_name?.toLowerCase?.() === "admin") || isTrainerForClass(classItem.id)

                  return (
                    <Card key={classItem.id} className="hover:border-primary/30 transition-colors">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-1"><Building2 className="h-3 w-3" />{classItem.department?.department_name || "No department"}</div>
                            <div className="flex items-center gap-1"><Users className="h-3 w-3" />Leader: {classItem.class_leader?.full_name || "Not assigned"}</div>
                          </CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20"><GraduationCap className="h-4 w-4 text-green-500" /></div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">{getClassMembers(classItem.id).length} members</div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => router.push(`/classes/${classItem.id}`)}>
                              <ChevronRight className="h-3 w-3 mr-1" />View Details
                            </Button>
                            {canManage && (
                              <>
                                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => handleEdit(classItem)}><Pencil className="h-3 w-3 mr-1" />Edit</Button>
                                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 bg-transparent" onClick={() => handleDelete(classItem.id)}><Trash2 className="h-3 w-3" /></Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}