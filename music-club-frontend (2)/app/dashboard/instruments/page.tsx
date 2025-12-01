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
import { Guitar, Plus, Pencil, Trash2, Package, UserIcon } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface InstrumentType {
  id: number
  name: string
}

interface Instrument {
  id: number
  name: string
  instrument_type_id: number
  unique_code: string
  condition: string
  instrument_type?: InstrumentType
}

interface InstrumentAssignment {
  id: number
  instrument_id: number
  user_id: number
  assigned_at: string
  returned_at?: string
  instrument?: Instrument
  user?: {
    id: number
    full_name: string
  }
}

interface User {
  id: number
  full_name: string
}

export default function InstrumentsPage() {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentType[]>([])
  const [assignments, setAssignments] = useState<InstrumentAssignment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false)
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    instrument_type_id: "",
    unique_code: "",
    condition: "good",
  })
  const [assignFormData, setAssignFormData] = useState({
    instrument_id: "",
    user_id: "",
  })
  const [typeFormData, setTypeFormData] = useState({
    name: "",
  })
  const { toast } = useToast()
  const { isLeader, user } = useAuth()
  const canManageInventory = isLeader() || user?.role?.role_name?.toLowerCase() === "inventory manager"

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [instrumentsRes, typesRes, assignmentsRes, usersRes] = await Promise.all([
        apiClient.getInstruments(),
        apiClient.getInstrumentTypes(),
        apiClient.getInstrumentAssignments(),
        apiClient.getUsers(),
      ])

      setInstruments(extractArrayFromResponse(instrumentsRes))
      setInstrumentTypes(extractArrayFromResponse(typesRes))
      setAssignments(extractArrayFromResponse(assignmentsRes))
      setUsers(extractArrayFromResponse(usersRes))
    } catch (error) {
      console.error("[v0] Error fetching data:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load instruments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        instrument_type_id: Number.parseInt(formData.instrument_type_id),
      }

      if (editingInstrument) {
        await apiClient.updateInstrument(editingInstrument.id, data)
        toast({ title: "Success", description: "Instrument updated successfully" })
      } else {
        await apiClient.createInstrument(data)
        toast({ title: "Success", description: "Instrument created successfully" })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save instrument", variant: "destructive" })
    }
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        instrument_id: Number.parseInt(assignFormData.instrument_id),
        user_id: Number.parseInt(assignFormData.user_id),
        assigned_at: new Date().toISOString(),
      }

      await apiClient.createInstrumentAssignment(data)
      toast({ title: "Success", description: "Instrument assigned successfully" })
      setIsAssignDialogOpen(false)
      setAssignFormData({ instrument_id: "", user_id: "" })
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to assign instrument", variant: "destructive" })
    }
  }

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createInstrumentType(typeFormData)
      toast({ title: "Success", description: "Instrument type created successfully" })
      setIsTypeDialogOpen(false)
      setTypeFormData({ name: "" })
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to create type", variant: "destructive" })
    }
  }

  const handleEdit = (instrument: Instrument) => {
    setEditingInstrument(instrument)
    setFormData({
      name: instrument.name,
      instrument_type_id: instrument.instrument_type_id.toString(),
      unique_code: instrument.unique_code,
      condition: instrument.condition,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this instrument?")) return
    try {
      await apiClient.deleteInstrument(id)
      toast({ title: "Success", description: "Instrument deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete instrument", variant: "destructive" })
    }
  }

  const handleReturnInstrument = async (assignmentId: number) => {
    try {
      await apiClient.updateInstrumentAssignment(assignmentId, {
        returned_at: new Date().toISOString(),
      })
      toast({ title: "Success", description: "Instrument returned successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to return instrument", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setEditingInstrument(null)
    setFormData({
      name: "",
      instrument_type_id: "",
      unique_code: "",
      condition: "good",
    })
  }

  const activeAssignments = assignments.filter((a) => !a.returned_at)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Instruments</h1>
            <p className="text-muted-foreground mt-1">Manage instrument inventory and assignments</p>
          </div>
          {canManageInventory && (
            <div className="flex gap-2">
              <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <Package className="h-4 w-4" />
                    Add Type
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleTypeSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add Instrument Type</DialogTitle>
                    <DialogDescription>Create a new instrument category</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type_name">Type Name</Label>
                      <Input
                        id="type_name"
                        value={typeFormData.name}
                        onChange={(e) => setTypeFormData({ name: e.target.value })}
                        required
                        placeholder="e.g., Violin, Guitar, Piano"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Type</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

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
                    <DialogTitle>Assign Instrument</DialogTitle>
                    <DialogDescription>Assign an instrument to a user</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="assign_instrument">Instrument</Label>
                      <Select
                        value={assignFormData.instrument_id}
                        onValueChange={(value) => setAssignFormData({ ...assignFormData, instrument_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an instrument" />
                        </SelectTrigger>
                        <SelectContent>
                          {instruments.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id.toString()}>
                              {inst.name} ({inst.unique_code})
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
                    <Button type="submit">Assign Instrument</Button>
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
                  Add Instrument
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingInstrument ? "Edit Instrument" : "Add New Instrument"}</DialogTitle>
                    <DialogDescription>
                      {editingInstrument ? "Update instrument information" : "Add a new instrument to inventory"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Instrument Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="instrument_type_id">Type</Label>
                      <Select
                        value={formData.instrument_type_id}
                        onValueChange={(value) => setFormData({ ...formData, instrument_type_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          {instrumentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unique_code">Unique Code</Label>
                      <Input
                        id="unique_code"
                        value={formData.unique_code}
                        onChange={(e) => setFormData({ ...formData, unique_code: e.target.value })}
                        required
                        placeholder="e.g., VLN-001"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => setFormData({ ...formData, condition: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="needs_repair">Needs Repair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingInstrument ? "Update Instrument" : "Create Instrument"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          )}
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instruments.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Guitar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No instruments found</p>
                    </CardContent>
                  </Card>
                ) : (
                  instruments.map((instrument) => (
                    <Card key={instrument.id} className="hover:border-primary/30 transition-colors">
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">{instrument.name}</CardTitle>
                          <CardDescription>
                            <div>{instrument.instrument_type?.name}</div>
                            <div className="text-xs">Code: {instrument.unique_code}</div>
                          </CardDescription>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                          <Guitar className="h-4 w-4 text-purple-500" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              instrument.condition === "excellent"
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : instrument.condition === "good"
                                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                  : instrument.condition === "fair"
                                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                            }`}
                          >
                            {instrument.condition}
                          </span>
                          {canManageInventory && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => handleEdit(instrument)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 bg-transparent"
                              onClick={() => handleDelete(instrument.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            </div>
                          )}
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
                <CardDescription>Instruments currently assigned to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAssignments.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No active assignments</p>
                  ) : (
                    activeAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{assignment.instrument?.name}</p>
                          <p className="text-sm text-muted-foreground">Assigned to: {assignment.user?.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Since: {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleReturnInstrument(assignment.id)}>
                          Mark Returned
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {instrumentTypes.map((type) => (
                <Card key={type.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    <CardDescription>
                      {instruments.filter((i) => i.instrument_type_id === type.id).length} instruments
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
