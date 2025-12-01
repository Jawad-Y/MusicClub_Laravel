"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Plus, Search, Download } from "lucide-react"
import { format } from "date-fns"

interface ReportLog {
  id: number
  created_by: number
  type: string
  created_at_report: string
  created_at: string
  updated_at: string
  creator?: {
    id: number
    name: string
  }
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<ReportLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newReport, setNewReport] = useState({
    type: "",
    created_at_report: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getReportsLogs()
      setReports(response.data || [])
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = async () => {
    try {
      await apiClient.createReportLog(newReport)
      setIsCreateDialogOpen(false)
      setNewReport({
        type: "",
        created_at_report: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      })
      fetchReports()
    } catch (error) {
      console.error("Failed to create report:", error)
    }
  }

  const handleDeleteReport = async (id: number) => {
    if (!confirm("Are you sure you want to delete this report?")) return
    try {
      await apiClient.deleteReportLog(id)
      fetchReports()
    } catch (error) {
      console.error("Failed to delete report:", error)
    }
  }

  const handleExportInstruments = async (format: "excel" | "csv") => {
    try {
      const blob =
        format === "excel" ? await apiClient.exportInstrumentsExcel() : await apiClient.exportInstrumentsCsv()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `instruments_export.${format === "excel" ? "xlsx" : "csv"}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Failed to export ${format}:`, error)
      alert(`Failed to export ${format}`)
    }
  }

  const filteredReports = reports.filter((report) => report.type.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading reports...</div>
      </div>
    )
  }

  const canManageReports = ["Admin", "leader", "individual affair"].includes(user?.role?.name || "")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Exports</h1>
          <p className="text-muted-foreground">Manage system reports and export data</p>
        </div>
        {canManageReports && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Report Log
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download instrument inventory data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => handleExportInstruments("excel")} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
            <Button onClick={() => handleExportInstruments("csv")} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Report generation overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Reports</span>
                <span className="font-semibold">{reports.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Your Reports</span>
                <span className="font-semibold">{reports.filter((r) => r.created_by === user?.id).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Logs</CardTitle>
          <CardDescription>History of generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by report type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="font-medium">{report.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Created: {format(new Date(report.created_at_report), "PPp")}</span>
                      {report.creator && <span>By: {report.creator.name}</span>}
                    </div>
                  </div>
                  {canManageReports && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Report Log</DialogTitle>
            <DialogDescription>Record a new report generation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Input
                id="type"
                placeholder="e.g., Monthly Attendance Report"
                value={newReport.type}
                onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="created_at_report">Report Date</Label>
              <Input
                id="created_at_report"
                type="datetime-local"
                value={newReport.created_at_report.replace(" ", "T").slice(0, 16)}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    created_at_report: e.target.value.replace("T", " ") + ":00",
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport} disabled={!newReport.type}>
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
