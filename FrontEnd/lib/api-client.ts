const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: any
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token)
        // Also set cookie for middleware
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      } else {
        localStorage.removeItem("auth_token")
        // Remove cookie
        document.cookie = "auth_token=; path=/; max-age=0"
      }
    }
  }

  getToken() {
    return this.token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (options.headers && (options.headers as any).responseType === "blob") {
      if (!response.ok) {
        throw new Error("Export failed")
      }
      return { success: true, data: await response.blob() } as any
    }

    // Try to parse JSON safely; if parsing fails, keep raw text
    let parsedBody: any = null
    try {
      parsedBody = await response.json()
    } catch (e) {
      try {
        parsedBody = await response.text()
      } catch (e2) {
        parsedBody = null
      }
    }

    if (!response.ok) {
      // Throw a structured error so callers can log status and body
      throw {
        status: response.status,
        statusText: response.statusText,
        body: parsedBody,
      }
    }

    return parsedBody
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ""
    return this.request<T>(`${endpoint}${query}`, { method: "GET" })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.post<{ user: any; token: string }>("/login", {
      email,
      password,
    })
    if (response.success && response.data?.token) {
      this.setToken(response.data.token)
    }
    return response
  }

  async logout() {
    try {
      await this.post("/logout")
    } finally {
      this.setToken(null)
    }
  }

  // Users & Roles
  getUsers(params?: any) {
    return this.get("/users", params)
  }

  getUser(id: number) {
    return this.get(`/users/${id}`)
  }

  createUser(data: any) {
    return this.post("/users", data)
  }

  updateUser(id: number, data: any) {
    return this.put(`/users/${id}`, data)
  }

  deleteUser(id: number) {
    return this.delete(`/users/${id}`)
  }

  getRoles() {
    return this.get("/roles")
  }

  createRole(data: any) {
    return this.post("/roles", data)
  }

  updateRole(id: number, data: any) {
    return this.put(`/roles/${id}`, data)
  }

  deleteRole(id: number) {
    return this.delete(`/roles/${id}`)
  }

  // Departments
  getDepartments() {
    return this.get("/departments")
  }

  getDepartment(id: number) {
    return this.get(`/departments/${id}`)
  }

  createDepartment(data: any) {
    return this.post("/departments", data)
  }

  updateDepartment(id: number, data: any) {
    return this.put(`/departments/${id}`, data)
  }

  deleteDepartment(id: number) {
    return this.delete(`/departments/${id}`)
  }

  // Classes
  getClasses() {
    return this.get("/myclasses")
  }

  getClass(id: number) {
    return this.get(`/myclasses/${id}`)
  }

  createClass(data: any) {
    return this.post("/myclasses", data)
  }

  updateClass(id: number, data: any) {
    return this.put(`/myclasses/${id}`, data)
  }

  deleteClass(id: number) {
    return this.delete(`/myclasses/${id}`)
  }

  // Class Members
  getClassMembers(params?: any) {
    return this.get("/classmembers", params)
  }

  createClassMember(data: any) {
    return this.post("/classmembers", data)
  }

  updateClassMember(id: number, data: any) {
    return this.put(`/classmembers/${id}`, data)
  }

  deleteClassMember(id: number) {
    return this.delete(`/classmembers/${id}`)
  }

  // Instruments
  getInstrumentTypes() {
    return this.get("/instrument-types")
  }

  createInstrumentType(data: any) {
    return this.post("/instrument-types", data)
  }

  getInstruments(params?: any) {
    return this.get("/instruments", params)
  }

  getInstrument(id: number) {
    return this.get(`/instruments/${id}`)
  }

  createInstrument(data: any) {
    return this.post("/instruments", data)
  }

  updateInstrument(id: number, data: any) {
    return this.put(`/instruments/${id}`, data)
  }

  deleteInstrument(id: number) {
    return this.delete(`/instruments/${id}`)
  }

  getInstrumentAssignments() {
    return this.get("/instrument-assignments")
  }

  createInstrumentAssignment(data: any) {
    return this.post("/instrument-assignments", data)
  }

  updateInstrumentAssignment(id: number, data: any) {
    return this.put(`/instrument-assignments/${id}`, data)
  }

  deleteInstrumentAssignment(id: number) {
    return this.delete(`/instrument-assignments/${id}`)
  }

  getInstrumentMaintenances() {
    return this.get("/instrument-maintenances")
  }

  createInstrumentMaintenance(data: any) {
    return this.post("/instrument-maintenances", data)
  }

  // Clothing
  getClothingItems() {
    return this.get("/clothing-items")
  }

  createClothingItem(data: any) {
    return this.post("/clothing-items", data)
  }

  updateClothingItem(id: number, data: any) {
    return this.put(`/clothing-items/${id}`, data)
  }

  deleteClothingItem(id: number) {
    return this.delete(`/clothing-items/${id}`)
  }

  getClothingAssignments() {
    return this.get("/clothing-assignments")
  }

  createClothingAssignment(data: any) {
    return this.post("/clothing-assignments", data)
  }

  updateClothingAssignment(id: number, data: any) {
    return this.put(`/clothing-assignments/${id}`, data)
  }

  // Training Sessions
  getTrainingSessions(params?: any) {
    return this.get("/training-sessions", params)
  }

  getTrainingSession(id: number) {
    return this.get(`/training-sessions/${id}`)
  }

  createTrainingSession(data: any) {
    return this.post("/training-sessions", data)
  }

  updateTrainingSession(id: number, data: any) {
    return this.put(`/training-sessions/${id}`, data)
  }

  deleteTrainingSession(id: number) {
    return this.delete(`/training-sessions/${id}`)
  }

  // Session Attendance
  getSessionAttendances(params?: any) {
    return this.get("/session-attendances", params)
  }

  createSessionAttendance(data: any) {
    return this.post("/session-attendances", data)
  }

  updateSessionAttendance(id: number, data: any) {
    return this.put(`/session-attendances/${id}`, data)
  }

  // Homework
  getHomeworks(params?: any) {
    return this.get("/homeworks", params)
  }

  getHomework(id: number) {
    return this.get(`/homeworks/${id}`)
  }

  createHomework(data: any) {
    return this.post("/homeworks", data)
  }

  updateHomework(id: number, data: any) {
    return this.put(`/homeworks/${id}`, data)
  }

  deleteHomework(id: number) {
    return this.delete(`/homeworks/${id}`)
  }

  // Homework Submissions
  getHomeworkSubmissions(params?: any) {
    return this.get("/homework-submissions", params)
  }

  createHomeworkSubmission(data: any) {
    return this.post("/homework-submissions", data)
  }

  updateHomeworkSubmission(id: number, data: any) {
    return this.put(`/homework-submissions/${id}`, data)
  }

  deleteHomeworkSubmission(id: number) {
    return this.delete(`/homework-submissions/${id}`)
  }

  // Performance Reviews
  getPerformanceReviews() {
    return this.get("/performance-reviews")
  }

  createPerformanceReview(data: any) {
    return this.post("/performance-reviews", data)
  }

  updatePerformanceReview(id: number, data: any) {
    return this.put(`/performance-reviews/${id}`, data)
  }

  // Events
  getEvents() {
    return this.get("/events")
  }

  getEvent(id: number) {
    return this.get(`/events/${id}`)
  }

  createEvent(data: any) {
    return this.post("/events", data)
  }

  updateEvent(id: number, data: any) {
    return this.put(`/events/${id}`, data)
  }

  deleteEvent(id: number) {
    return this.delete(`/events/${id}`)
  }

  getEventParticipants(params?: any) {
    return this.get("/event-participants", params)
  }

  createEventParticipant(data: any) {
    return this.post("/event-participants", data)
  }

  // Library Materials
  getLibraryMaterials() {
    return this.get("/library-materials")
  }

  createLibraryMaterial(data: any) {
    return this.post("/library-materials", data)
  }

  updateLibraryMaterial(id: number, data: any) {
    return this.put(`/library-materials/${id}`, data)
  }

  deleteLibraryMaterial(id: number) {
    return this.delete(`/library-materials/${id}`)
  }

  // Memberships
  getMemberships() {
    return this.get("/memberships")
  }

  createMembership(data: any) {
    return this.post("/memberships", data)
  }

  updateMembership(id: number, data: any) {
    return this.put(`/memberships/${id}`, data)
  }

  // Reports
  getReportsLogs() {
    return this.get("/reports-logs")
  }

  createReportLog(data: any) {
    return this.post("/reports-logs", data)
  }

  updateReportLog(id: number, data: any) {
    return this.put(`/reports-logs/${id}`, data)
  }

  deleteReportLog(id: number) {
    return this.delete(`/reports-logs/${id}`)
  }

  // Export endpoints for instruments
  async exportInstrumentsExcel() {
    const response = await fetch(`${this.baseUrl}/instruments/export-excel`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
    if (!response.ok) throw new Error("Export failed")
    return await response.blob()
  }

  async exportInstrumentsCsv() {
    const response = await fetch(`${this.baseUrl}/instruments/export-csv`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
    if (!response.ok) throw new Error("Export failed")
    return await response.blob()
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export const api = apiClient
export default apiClient
