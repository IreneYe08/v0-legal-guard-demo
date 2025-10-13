"use client"

import { useState, useEffect, useRef } from "react"
import {
  X,
  Shield,
  Send,
  Settings,
  LayoutGrid,
  List,
  Search,
  Download,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  onClose: () => void
  initialAction: string | null
  selectedText: string
}

const mockRiskItems = [
  {
    id: "1",
    title: "Unlimited Liability Clause",
    category: "Liability",
    risk: "high",
    confidence: 0.92,
    snippet: "Licensee shall be liable for any and all damages...",
    keywords: ["liability", "damages", "unlimited"],
    blocking: true,
  },
  {
    id: "2",
    title: "Automatic Renewal Terms",
    category: "Payment",
    risk: "medium",
    confidence: 0.78,
    snippet: "This agreement will automatically renew unless...",
    keywords: ["renewal", "automatic", "payment"],
    blocking: false,
  },
  {
    id: "3",
    title: "Data Retention Policy",
    category: "Privacy",
    risk: "medium",
    confidence: 0.85,
    snippet: "We may retain your data indefinitely for...",
    keywords: ["data", "retention", "privacy"],
    blocking: false,
  },
  {
    id: "4",
    title: "IP Rights Transfer",
    category: "Intellectual Property",
    risk: "high",
    confidence: 0.88,
    snippet: "All intellectual property created under this agreement...",
    keywords: ["IP", "rights", "transfer"],
    blocking: true,
  },
  {
    id: "5",
    title: "Non-Compete Clause",
    category: "Restrictions",
    risk: "high",
    confidence: 0.81,
    snippet: "Licensee agrees not to compete in any related market...",
    keywords: ["non-compete", "restrictions"],
    blocking: true,
  },
  {
    id: "6",
    title: "Warranty Disclaimer",
    category: "Liability",
    risk: "low",
    confidence: 0.72,
    snippet: "Software is provided 'as is' without warranty...",
    keywords: ["warranty", "disclaimer"],
    blocking: false,
  },
]

const categories = ["Liability", "Payment", "Privacy", "Intellectual Property", "Restrictions"]

const track = (event: string, data?: Record<string, unknown>) => {
  console.log("[v0] Track:", event, data)
}

const mockResponses = {
  summarize:
    "This license agreement grants you limited, non-exclusive rights to use the software for internal business purposes only. You cannot modify, distribute, or sublicense the software. The licensor retains all intellectual property rights and limits their liability for damages.",
  explain:
    "This is a standard software license agreement that defines how you can use the software. Key points: 1) You get a license to use it, but you don't own it. 2) You can't share it with others or modify it. 3) The company that made it keeps all rights. 4) They're not responsible if something goes wrong. Think of it like renting software rather than buying it.",
  risks:
    "Key risks to be aware of: 1) Limited liability clause means the vendor isn't responsible for business losses. 2) Automatic termination if you breach any terms. 3) No right to modify or create derivative works. 4) Non-transferable license restricts business flexibility. 5) Vendor retains all IP rights, limiting your control.",
}

