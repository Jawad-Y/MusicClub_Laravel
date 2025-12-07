"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { FileText, Plus, Pencil, Trash2, Download } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"

interface InstrumentType {
  id: number
  name: string
}

interface LibraryMaterial {
  id: number
  title: string
  description?: string
  file_url?: string
  instrument_type_id?: number
  uploaded_by: number
  uploaded_at?: string
  instrument_type?: InstrumentType
}

export default function LibraryPage() {
  const [materials, setMaterials] = useState<LibraryMaterial[]>([])
  const [instrumentTypes, setInstrumentTypes] = useState<InstrumentType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<LibraryMaterial | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file_url: "",
    instrument_type_id: "0",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"title" | "date" | "type">("title")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [groupBy, setGroupBy] = useState<"none" | "type">("none")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [materialsRes, typesRes] = await Promise.all([
        apiClient.getLibraryMaterials(),
        apiClient.getInstrumentTypes(),
      ])

      setMaterials(extractArrayFromResponse(materialsRes))
      setInstrumentTypes(extractArrayFromResponse(typesRes))
    } catch (error: any) {
      console.error("[v0] Error fetching data:", {
        status: error?.status,
        statusText: error?.statusText,
        body: error?.body,
        message: error?.body?.message
      })
      // Don't show toast for 403 - navigation should prevent access
      if (error?.status !== 403) {
        toast({
          title: "Error",
          description: error?.body?.message || "Failed to load library materials",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        file_url: formData.file_url,
        instrument_type_id: formData.instrument_type_id ? Number.parseInt(formData.instrument_type_id) : null,
        uploaded_at: new Date().toISOString(),
      }

      if (editingMaterial) {
        await apiClient.updateLibraryMaterial(editingMaterial.id, data)
        toast({ title: "Success", description: "Material updated successfully" })
      } else {
        await apiClient.createLibraryMaterial(data)
        toast({ title: "Success", description: "Material added successfully" })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save material", variant: "destructive" })
    }
  }

  const handleEdit = (material: LibraryMaterial) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      description: material.description || "",
      file_url: material.file_url || "",
      instrument_type_id: material.instrument_type_id?.toString() || "0", // Updated default value to '0'
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this material?")) return
    try {
      await apiClient.deleteLibraryMaterial(id)
      toast({ title: "Success", description: "Material deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete material", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setEditingMaterial(null)
    setFormData({
      title: "",
      description: "",
      file_url: "",
      instrument_type_id: "0", // Updated default value to '0'
    })
  }

  const filteredMaterials = materials
    .filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType =
        typeFilter === "all" || material.instrument_type_id?.toString() === typeFilter
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title)
      } else if (sortBy === "date") {
        comparison = new Date(a.uploaded_at || 0).getTime() - new Date(b.uploaded_at || 0).getTime()
      } else if (sortBy === "type") {
        comparison = (a.instrument_type?.name || "").localeCompare(b.instrument_type?.name || "")
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const groupedMaterials = () => {
    if (groupBy === "none") {
      return { "All Materials": filteredMaterials }
    } else if (groupBy === "type") {
      return filteredMaterials.reduce((acc, material) => {
        const key = material.instrument_type?.name || "No Type"
        if (!acc[key]) acc[key] = []
        acc[key].push(material)
        return acc
      }, {} as Record<string, LibraryMaterial[]>)
    }
    return { "All Materials": filteredMaterials }
  }

  const materialGroups = groupedMaterials()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Library</h1>
            <p className="text-muted-foreground mt-1">Educational materials and resources for music learning</p>
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
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingMaterial ? "Edit Library Material" : "Add New Library Material"}</DialogTitle>
                  <DialogDescription>
                    {editingMaterial ? "Update material information" : "Add a new educational resource"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="e.g., Beginner Violin Exercises"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the material..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="instrument_type_id">Instrument Type (Optional)</Label>
                    <Select
                      value={formData.instrument_type_id}
                      onValueChange={(value) => setFormData({ ...formData, instrument_type_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an instrument type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No specific type</SelectItem> {/* Updated value prop to '0' */}
                        {instrumentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file_url">File URL</Label>
                    <Input
                      id="file_url"
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://example.com/material.pdf"
                    />
                    <p className="text-xs text-muted-foreground">
                      Upload your file to cloud storage and paste the link here
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingMaterial ? "Update Material" : "Add Material"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {instrumentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="date">Upload Date</SelectItem>
                <SelectItem value="type">Instrument Type</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Group By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="type">Group by Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(materialGroups).map(([groupName, groupMaterials]) => (
                <div key={groupName}>
                  {groupBy !== "none" && (
                    <h3 className="text-lg font-semibold mb-3 text-foreground">{groupName}</h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupMaterials.length === 0 ? (
                      <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No library materials found</p>
                        </CardContent>
                      </Card>
                    ) : (
                      groupMaterials.map((material) => (
                        <Card key={material.id} className="hover:border-primary/30 transition-colors">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1">
                                <CardTitle className="text-lg">{material.title}</CardTitle>
                                <CardDescription>
                                  {material.instrument_type?.name && (
                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                      {material.instrument_type.name}
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <FileText className="h-4 w-4 text-blue-500" />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {material.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                              )}
                              {material.uploaded_at && (
                                <p className="text-xs text-muted-foreground">
                                  Uploaded: {new Date(material.uploaded_at).toLocaleDateString()}
                                </p>
                              )}
                              <div className="flex gap-2 pt-2">
                                {material.file_url && (
                                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                                    <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-3 w-3 mr-1" />
                                      View
                                    </a>
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleEdit(material)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10 bg-transparent"
                                  onClick={() => handleDelete(material.id)}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
