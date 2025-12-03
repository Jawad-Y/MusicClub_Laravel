"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, ChevronRight, ArrowLeft } from "lucide-react"
import apiClient from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Class {
  id: number
  class_name: string
  department_id: number
  class_leader_id?: number
  class_leader?: {
    id: number
    full_name: string
  }
}

interface Department {
  id: number
  department_name: string
  leader?: {
    id: number
    full_name: string
  }
}

export default function DepartmentClassesPage() {
  const params = useParams()
  const router = useRouter()
  const departmentId = Number(params.id)
  const [classes, setClasses] = useState<Class[]>([])
  const [department, setDepartment] = useState<Department | null>(null)
  const [classMembers, setClassMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDepartment()
    fetchClasses()
    fetchClassMembers()
  }, [departmentId])

  const fetchDepartment = async () => {
    try {
      const response = await apiClient.getDepartment(departmentId)
      if (response.success && response.data) {
        setDepartment(response.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching department:", error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await apiClient.getClasses()
      if (response.success && response.data) {
        const filteredClasses = response.data.filter((c: Class) => c.department_id === departmentId)
        setClasses(filteredClasses)
      }
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchClassMembers = async () => {
    try {
      const response = await apiClient.getClassMembers()
      if (response.success && response.data) {
        setClassMembers(response.data)
      }
    } catch (error) {
      console.error("[v0] Error fetching class members:", error)
    }
  }

  const getClassMemberCount = (classId: number) => {
    return classMembers.filter((m) => m.class_id === classId).length
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              {department?.department_name || "Department"} - Classes
            </h1>
            <p className="text-muted-foreground mt-1">View and manage classes in this department</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No classes found in this department</p>
                </CardContent>
              </Card>
            ) : (
              classes.map((classItem) => (
                <Card
                  key={classItem.id}
                  className="hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/classes/${classItem.id}`)}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{classItem.class_name}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Leader: {classItem.class_leader?.full_name || "Not assigned"}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                      <GraduationCap className="h-4 w-4 text-green-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">{getClassMemberCount(classItem.id)} members</div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View Details
                        <ChevronRight className="h-3 w-3" />
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
