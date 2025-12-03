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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Plus, Pencil, Trash2, CalendarIcon, FileText, Upload, CheckCircle } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"

interface TrainingSession {
  id: number
  subject: string
  date: string
}

interface Homework {
  id: number
  session_id: number
  assign_scope: string
  description: string
  due_date?: string
  session?: TrainingSession
}

interface HomeworkSubmission {
  id: number
  homework_id: number
  trainee_id: number
  file_url?: string
  notes?: string
  submitted_at?: string
  homework?: Homework
  trainee?: {
    id: number
    full_name: string
  }
}

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState<Homework[]>([])
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([])
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false)
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null)
  const [formData, setFormData] = useState({
    session_id: "",
    assign_scope: "class",
    description: "",
    due_date: "",
  })
  const [submissionFormData, setSubmissionFormData] = useState({
    homework_id: "",
    notes: "",
    file_url: "",
  })
  const { toast } = useToast()

  // Helper: parse a date-only string (YYYY-MM-DD) into local Date, return null if invalid
  const parseDateOnly = (d?: string | null): Date | null => {
    if (!d || typeof d !== 'string') return null
    const parts = d.split('-')
    if (parts.length === 3) {
      const [y, m, day] = parts.map(Number)
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(day)) {
        return new Date(y, m - 1, day)
      }
    }
    const dt = new Date(d)
    return Number.isNaN(dt.getTime()) ? null : dt
  }

  const formatYMD = (d?: string | null) => {
    const dt = parseDateOnly(d)
    if (!dt) return d || 'TBA'
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const [expandedHomeworks, setExpandedHomeworks] = useState<Set<number>>(new Set())
  const toggleHomeworkExpanded = (id: number) => {
    setExpandedHomeworks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [homeworksRes, submissionsRes, sessionsRes] = await Promise.all([
        apiClient.getHomeworks(),
        apiClient.getHomeworkSubmissions(),
        apiClient.getTrainingSessions(),
      ])

      setHomeworks(extractArrayFromResponse(homeworksRes))
      setSubmissions(extractArrayFromResponse(submissionsRes))
      setSessions(extractArrayFromResponse(sessionsRes))
    } catch (error) {
      console.error("[v0] Error fetching data:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load homework",
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
        session_id: Number.parseInt(formData.session_id),
        assign_scope: formData.assign_scope,
        description: formData.description,
        due_date: formData.due_date || null,
      }

      if (editingHomework) {
        await apiClient.updateHomework(editingHomework.id, data)
        toast({ title: "Success", description: "Homework updated successfully" })
      } else {
        await apiClient.createHomework(data)
        toast({ title: "Success", description: "Homework created successfully" })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save homework", variant: "destructive" })
    }
  }

  const handleSubmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        homework_id: Number.parseInt(submissionFormData.homework_id),
        notes: submissionFormData.notes,
        file_url: submissionFormData.file_url,
        submitted_at: new Date().toISOString(),
      }

      await apiClient.createHomeworkSubmission(data)
      toast({ title: "Success", description: "Homework submitted successfully" })
      setIsSubmissionDialogOpen(false)
      setSubmissionFormData({ homework_id: "", notes: "", file_url: "" })
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to submit homework", variant: "destructive" })
    }
  }

  const handleEdit = (homework: Homework) => {
    setEditingHomework(homework)
    setFormData({
      session_id: homework.session_id.toString(),
      assign_scope: homework.assign_scope,
      description: homework.description,
      due_date: homework.due_date || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this homework?")) return
    try {
      await apiClient.deleteHomework(id)
      toast({ title: "Success", description: "Homework deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete homework", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setEditingHomework(null)
    setFormData({
      session_id: "",
      assign_scope: "class",
      description: "",
      due_date: "",
    })
  }

  const getSubmissionsForHomework = (homeworkId: number) => {
    return submissions.filter((s) => s.homework_id === homeworkId)
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Homework</h1>
            <p className="text-muted-foreground mt-1">Manage homework assignments and track submissions</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isSubmissionDialogOpen} onOpenChange={setIsSubmissionDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Upload className="h-4 w-4" />
                  Submit Homework
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmissionSubmit}>
                  <DialogHeader>
                    <DialogTitle>Submit Homework</DialogTitle>
                    <DialogDescription>Submit your completed homework assignment</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="submission_homework">Homework Assignment</Label>
                      <Select
                        value={submissionFormData.homework_id}
                        onValueChange={(value) => setSubmissionFormData({ ...submissionFormData, homework_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select homework" />
                        </SelectTrigger>
                        <SelectContent>
                          {homeworks.map((hw) => (
                            <SelectItem key={hw.id} value={hw.id.toString()}>
                              {hw.session?.subject} - {hw.description.substring(0, 50)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="file_url">File URL</Label>
                      <Input
                        id="file_url"
                        value={submissionFormData.file_url}
                        onChange={(e) => setSubmissionFormData({ ...submissionFormData, file_url: e.target.value })}
                        placeholder="https://example.com/your-file.pdf"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload your file to a cloud service and paste the link here
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="submission_notes">Notes</Label>
                      <Textarea
                        id="submission_notes"
                        value={submissionFormData.notes}
                        onChange={(e) => setSubmissionFormData({ ...submissionFormData, notes: e.target.value })}
                        placeholder="Additional notes or comments..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Submit Homework</Button>
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
                  Create Homework
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingHomework ? "Edit Homework" : "Create New Homework"}</DialogTitle>
                    <DialogDescription>
                      {editingHomework ? "Update homework assignment" : "Create a new homework assignment"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="session_id">Training Session</Label>
                      <Select
                        value={formData.session_id}
                        onValueChange={(value) => setFormData({ ...formData, session_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a session" />
                        </SelectTrigger>
                        <SelectContent>
                          {sessions.map((session) => (
                            <SelectItem key={session.id} value={session.id.toString()}>
                              {session.subject} - {formatYMD(session.date)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="assign_scope">Assignment Scope</Label>
                      <Select
                        value={formData.assign_scope}
                        onValueChange={(value) => setFormData({ ...formData, assign_scope: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="class">Entire Class</SelectItem>
                          <SelectItem value="trainee">Individual Trainee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="Describe the homework assignment..."
                        rows={4}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="due_date">Due Date (Optional)</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingHomework ? "Update Homework" : "Create Homework"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {homeworks.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No homework assignments</p>
                    </CardContent>
                  </Card>
                        ) : (
                  homeworks.map((homework) => {
                    const submissionCount = getSubmissionsForHomework(homework.id).length
                    const overdue = isOverdue(homework.due_date)
                    const hwSubmissions = getSubmissionsForHomework(homework.id)
                    return (
                      <Card
                        key={homework.id}
                        className={`hover:border-primary/30 transition-colors ${overdue ? "border-red-500/30" : ""}`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex-1">
                              <div className="flex flex-col">
                                <div className="text-2xl font-semibold">{homework.session?.subject || 'Assignment'}</div>
                                <div className="text-sm font-medium text-foreground">{homework.description}</div>
                                <div className="text-sm text-muted-foreground">Due: {formatYMD(homework.due_date)}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${overdue ? 'bg-red-500/10 text-red-500' : 'bg-gray-100 text-gray-700'}`}>
                                {overdue ? 'Overdue' : 'Pending'}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{submissionCount}</span>
                              <button
                                onClick={() => toggleHomeworkExpanded(homework.id)}
                                className="p-2 rounded hover:bg-surface/50"
                                title={expandedHomeworks.has(homework.id) ? 'Collapse submissions' : 'Expand submissions'}
                              >
                                <svg className={`h-4 w-4 transition-transform ${expandedHomeworks.has(homework.id) ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {expandedHomeworks.has(homework.id) ? (
                              hwSubmissions.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No submissions yet for this assignment.</p>
                              ) : (
                                <div className="space-y-2">
                                  {hwSubmissions.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                                      <div className="flex-1">
                                        <p className="font-medium">{s.trainee?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{s.notes}</p>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {s.submitted_at && <div>{formatYMD(s.submitted_at)}</div>}
                                        {s.file_url && (
                                          <a href={s.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )
                            ) : (
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className={`px-2 py-1 rounded ${
                                  homework.assign_scope === "class"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-purple-500/10 text-purple-500"
                                }`}>{homework.assign_scope === "class" ? "Class Assignment" : "Individual"}</span>
                                <span>{submissionCount} submission{submissionCount !== 1 ? "s" : ""}</span>
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 bg-transparent"
                                onClick={() => handleEdit(homework)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:bg-destructive/10 bg-transparent"
                                onClick={() => handleDelete(homework.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Homework Submissions</CardTitle>
                <CardDescription>All submitted homework assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {submissions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No submissions yet</p>
                  ) : (
                    submissions.map((submission) => (
                      <div key={submission.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{submission.trainee?.full_name}</p>
                            <p className="text-sm text-muted-foreground">{submission.homework?.session?.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1">{submission.homework?.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {submission.submitted_at && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {formatYMD(submission.submitted_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        {submission.notes && (
                          <div className="text-sm bg-muted/50 p-2 rounded">
                            <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                            <p>{submission.notes}</p>
                          </div>
                        )}
                        {submission.file_url && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={submission.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View submission file
                            </a>
                          </div>
                        )}
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
