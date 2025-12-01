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
  const { toast } = useToast()

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
      const data = {
        item_id: Number.parseInt(assignFormData.item_id),
        user_id: Number.parseInt(assignFormData.user_id),
        assigned_at: new Date().toISOString(),
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
      await apiClient.updateClothingAssignment(assignmentId, {
        returned_at: new Date().toISOString(),
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

  const activeAssignments = assignments.filter((a) => !a.returned_at)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clothing Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage uniforms and clothing items</p>
          </div>
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
                          {items.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.category} {item.size ? `(${item.size})` : ""} - Qty: {item.quantity}
                            </SelectItem>
                          ))}
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
                    <Button type="submit">Assign Item</Button>
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
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No clothing items found</p>
                    </CardContent>
                  </Card>
                ) : (
                  items.map((item) => (
                    <Card key={item.id} className="hover:border-primary/30 transition-colors">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{item.category}</CardTitle>
                          <CardDescription>
                            {item.size && <div>Size: {item.size}</div>}
                            <div className="text-lg font-semibold text-foreground">Qty: {item.quantity}</div>
                          </CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
                          <Shirt className="h-4 w-4 text-teal-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Assignments</CardTitle>
                <CardDescription>Clothing items currently assigned to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAssignments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No active assignments</p>
                  ) : (
                    activeAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">
                            {assignment.item?.category} {assignment.item?.size ? `(${assignment.item.size})` : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">Assigned to: {assignment.user?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Since: {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleReturnItem(assignment.id)}>
                          Mark Returned
                        </Button>
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
