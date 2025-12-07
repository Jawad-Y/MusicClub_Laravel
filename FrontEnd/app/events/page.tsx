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
import { Calendar, Plus, Pencil, Trash2, MapPin, Users, UserPlus } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Event {
  id: number
  title: string
  description?: string
  date?: string
  location?: string
  created_by: number
}

interface EventParticipant {
  id: number
  event_id: number
  user_id: number
  role?: string
  user?: {
    id: number
    full_name: string
  }
  event?: Event
}

interface User {
  id: number
  full_name: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isParticipantDialogOpen, setIsParticipantDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
  })
  const [participantFormData, setParticipantFormData] = useState({
    event_id: "",
    user_id: "",
    role: "attendee",
  })
  const { toast } = useToast()
  const { isLeader, isClassLeader } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [eventsRes, participantsRes, usersRes] = await Promise.all([
        apiClient.getEvents(),
        apiClient.getEventParticipants(),
        apiClient.getUsers(),
      ])

      setEvents(extractArrayFromResponse(eventsRes))
      setParticipants(extractArrayFromResponse(participantsRes))
      setUsers(extractArrayFromResponse(usersRes))
    } catch (error) {
      console.error("[v0] Error fetching data:", error?.status, error?.statusText, error?.body || error)
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEvent) {
        await apiClient.updateEvent(editingEvent.id, formData)
        toast({ title: "Success", description: "Event updated successfully" })
      } else {
        await apiClient.createEvent(formData)
        toast({ title: "Success", description: "Event created successfully" })
      }
      setIsDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save event", variant: "destructive" })
    }
  }

  const handleParticipantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        event_id: Number.parseInt(participantFormData.event_id),
        user_id: Number.parseInt(participantFormData.user_id),
        role: participantFormData.role,
      }

      await apiClient.createEventParticipant(data)
      toast({ title: "Success", description: "Participant added successfully" })
      setIsParticipantDialogOpen(false)
      setParticipantFormData({ event_id: "", user_id: "", role: "attendee" })
      fetchData()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add participant", variant: "destructive" })
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || "",
      date: event.date || "",
      location: event.location || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return
    try {
      await apiClient.deleteEvent(id)
      toast({ title: "Success", description: "Event deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
    })
  }

  const getEventParticipants = (eventId: number) => {
    return participants.filter((p) => p.event_id === eventId)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Events</h1>
            <p className="text-muted-foreground mt-1">Manage music club events and performances</p>
          </div>
          <div className="flex gap-2">
            {(isLeader() || isClassLeader()) && (
              <>
                <Dialog open={isParticipantDialogOpen} onOpenChange={setIsParticipantDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <UserPlus className="h-4 w-4" />
                      Add Participant
                    </Button>
                  </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleParticipantSubmit}>
                  <DialogHeader>
                    <DialogTitle>Add Event Participant</DialogTitle>
                    <DialogDescription>Assign a participant to an event</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="participant_event">Event</Label>
                      <Select
                        value={participantFormData.event_id}
                        onValueChange={(value) => setParticipantFormData({ ...participantFormData, event_id: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id.toString()}>
                              {event.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="participant_user">User</Label>
                      <Select
                        value={participantFormData.user_id}
                        onValueChange={(value) => setParticipantFormData({ ...participantFormData, user_id: value })}
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
                      <Label htmlFor="participant_role">Role</Label>
                      <Select
                        value={participantFormData.role}
                        onValueChange={(value) => setParticipantFormData({ ...participantFormData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="performer">Performer</SelectItem>
                          <SelectItem value="attendee">Attendee</SelectItem>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Participant</Button>
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
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                    <DialogDescription>
                      {editingEvent ? "Update event information" : "Create a new music club event"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Event Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="e.g., Spring Concert 2025"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the event..."
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Main Auditorium"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingEvent ? "Update Event" : "Create Event"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events
                  .filter((e) => !e.date || new Date(e.date) >= new Date())
                  .sort((a, b) => {
                    if (!a.date) return 1
                    if (!b.date) return -1
                    return new Date(a.date).getTime() - new Date(b.date).getTime()
                  })
                  .map((event) => {
                    const eventParticipants = getEventParticipants(event.id)
                    return (
                      <Card key={event.id} className="hover:border-primary/30 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription>
                                {event.date && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(event.date).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </div>
                                )}
                              </CardDescription>
                            </div>
                            <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                              <Calendar className="h-4 w-4 text-pink-500" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {event.description && <p className="text-sm text-foreground">{event.description}</p>}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {eventParticipants.length} participant{eventParticipants.length !== 1 ? "s" : ""}
                            </div>
                            {(isLeader() || isClassLeader()) && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 bg-transparent"
                                  onClick={() => handleEdit(event)}
                                >
                                  <Pencil className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10 bg-transparent"
                                  onClick={() => handleDelete(event.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                {events.filter((e) => !e.date || new Date(e.date) >= new Date()).length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No upcoming events</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{event.title}</CardTitle>
                    <CardDescription>
                      {event.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.location && <p className="text-sm text-muted-foreground">{event.location}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Participants</CardTitle>
                <CardDescription>All registered event participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No participants registered</p>
                  ) : (
                    participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{participant.user?.full_name}</p>
                          <p className="text-sm text-muted-foreground">Event: {participant.event?.title}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            participant.role === "performer"
                              ? "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                              : participant.role === "volunteer"
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          }`}
                        >
                          {participant.role || "attendee"}
                        </span>
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
