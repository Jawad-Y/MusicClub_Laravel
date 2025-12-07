"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, Calendar, Shield } from "lucide-react"
import { format } from "date-fns"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  })

  // Sync form data with user data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user?.full_name || "",
        email: user?.email || "",
        phone: (user as any)?.phone || user?.phone_number || "",
      })
    }
  }, [user])

  const handleUpdateProfile = async () => {
    try {
      setLoading(true)
      // Construct payload with multiple field keys to be compatible with backend
      const payload: any = {
        // preferred keys
        full_name: (profileData as any).full_name,
        email: (profileData as any).email,
        // include both possible phone fields
        phone: (profileData as any).phone,
        phone_number: (profileData as any).phone,
        // also include legacy 'name' in case backend expects it
        name: (profileData as any).full_name,
      }

      const response = await api.updateUser(user?.id, payload)

      // apiClient returns parsed body (often an ApiResponse). Handle common shapes.
      const success = response?.success === true || (response as any)?.data
      const updatedUser = (response as any)?.data || response
      if (success) {
        setUser(updatedUser)
        alert("Profile updated successfully!")
      } else {
        console.error("Unexpected response updating profile:", response)
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      // If error is a structured object from api-client, show details
      if (error && typeof error === "object") {
        const status = (error as any).status || "unknown"
        const body = (error as any).body || (error as any).message || JSON.stringify(error)
        // Try extract validation messages
        let message = `Status: ${status}`
        try {
          if (body && typeof body === "object") {
            if (body.errors) {
              const errs = Object.values(body.errors)
                .flat()
                .slice(0, 5)
                .join("; ")
              message += ` - ${errs}`
            } else if (body.message) {
              message += ` - ${body.message}`
            } else {
              message += ` - ${JSON.stringify(body)}`
            }
          } else {
            message += ` - ${body}`
          }
        } catch (e) {
          message += " - Failed to parse error body"
        }
        alert(`Failed to update profile: ${message}`)
      } else {
        alert("Failed to update profile")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      alert("Passwords do not match")
      return
    }
    try {
      setLoading(true)
      await api.post("/change-password", {
        current_password: passwordData.current_password,
        new_password: passwordData.password,
      })
      setPasswordData({
        current_password: "",
        password: "",
        password_confirmation: "",
      })
      alert("Password updated successfully!")
    } catch (error) {
      console.error("Failed to update password:", error)
      alert("Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
     <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>

        <div className="flex items-center gap-2 mt-3">
          <a href="#account" className="px-3 py-1 rounded-md text-sm bg-muted-foreground/5 hover:bg-muted-foreground/10">Account</a>
          <a href="#quick-info" className="px-3 py-1 rounded-md text-sm bg-muted-foreground/5 hover:bg-muted-foreground/10">Quick Info</a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card id="account">
          <CardHeader>
            <CardTitle className="text-lg">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="outline">{user?.role?.role_name}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Joined:</span>
                <span className="text-sm">{user?.created_at ? format(new Date(user.created_at), "PP") : "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2" id="quick-info">
          <CardHeader>
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Full Name</span>
                </div>
                <p className="text-sm text-muted-foreground">{user?.full_name}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <p className="text-sm text-muted-foreground">{(user as any)?.phone || user?.phone_number || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Information</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={(profileData as any).full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={(profileData as any).phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </TabsContent>

            <TabsContent value="password" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={loading}>
                {loading ? "Updating..." : "Change Password"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
