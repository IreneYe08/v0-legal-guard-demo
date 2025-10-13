"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  FileText,
  AlertTriangle,
  Download,
  Star,
  Search,
  ExternalLink,
  Copy,
  Settings,
  Crown,
} from "lucide-react"

// Mock data
const mockAnalyses = [
  {
    id: "1",
    title: "Software License Agreement",
    domain: "example.com",
    scannedAt: "2025-01-15 14:30",
    maxRisk: "high",
  },
  {
    id: "2",
    title: "Privacy Policy",
    domain: "acme.io",
    scannedAt: "2025-01-14 09:15",
    maxRisk: "medium",
  },
  {
    id: "3",
    title: "Terms of Service",
    domain: "startup.co",
    scannedAt: "2025-01-13 16:45",
    maxRisk: "low",
  },
]

const mockAlerts = [
  {
    id: "1",
    title: "Unlimited Liability",
    snippet: "In no event shall Licensor be liable for any indirect, incidental...",
    risk: "high",
  },
  {
    id: "2",
    title: "Perpetual License",
    snippet: "This license grants perpetual rights to use, modify, and distribute...",
    risk: "high",
  },
]

const mockHighlights = [
  {
    id: "1",
    text: "Subject to the terms and conditions of this Agreement...",
    category: "Usage",
  },
  {
    id: "2",
    text: "Licensee shall not reverse engineer, decompile...",
    category: "Restrictions",
  },
]

const mockExports = [
  { id: "1", title: "Software License Analysis", format: "PDF", date: "2025-01-15" },
  { id: "2", title: "Privacy Policy Summary", format: "TXT", date: "2025-01-14" },
]

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else {
      // Track dashboard view
      track("lg_dashboard_view", {})
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const filteredAnalyses = mockAnalyses.filter((analysis) => {
    const matchesSearch =
      analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.domain.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = riskFilter === "all" || analysis.maxRisk === riskFilter
    return matchesSearch && matchesRisk
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your scans, risks, and saved highlights</p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Scanned</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+20%</span> from last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Clauses</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingDown className="h-3 w-3 text-red-500" />
                <span className="text-red-500">-12%</span> from last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exports</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">Total exports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Notes</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">16</div>
              <p className="text-xs text-muted-foreground mt-1">Highlighted clauses</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>Documents you've scanned recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search analyses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All risks</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredAnalyses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Scanned at</TableHead>
                        <TableHead>Max Risk</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAnalyses.map((analysis) => (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium">{analysis.title}</TableCell>
                          <TableCell>{analysis.domain}</TableCell>
                          <TableCell className="text-muted-foreground">{analysis.scannedAt}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                analysis.maxRisk === "high"
                                  ? "destructive"
                                  : analysis.maxRisk === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              <span
                                className={`inline-block w-2 h-2 rounded-full mr-1 ${
                                  analysis.maxRisk === "high"
                                    ? "bg-red-500"
                                    : analysis.maxRisk === "medium"
                                      ? "bg-amber-500"
                                      : "bg-green-500"
                                }`}
                              />
                              {analysis.maxRisk}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                track("lg_dashboard_open_doc", { id: analysis.id })
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No analyses yet — run your first scan from the sidebar.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Heat Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Heat Overview</CardTitle>
                <CardDescription>Distribution of risks across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {["Usage", "IP", "Liability", "Termination", "Privacy", "Payment", "Governing Law", "Misc"].map(
                    (category) => (
                      <TooltipProvider key={category}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="aspect-square rounded-lg bg-gradient-to-br from-red-500/20 to-amber-500/20 flex items-center justify-center text-xs font-medium cursor-pointer hover:scale-105 transition-transform">
                              {category}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{category}</p>
                            <p className="text-xs text-muted-foreground">3 high, 5 medium, 2 low</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Alerts Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Blocking Risks</CardTitle>
                <CardDescription>Critical clauses requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <Badge variant="destructive" className="text-xs">
                        {alert.risk}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.snippet}</p>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                      View clause
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Saved Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Highlights</CardTitle>
                <CardDescription>Your starred clauses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockHighlights.map((highlight) => (
                  <div key={highlight.id} className="rounded-lg border p-3 space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {highlight.category}
                    </Badge>
                    <p className="text-xs text-muted-foreground line-clamp-2">{highlight.text}</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Explain
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(highlight.text)
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          track("lg_dashboard_export_click", { format: "txt" })
                        }}
                      >
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Exports History */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Exports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockExports.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{exp.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {exp.format} • {exp.date}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Usage and Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Usage & Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Scans used</span>
                    <span className="font-medium">12 / 50</span>
                  </div>
                  <Progress value={24} />
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="privacy-mode" className="text-sm">
                    Privacy Mode
                  </Label>
                  <Switch
                    id="privacy-mode"
                    onCheckedChange={(checked) => {
                      track("lg_pref_change", { key: "privacy_mode", value: checked ? "local" : "remote" })
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="toast-suppress" className="text-sm">
                    Suppress Toasts
                  </Label>
                  <Switch id="toast-suppress" />
                </div>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Settings className="mr-2 h-4 w-4" />
                  All Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Track function stub
function track(event: string, payload: Record<string, unknown>) {
  console.log("[v0] Track:", event, payload)
}
