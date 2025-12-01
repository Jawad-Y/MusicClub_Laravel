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
import { Building2, Plus, Pencil, Trash2, Users, ChevronRight } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { extractArrayFromResponse } from "@/lib/api-utils"

interface Department {
  id: number
  department_name: string
  leader_id?: number
  leader?: {
    id: number
    full_name: string
  }
}

interface User {
  id: number
  full_name: string
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [formData, setFormData] = useState({
    department_name: "",
    leader_id: null, // Updated default value to null
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchDepartments()
    fetchUsers()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await apiClient.getDepartments()
      if (response.success && response.data) {
        setDepartments(extractArrayFromResponse(response))
      }
    } catch (error: any) {
      console.error("[v0] Error fetching departments:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers()
      if (response.success && response.data) {
        setUsers(extractArrayFromResponse(response))
      }
    } catch (error: any) {
      console.error("[v0] Error fetching users:", error?.status, error?.statusText, error?.body || error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        department_name: formData.department_name,
        leader_id: formData.leader_id,
      }

      if (editingDepartment) {
        await apiClient.updateDepartment(editingDepartment.id, data)
        toast({
          title: "Success",
          description: "Department updated successfully",
        })
      } else {
        await apiClient.createDepartment(data)
        toast({
          title: "Success",
          description: "Department created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchDepartments()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save department",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (department: Department) => {
    setEditingDepartment(department)
    setFormData({
      department_name: department.department_name,
      leader_id: department.leader_id || null, // Updated to handle null values
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) return

    try {
      await apiClient.deleteDepartment(id)
      toast({
        title: "Success",
        description: "Department deleted successfully",
      })
      fetchDepartments()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete department",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingDepartment(null)
    setFormData({
      department_name: "",
      leader_id: null, // Updated default value to null
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Departments</h1>
            <p className="text-muted-foreground mt-1">Manage organizational departments and their leaders</p>
          </div>
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
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</DialogTitle>
                  <DialogDescription>
                    {editingDepartment ? "Update department information" : "Create a new department"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department_name">Department Name</Label>
                    <Input
                      id="department_name"
                      value={formData.department_name}
                      onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="leader_id">Department Leader (Optional)</Label>
                    <Select
                      value={formData.leader_id?.toString() || "no_leader"} // Updated to handle null values
                      onValueChange={(value) =>
                        setFormData({ ...formData, leader_id: value === "no_leader" ? null : Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a leader" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_leader">No Leader</SelectItem>
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
                  <Button type="submit">{editingDepartment ? "Update Department" : "Create Department"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No departments found</p>
                </CardContent>
              </Card>
            ) : (
              departments.map((department) => (
                <Card key={department.id} className="hover:border-primary/30 transition-colors">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{department.department_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Leader: {department.leader?.full_name || "Not assigned"}
                      </CardDescription>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => router.push(`/dashboard/departments/${department.id}/classes`)}
                      >
                        <ChevronRight className="h-3 w-3 mr-1" />
                        View Classes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                        onClick={() => handleEdit(department)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 bg-transparent"
                        onClick={() => handleDelete(department.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
