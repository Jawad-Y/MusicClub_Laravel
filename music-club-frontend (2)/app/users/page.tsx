"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Pencil, Trash2, Search, UserPlus, Eye, ArrowUpDown, Filter } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { extractArrayFromResponse } from "@/lib/api-utils"

interface User {
  id: number
  full_name: string
  email: string
  phone?: string
  role_id: number
  status: string
  role?: {
    id: number
    role_name: string
  }
}

interface Role {
  id: number
  role_name: string
  description?: string
}



export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "email" | "role">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<"none" | "role" | "status">("none")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    role_id: "",
    password: "",
    status: "active",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await apiClient.getUsers()
      if (response.success && response.data) {
        setUsers(extractArrayFromResponse(response))
      }
    } catch (error: any) {
      console.error("[v0] Error fetching users:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await apiClient.getRoles()
      if (response.success && response.data) {
        setRoles(extractArrayFromResponse(response))
      }
    } catch (error: any) {
      console.error("[v0] Error fetching roles:", error?.status, error?.statusText, error?.body || error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        role_id: Number.parseInt(formData.role_id),
      }

      if (editingUser) {
        const updateData = { ...data }
        if (!updateData.password) {
          delete updateData.password
        }
        await apiClient.updateUser(editingUser.id, updateData)
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        await apiClient.createUser(data)
        toast({
          title: "Success",
          description: "User created successfully",
        })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || "",
      role_id: user.role_id.toString(),
      password: "",
      status: user.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await apiClient.deleteUser(id)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingUser(null)
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      role_id: "",
      password: "",
      status: "active",
    })
  }

  const handleViewProfile = (user: User) => {
    router.push(`/users/${user.id}`)
  }

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || user.role_id.toString() === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "name") {
        comparison = a.full_name.localeCompare(b.full_name)
      } else if (sortBy === "email") {
        comparison = a.email.localeCompare(b.email)
      } else if (sortBy === "role") {
        comparison = (a.role?.role_name || "").localeCompare(b.role?.role_name || "")
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const groupedUsers = () => {
    if (groupBy === "none") {
      return { "All Users": filteredUsers }
    } else if (groupBy === "role") {
      return filteredUsers.reduce((acc, user) => {
        const key = user.role?.role_name || "No Role"
        if (!acc[key]) acc[key] = []
        acc[key].push(user)
        return acc
      }, {} as Record<string, User[]>)
    } else if (groupBy === "status") {
      return filteredUsers.reduce((acc, user) => {
        const key = user.status || "Unknown"
        if (!acc[key]) acc[key] = []
        acc[key].push(user)
        return acc
      }, {} as Record<string, User[]>)
    }
    return { "All Users": filteredUsers }
  }

  const userGroups = groupedUsers()

  const roleCounts = users.reduce((acc, u) => {
    const key = u.role_id?.toString() || "none"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statusCounts = users.reduce((acc, u) => {
    const key = u.status || "unknown"
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Users & Roles</h1>
            <p className="text-muted-foreground mt-1">Manage system users and their roles</p>
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
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? "Update user information" : "Create a new user account"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role_id">Role</Label>
                    <Select
                      value={formData.role_id}
                      onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.role_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password {editingUser && "(leave blank to keep current)"}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingUser ? "Update User" : "Create User"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>A list of all users registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-muted-foreground">Filter:</span>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles ({users.length})</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.role_name} ({roleCounts[role.id?.toString() || "none"] || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status ({users.length})</SelectItem>
                    <SelectItem value="active">Active ({statusCounts["active"] || 0})</SelectItem>
                    <SelectItem value="inactive">Inactive ({statusCounts["inactive"] || 0})</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center">
                  <span className="mr-2 text-sm text-muted-foreground">Group:</span>
                  <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Group By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Grouping</SelectItem>
                      <SelectItem value="role">Group by Role</SelectItem>
                      <SelectItem value="status">Group by Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {sortOrder === "asc" ? "Ascending" : "Descending"}
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-6">
                {Object.entries(userGroups).map(([groupName, groupUsers]) => (
                  <div key={groupName}>
                    {groupBy !== "none" && (
                      <h3 className="text-lg font-semibold mb-3 text-foreground">{groupName} ({groupUsers.length})</h3>
                    )}
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupUsers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No users found
                              </TableCell>
                            </TableRow>
                          ) : (
                            groupUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.full_name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone || "-"}</TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                    {user.role?.role_name || "N/A"}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      user.status === "active"
                                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                        : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                                    }`}
                                  >
                                    {user.status}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleViewProfile(user)} title="View Profile">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        
      </div>
    </DashboardLayout>
  )
}
