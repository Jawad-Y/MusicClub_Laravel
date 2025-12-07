"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Star, Award } from "lucide-react"
import apiClient from "@/lib/api-client"
import { extractArrayFromResponse } from "@/lib/api-utils"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context" 

interface PerformanceReview {
  id: number
  trainee_id: number
  trainer_id: number
  session_id?: number
  rating?: number
  notes?: string
  trainee?: {
    id: number
    full_name: string
  }
  trainer?: {
    id: number
    full_name: string
  }
}

export default function PerformancePage() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth() // get the current trainer

  useEffect(() => {
    if (user) fetchReviews()
  }, [user])

  const fetchReviews = async () => {
    try {
      const response = await apiClient.getPerformanceReviews()
      const allReviews = extractArrayFromResponse(response)
      // Filter only the reviews for this trainer
      const trainerReviews = allReviews.filter((r: PerformanceReview) => r.trainer_id === user?.id)
      setReviews(trainerReviews)
    } catch (error) {
      console.error("[v0] Error fetching reviews:", error)
      toast({
        title: "Error",
        description: "Failed to load performance reviews",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingColor = (rating?: number) => {
    if (!rating) return "text-gray-500"
    if (rating >= 4) return "text-green-500"
    if (rating >= 3) return "text-blue-500"
    if (rating >= 2) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Reviews</h1>
          <p className="text-muted-foreground mt-1">Track trainee progress and evaluations</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviews.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reviews.length > 0
                      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
                      : "0.0"}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">High Performers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviews.filter((r) => (r.rating || 0) >= 4).length}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Latest performance evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No reviews available</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{review.trainee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">Reviewed by: {review.trainer?.full_name}</p>
                          {review.notes && <p className="text-sm mt-2 bg-muted/50 p-2 rounded">{review.notes}</p>}
                        </div>
                        {review.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating! ? `fill-current ${getRatingColor(review.rating)}` : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}