export function Sidebar({ onClose, initialAction, selectedText }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "riskmap">("summary")

  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showContextPopup, setShowContextPopup] = useState(true)
  const [showToastNotif, setShowToastNotif] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // This state is no longer used in the header
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const [viewMode, setViewMode] = useState<"matrix" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRisks, setSelectedRisks] = useState<string[]>(["high", "medium", "low"])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories)
  const [confidenceThreshold, setConfidenceThreshold] = useState<"all" | "0.5" | "0.7">("all")
  const [onlyBlocking, setOnlyBlocking] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([])
  const [hoveredCell, setHoveredCell] = useState<{ category: string; itemId: string } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowContextPopup(localStorage.getItem("lg.context.disabled") !== "true")
      setShowToastNotif(Number(localStorage.getItem("lg.toast.snooze") || 0) < Date.now())

      const savedTab = localStorage.getItem("lg_sidebar_tab")
      if (savedTab && ["summary", "riskmap"].includes(savedTab)) {
        setActiveTab(savedTab as "summary" | "riskmap")
      }

      const savedView = localStorage.getItem("lg_riskmap_view")
      if (savedView === "matrix" || savedView === "list") {
        setViewMode(savedView)
      }

      const savedFilters = localStorage.getItem("lg_riskmap_filters")
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters)
          if (filters.risks) setSelectedRisks(filters.risks)
          if (filters.categories) setSelectedCategories(filters.categories)
          if (filters.confidence) setConfidenceThreshold(filters.confidence)
          if (filters.onlyBlocking !== undefined) setOnlyBlocking(filters.onlyBlocking)
        } catch (e) {
          console.error("Failed to parse saved filters", e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lg_sidebar_tab", activeTab)
      track("lg_sidebar_tab_change", { tab: activeTab })
    }
  }, [activeTab])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lg_riskmap_view", viewMode)
      track("lg_riskmap_view", { mode: viewMode })
    }
  }, [viewMode])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "lg_riskmap_filters",
        JSON.stringify({
          risks: selectedRisks,
          categories: selectedCategories,
          confidence: confidenceThreshold,
          onlyBlocking,
        }),
      )
    }
  }, [selectedRisks, selectedCategories, confidenceThreshold, onlyBlocking])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTab !== "riskmap") {
        onClose()
      }

      if (activeTab !== "riskmap") return

      // `/` to focus search
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }

      // `1` for Matrix view
      if (e.key === "1" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setViewMode("matrix")
      }

      // `2` for List view
      if (e.key === "2" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setViewMode("list")
      }

      // `Esc` to clear selection
      if (e.key === "Escape") {
        setSelectedItems([])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeTab, onClose])

  useEffect(() => {
    track("lg_sidebar_open", {})
  }, [])

  useEffect(() => {
    if (initialAction) {
      handleQuickPrompt(initialAction)
    }
  }, [initialAction])

  const handleQuickPrompt = (action: string) => {
    setActiveTab("summary") // Always set to summary tab for any action
    setIsLoading(true)
    setResponse("")

    setTimeout(() => {
      setIsLoading(false)
      setResponse(
        mockResponses[action as keyof typeof mockResponses] ||
          "Analysis complete. The selected text contains important legal terms that may affect your rights and obligations.",
      )
    }, 900)
  }

  const handleSend = () => {
    if (!input.trim()) return

    setIsLoading(true)
    setResponse("")

    setTimeout(() => {
      setIsLoading(false)
      setResponse(
        `Based on your question "${input}", here's what you need to know: This clause is designed to protect the software vendor while limiting your rights as a user. It's important to understand these terms before agreeing to them.`,
      )
      setInput("")
    }, 900)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  const handleContextPopupToggle = (checked: boolean) => {
    setShowContextPopup(checked)
    if (typeof window !== "undefined") {
      if (checked) {
        localStorage.removeItem("lg.context.disabled")
      } else {
        localStorage.setItem("lg.context.disabled", "true")
      }
    }
  }

  const handleToastToggle = (checked: boolean) => {
    setShowToastNotif(checked)
    if (typeof window !== "undefined") {
      if (checked) {
        localStorage.removeItem("lg.toast.snooze")
      } else {
        localStorage.setItem("lg.toast.snooze", String(Date.now() + 365 * 24 * 3600 * 1000))
      }
    }
  }

  const handleResetTips = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lg.context.disabled")
      localStorage.removeItem("lg.toast.snooze")
      setShowContextPopup(true)
      setShowToastNotif(true)
    }
    toast({
      description: "All tips have been reset.",
      duration: 2000,
    })
    setSettingsOpen(false)
  }

  const handleExport = (format: string) => {
    track("lg_export_clicked", { format, tab: activeTab })
    toast({
      description: `Exporting as ${format}`,
      duration: 2000,
    })
  }

  const filteredItems = mockRiskItems.filter((item) => {
    // Risk filter
    if (!selectedRisks.includes(item.risk)) return false

    // Category filter
    if (!selectedCategories.includes(item.category)) return false

    // Confidence filter
    if (confidenceThreshold === "0.7" && item.confidence < 0.7) return false
    if (confidenceThreshold === "0.5" && item.confidence < 0.5) return false

    // Blocking filter
    if (onlyBlocking && !item.blocking) return false

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()

      // Advanced token search: @category:value
      if (query.startsWith("@category:")) {
        const categorySearch = query.replace("@category:", "").trim()
        return item.category.toLowerCase().includes(categorySearch)
      }

      // Regular search
      return (
        item.title.toLowerCase().includes(query) ||
        item.snippet.toLowerCase().includes(query) ||
        item.keywords.some((k) => k.toLowerCase().includes(query))
      )
    }

    return true
  })

  const groupedItems = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, typeof mockRiskItems>,
  )

  const handleItemAction = (action: string, item: (typeof mockRiskItems)[0]) => {
    track("lg_riskmap_item_open", { action, itemId: item.id })
    toast({
      description: `${action} action for "${item.title}"`,
      duration: 2000,
    })
  }

  const handleBulkExport = (format: string) => {
    track("lg_riskmap_bulk_export", { format, count: selectedItems.length })
    toast({
      description: `Exporting ${selectedItems.length} items as ${format}`,
      duration: 2000,
    })
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedRisks(["high", "medium", "low"])
    setSelectedCategories(categories)
    setConfidenceThreshold("all")
    setOnlyBlocking(false)
    track("lg_riskmap_filter_change", { action: "clear_all" })
  }

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-warning"
      case "low":
        return "text-success"
      default:
        return "text-muted-foreground"
    }
  }

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-warning"
      case "low":
        return "bg-success"
      default:
        return "bg-muted"
    }
  }

  const showAuthButtons = false

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 animate-fade-in" onClick={onClose} />

      {/* Sidebar */}
      <div
        className="fixed right-0 top-0 bottom-0 bg-card border-l border-border z-50 flex flex-col shadow-[0_0_50px_rgba(20,24,40,0.15)] w-[448px]"
        style={{ animation: "slideInRight 180ms ease-out" }}
      >
        <div className="border-b border-muted">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">LegalGuard</span>
            </div>
            <div className="flex items-center gap-2">
              {showAuthButtons && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
                  >
                    Sign up
                  </Button>
                </>
              )}
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="context-popup" className="text-sm">
                        Show contextual pop-up when I highlight text
                      </Label>
                      <Switch
                        id="context-popup"
                        checked={showContextPopup}
                        onCheckedChange={handleContextPopupToggle}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="toast-notif" className="text-sm">
                        Show detection toast on new pages
                      </Label>
                      <Switch id="toast-notif" checked={showToastNotif} onCheckedChange={handleToastToggle} />
                    </div>
                    <Button onClick={handleResetTips} variant="outline" className="w-full bg-transparent">
                      Reset all tips
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-muted">
            <button
              onClick={() => setActiveTab("summary")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "summary"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Summary tab"
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("riskmap")}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "riskmap"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Risk Map tab"
            >
              Risk Map
            </button>
          </div>
        </div>

        {activeTab !== "riskmap" ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-4">
                {/* Summary Card */}
                <Card variant="outline" className="rounded-xl p-3 text-sm text-muted-foreground">
                  <p>{response && activeTab === "summary" ? response : "Summary of this document will appear here."}</p>
                </Card>

                {/* Detected Text Section */}
                <div className="bg-muted/40 rounded-xl p-3 text-sm font-medium">
                  {selectedText ? (
                    <p className="text-foreground">{selectedText}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Select or highlight a clause to see analysis.</p>
                  )}
                </div>

                {/* Analysis Card */}
                <Card className="p-4 rounded-xl shadow-sm">
                  <h4 className="text-sm font-semibold mb-2">Analysis</h4>
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
                    </div>
                  ) : response ? (
                    <p className="text-sm text-foreground/80 leading-relaxed">{response}</p>
                  ) : (
                    <div className="text-muted-foreground text-sm">Waiting for highlight…</div>
                  )}
                </Card>
              </div>
            </ScrollArea>

            {/* Footer/Composer */}
            <div className="border-t border-border px-6 py-4 space-y-3 bg-card">
              <div className="flex items-start gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Ask about the whole document…"
                  className="rounded-xl"
                />
                <Button
                  onClick={handleSend}
                  size="sm"
                  disabled={!input.trim()}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98] transition-transform"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">Demo only. No data is stored.</p>
            </div>
          </>
        ) : (
          <>
            {/* Risk Map Tab - keeping existing implementation */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Controls */}
              <div className="px-6 py-4 space-y-4 border-b border-border">
                {/* View Toggle & Export */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode("matrix")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "matrix"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label="Matrix view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === "list"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedItems.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2 rounded-lg bg-transparent">
                          <Download className="w-4 h-4" />
                          Export ({selectedItems.length})
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleBulkExport("copy")}>Copy to clipboard</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkExport("txt")}>Download as .txt</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkExport("pdf")}>Download as PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      track("lg_riskmap_search", { query: e.target.value })
                    }}
                    placeholder="Search risks... (try @category:liability)"
                    className="pl-9 rounded-xl"
                    aria-label="Search risks"
                  />
                </div>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Filters</span>
                    {(searchQuery ||
                      selectedRisks.length < 3 ||
                      selectedCategories.length < categories.length ||
                      confidenceThreshold !== "all" ||
                      onlyBlocking) && (
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-primary hover:underline"
                        aria-label="Clear all filters"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Risk filters */}
                    {["high", "medium", "low"].map((risk) => (
                      <Badge
                        key={risk}
                        variant={selectedRisks.includes(risk) ? "default" : "outline"}
                        className="cursor-pointer capitalize"
                        onClick={() => {
                          setSelectedRisks((prev) =>
                            prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk],
                          )
                          track("lg_riskmap_filter_change", { type: "risk", value: risk })
                        }}
                      >
                        {risk}
                      </Badge>
                    ))}

                    {/* Category filters */}
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={selectedCategories.includes(cat) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedCategories((prev) =>
                            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
                          )
                          track("lg_riskmap_filter_change", { type: "category", value: cat })
                        }}
                      >
                        {cat}
                      </Badge>
                    ))}

                    {/* Confidence filters */}
                    {["all", "0.5", "0.7"].map((conf) => (
                      <Badge
                        key={conf}
                        variant={confidenceThreshold === conf ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setConfidenceThreshold(conf as "all" | "0.5" | "0.7")
                          track("lg_riskmap_filter_change", { type: "confidence", value: conf })
                        }}
                      >
                        {conf === "all" ? "All confidence" : `≥${conf}`}
                      </Badge>
                    ))}
                  </div>

                  {/* Blocking toggle */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="blocking-only"
                      checked={onlyBlocking}
                      onCheckedChange={(checked) => {
                        setOnlyBlocking(checked as boolean)
                        track("lg_riskmap_filter_change", { type: "blocking", value: checked })
                      }}
                    />
                    <Label htmlFor="blocking-only" className="text-sm cursor-pointer">
                      Only show blocking risks
                    </Label>
                  </div>
                </div>

                {/* Result count */}
                <div className="text-xs text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? "risk" : "risks"} found
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {viewMode === "matrix" ? (
                  <div className="space-y-4">
                    {Object.entries(groupedItems).map(([category, items]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">{category}</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                track("lg_riskmap_item_open", { itemId: item.id, view: "matrix" })
                                toast({
                                  description: `Scrolling to "${item.title}"`,
                                  duration: 2000,
                                })
                              }}
                              onMouseEnter={() => setHoveredCell({ category, itemId: item.id })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`relative h-16 rounded-xl border border-border transition-all hover:scale-105 ${getRiskBgColor(item.risk)}`}
                              style={{ opacity: item.confidence }}
                              aria-label={`${item.title} - ${item.risk} risk, ${Math.round(item.confidence * 100)}% confidence`}
                            >
                              {hoveredCell?.itemId === item.id && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-popover border border-border rounded-xl shadow-lg z-10 text-left">
                                  <div className="text-xs font-medium text-foreground mb-1">{item.title}</div>
                                  <div className="text-xs text-muted-foreground mb-2">
                                    Risk: <span className={getRiskColor(item.risk)}>{item.risk}</span> | Confidence:{" "}
                                    {Math.round(item.confidence * 100)}%
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {item.keywords.slice(0, 3).map((kw) => (
                                      <Badge key={kw} variant="secondary" className="text-xs">
                                        {kw}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedItems).map(([category, items]) => {
                      const highestRisk = items.reduce((max, item) => {
                        const riskLevel = { high: 3, medium: 2, low: 1 }[item.risk] || 0
                        const maxLevel = { high: 3, medium: 2, low: 1 }[max] || 0
                        return riskLevel > maxLevel ? item.risk : max
                      }, "low")

                      const isCollapsed = collapsedCategories.includes(category)

                      return (
                        <div key={category} className="space-y-2">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                            aria-expanded={!isCollapsed}
                            aria-label={`${category} category`}
                          >
                            <div className="flex items-center gap-3">
                              {isCollapsed ? (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium text-foreground">{category}</span>
                              <Badge variant="secondary" className="text-xs">
                                {items.length}
                              </Badge>
                              <div className={`w-2 h-2 rounded-full ${getRiskBgColor(highestRisk)}`} />
                            </div>
                          </button>

                          {!isCollapsed && (
                            <div className="space-y-2 pl-4">
                              {items.map((item) => (
                                <div
                                  key={item.id}
                                  className="border border-border rounded-xl p-4 bg-card hover:shadow-sm transition-shadow"
                                >
                                  <div className="flex items-start gap-3">
                                    {viewMode === "list" && (
                                      <Checkbox
                                        checked={selectedItems.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          setSelectedItems((prev) =>
                                            checked ? [...prev, item.id] : prev.filter((id) => id !== item.id),
                                          )
                                        }}
                                        aria-label={`Select ${item.title}`}
                                      />
                                    )}
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${getRiskBgColor(item.risk)}`} />
                                          <h5 className="text-sm font-medium text-foreground">{item.title}</h5>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-muted-foreground">Confidence:</span>
                                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                              className="h-full bg-primary"
                                              style={{ width: `${item.confidence * 100}%` }}
                                            />
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {Math.round(item.confidence * 100)}%
                                          </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground">{item.snippet}</p>

                                        <div className="flex flex-wrap gap-1">
                                          {item.keywords.map((kw) => (
                                            <Badge key={kw} variant="secondary" className="text-xs">
                                              {kw}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-xs rounded-lg bg-transparent"
                                          onClick={() => handleItemAction("Explain", item)}
                                        >
                                          Explain
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-xs rounded-lg bg-transparent"
                                          onClick={() => handleItemAction("Key Risks", item)}
                                        >
                                          Key Risks
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-xs rounded-lg gap-1 bg-transparent"
                                          onClick={() => handleItemAction("Copy", item)}
                                        >
                                          <Copy className="w-3 h-3" />
                                          Copy
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
