"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { Shirt, Plus, Pencil, Trash2, UserIcon } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface ClothingItem {
  id: number
  category: string
  size?: string
  quantity: number
}

interface ClothingAssignment {
  id: number
  item_id: number
  user_id: number
  assigned_at: string
  returned_at?: string
  item?: ClothingItem
  user?: {
    id: number
    full_name: string
  }
}

interface User {
  id: number
  full_name: string
}

export default function ClothingPage() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [assignments, setAssignments] = useState<ClothingAssignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  const [formData, setFormData] = useState({
    category: "",
    size: "",
    quantity: 0,
  })
  const [assignFormData, setAssignFormData] = useState({
    item_id: "",
    user_id: "",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"user" | "item" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [groupBy, setGroupBy] = useState<"none" | "user" | "item">("none")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "returned">("active")
  const [inventoryGroupBy, setInventoryGroupBy] = useState<"none" | "category" | "size" | "availability">("none")
  const { toast } = useToast()
  const { isLeader, user } = useAuth()
  const canManageInventory = isLeader() || user?.role?.role_name?.toLowerCase() === "inventory manager"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, assignmentsRes, usersRes] = await Promise.all([
        apiClient.getClothingItems(),
        apiClient.getClothingAssignments(),
        apiClient.getUsers(),
      ])

      setItems(extractArrayFromResponse(itemsRes))
      setAssignments(extractArrayFromResponse(assignmentsRes))
      setUsers(extractArrayFromResponse(usersRes))
    } catch (error) {
      console.error("[v0] Error fetching data:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load clothing items",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await apiClient.updateClothingItem(editingItem.id, formData)
        toast({ title: "Success", description: "Item updated successfully" })
      } else {
        await apiClient.createClothingItem(formData)
        toast({ title: "Success", description: "Item created successfully" })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save item", variant: "destructive" })
    }
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formatForSql = (d: Date) => d.toISOString().split('.')[0].replace('T', ' ')

      const data = {
        item_id: Number.parseInt(assignFormData.item_id),
        user_id: Number.parseInt(assignFormData.user_id),
        assigned_at: formatForSql(new Date()),
      }

      await apiClient.createClothingAssignment(data)
      toast({ title: "Success", description: "Item assigned successfully" })
      setIsAssignDialogOpen(false)
      setAssignFormData({ item_id: "", user_id: "" })
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to assign item", variant: "destructive" })
    }
  }

  const handleEdit = (item: ClothingItem) => {
    setEditingItem(item)
    setFormData({
      category: item.category,
      size: item.size || "",
      quantity: item.quantity,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      await apiClient.deleteClothingItem(id)
      toast({ title: "Success", description: "Item deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" })
    }
  }

  const handleReturnItem = async (assignmentId: number) => {
    try {
      const formatForSql = (d: Date) => d.toISOString().split('.')[0].replace('T', ' ')
      await apiClient.updateClothingAssignment(assignmentId, {
        returned_at: formatForSql(new Date()),
      })
      toast({ title: "Success", description: "Item returned successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to return item", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      category: "",
      size: "",
      quantity: 0,
    })
  }

  const filteredAndSortedAssignments = assignments
    .filter((assignment) => {
      const matchesSearch =
        assignment.user?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.item?.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !assignment.returned_at) ||
        (statusFilter === "returned" && assignment.returned_at)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "user") {
        comparison = (a.user?.full_name || "").localeCompare(b.user?.full_name || "")
      } else if (sortBy === "item") {
        comparison = (a.item?.category || "").localeCompare(b.item?.category || "")
      } else if (sortBy === "date") {
        comparison = new Date(a.assigned_at).getTime() - new Date(b.assigned_at).getTime()
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const groupedAssignments = () => {
    if (groupBy === "none") {
      return { "All Assignments": filteredAndSortedAssignments }
    } else if (groupBy === "user") {
      return filteredAndSortedAssignments.reduce((acc, assignment) => {
        const key = assignment.user?.full_name || "Unknown User"
        if (!acc[key]) acc[key] = []
        acc[key].push(assignment)
        return acc
      }, {} as Record<string, ClothingAssignment[]>)
    } else if (groupBy === "item") {
      return filteredAndSortedAssignments.reduce((acc, assignment) => {
        const key = assignment.item?.category || "Unknown Item"
        if (!acc[key]) acc[key] = []
        acc[key].push(assignment)
        return acc
      }, {} as Record<string, ClothingAssignment[]>)
    }
    return { "All Assignments": filteredAndSortedAssignments }
  }

  const activeAssignments = assignments.filter((a) => !a.returned_at)

  const assignedCount = (itemId: number) => activeAssignments.filter((a) => a.item_id === itemId).length

  const availableCount = (item: ClothingItem) => {
    return item.quantity - assignedCount(item.id)
  }

  const availableItems = items.filter((i) => availableCount(i) > 0)

  const groupedItems = () => {
    if (inventoryGroupBy === "none") return { "All Items": items }
    if (inventoryGroupBy === "category") {
      return items.reduce((acc, it) => {
        const key = it.category || "Unknown"
        if (!acc[key]) acc[key] = []
        acc[key].push(it)
        return acc
      }, {} as Record<string, ClothingItem[]>)
    }
    if (inventoryGroupBy === "size") {
      return items.reduce((acc, it) => {
        const key = it.size || "No Size"
        if (!acc[key]) acc[key] = []
        acc[key].push(it)
        return acc
      }, {} as Record<string, ClothingItem[]>)
    }
    if (inventoryGroupBy === "availability") {
      return items.reduce((acc, it) => {
        const key = availableCount(it) > 0 ? "Available" : "Out of Stock"
        if (!acc[key]) acc[key] = []
        acc[key].push(it)
        return acc
      }, {} as Record<string, ClothingItem[]>)
    }
    return { "All Items": items }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clothing Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage uniforms and clothing items</p>
          </div>
          {canManageInventory && (
            <div className="flex gap-2">
              <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <UserIcon className="h-4 w-4" />
                    Assign
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAssignSubmit}>
                  <DialogHeader>
                    <DialogTitle>Assign Clothing Item</DialogTitle>
                    <DialogDescription>Assign a clothing item to a user</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assign_item">Item</Label>
                      <Select
                        value={assignFormData.item_id}
                        onValueChange={(value) => setAssignFormData({ ...assignFormData, item_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableItems.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground">No available items</div>
                          ) : (
                            availableItems.map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.category} {item.size ? `(${item.size})` : ""} - Qty: {item.quantity}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="assign_user">User</Label>
                      <Select
                        value={assignFormData.user_id}
                        onValueChange={(value) => setAssignFormData({ ...assignFormData, user_id: value })}
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
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={availableItems.length === 0}>Assign Item</Button>
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
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Clothing Item" : "Add New Clothing Item"}</DialogTitle>
                    <DialogDescription>
                      {editingItem ? "Update item information" : "Add a new item to inventory"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        placeholder="e.g., Uniform Shirt, Performance Dress"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="size">Size</Label>
                      <Select
                        value={formData.size}
                        onValueChange={(value) => setFormData({ ...formData, size: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NoSize">No size</SelectItem>
                          <SelectItem value="XS">XS</SelectItem>
                          <SelectItem value="S">S</SelectItem>
                          <SelectItem value="M">M</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="XL">XL</SelectItem>
                          <SelectItem value="XXL">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingItem ? "Update Item" : "Create Item"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Group:</span>
            <Select value={inventoryGroupBy} onValueChange={(v) => setInventoryGroupBy(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="availability">Group by Availability</SelectItem>
                <SelectItem value="category">Group by Category</SelectItem>
                <SelectItem value="size">Group by Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (() => {
                      const groups = groupedItems()
                      const entries = Object.entries(groups)
                      if (entries.length === 0) {
                        return (
                          <Card className="col-span-full">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                              <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No clothing items found</p>
                            </CardContent>
                          </Card>
                        )
                      }

                      return (
                        <div className="space-y-6">
                          {entries.map(([groupName, groupItems]) => (
                            <div key={groupName}>
                              {inventoryGroupBy !== "none" && (
                                <h3 className="text-lg font-semibold mb-3 text-foreground">
                                  {groupName} ({groupItems.length})
                                </h3>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {groupItems.map((item) => (
                                  <Card key={item.id} className="hover:border-primary/30 transition-colors">
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                      <div className="space-y-1 flex-1">
                                        <CardTitle className="text-lg">{item.category}</CardTitle>
                                        <CardDescription>
                                          {item.size && <div>Size: {item.size}</div>}
                                          <div className="text-xs">Qty: {item.quantity} • Assigned: {assignedCount(item.id)}</div>
                                        </CardDescription>
                                      </div>
                                      <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                                        <Shirt className="h-4 w-4 text-teal-500" />
                                      </div>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                          <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              availableCount(item) > 0
                                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                : "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                                            }`}
                                          >
                                            {availableCount(item) > 0 ? `Available (${availableCount(item)})` : "Out of Stock"}
                                          </span>
                                        </div>
                                        {canManageInventory && (
                                          <div className="flex gap-2 mt-3">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex-1 bg-transparent"
                                              onClick={() => handleEdit(item)}
                                            >
                                              <Pencil className="h-3 w-3 mr-1" />
                                              Edit
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-destructive hover:bg-destructive/10 bg-transparent"
                                              onClick={() => handleDelete(item.id)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()
            }
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Clothing Assignments</CardTitle>
                <CardDescription>Manage clothing items assigned to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Input
                      placeholder="Search assignments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="item">Item</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Group By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Grouping</SelectItem>
                        <SelectItem value="user">Group by User</SelectItem>
                        <SelectItem value="item">Group by Item</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(groupedAssignments()).map(([groupName, groupAssignments]) => (
                      <div key={groupName}>
                        {groupBy !== "none" && (
                          <h3 className="text-lg font-semibold mb-3 text-foreground">{groupName}</h3>
                        )}
                        <div className="space-y-3">
                          {groupAssignments.length === 0 ? (
                            <p className="text-center py-8 text-muted-foreground">No assignments found</p>
                          ) : (
                            groupAssignments.map((assignment) => (
                              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {assignment.item?.category} {assignment.item?.size ? `(${assignment.item.size})` : ""}
                                  </p>
                                  <p className="text-sm text-muted-foreground">Assigned to: {assignment.user?.full_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                                    {assignment.returned_at && ` • Returned: ${new Date(assignment.returned_at).toLocaleDateString()}`}
                                  </p>
                                </div>
                                {!assignment.returned_at && (
                                  <Button variant="outline" size="sm" onClick={() => handleReturnItem(assignment.id)}>
                                    Mark Returned
                                  </Button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
