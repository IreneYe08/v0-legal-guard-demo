"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Toast } from "@/components/toast"
import { ContextualPopup } from "@/components/contextual-popup"
import { Sidebar } from "@/components/sidebar"
import { AuthDialog } from "@/components/auth-dialog"
import { OnboardingDialog } from "@/components/onboarding-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge" // Added import for Badge component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, X } from "lucide-react"

const snoozeToast = (hours = 24) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("lg.toast.snooze", String(Date.now() + hours * 3600 * 1000))
  }
}

const canShowToast = () => {
  if (typeof window === "undefined") return false
  const snoozeUntil = Number(localStorage.getItem("lg.toast.snooze") || 0)
  const domain = window.location.hostname
  const isDomainSuppressed = localStorage.getItem(`lg_toast_suppressed:${domain}`) === "true"
  return snoozeUntil < Date.now() && !isDomainSuppressed
}

const isContextDisabled = () => {
  if (typeof window === "undefined") return false
  return localStorage.getItem("lg.context.disabled") === "true"
}

const detectRiskSentences = () => {
  return [
    {
      text: "reverse engineer, decompile, or disassemble the Software",
      risk: "high" as const,
    },
    {
      text: "use the Software for any unlawful purpose",
      risk: "high" as const,
    },
    {
      text: "In no event shall Licensor be liable for any indirect, incidental, special, consequential, or punitive damages",
      risk: "high" as const,
    },
    {
      text: "non-transferable, limited license",
      risk: "medium" as const,
    },
    {
      text: "Your rights under this Agreement will terminate automatically without notice",
      risk: "medium" as const,
    },
  ]
}

const track = (event: string, payload?: Record<string, any>) => {
  console.log("[v0] Track event:", event, payload)
}

export default function LegalGuardDemo() {
  const [showToast, setShowToast] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [selectedText, setSelectedText] = useState("")
  const [highlightsActive, setHighlightsActive] = useState(false) // Added state for tracking highlights
  const { toast } = useToast()
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const showAuthButtons = false

  useEffect(() => {
    const timer = setTimeout(() => {
      if (canShowToast()) {
        setShowToast(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [showToast])

  useEffect(() => {
    const handleSelection = () => {
      if (isContextDisabled()) return

      const selection = window.getSelection()
      if (selection && selection.toString().length > 10) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY + 10,
        })
        setSelectedText(selection.toString())

        if (showSidebar) {
          toast({
            description: "Clause context updated in sidebar",
            duration: 2000,
          })
        } else {
          setShowPopup(true)
        }
      }
    }

    document.addEventListener("mouseup", handleSelection)
    return () => document.removeEventListener("mouseup", handleSelection)
  }, [showSidebar, toast])

  const handleOpenSidebar = (action?: string) => {
    setSelectedAction(action || null)
    setShowSidebar(true)
    setShowToast(false)
    setShowPopup(false)
  }

  const handleToastDismiss = () => {
    snoozeToast(24)
    setShowToast(false)
  }

  const handleToastOpen = () => {
    snoozeToast(24)
    handleOpenSidebar()
  }

  const handleDisableContext = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lg.context.disabled", "true")
    }
    setShowPopup(false)
    toast({
      description: "Contextual pop-up disabled. You can re-enable it in Settings.",
      duration: 3000,
    })
  }

  const handleExplainQuickly = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().length > 10) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 10,
      })
      setSelectedText(selection.toString())
      setShowPopup(true)
      setShowToast(false)
    } else {
      toast({
        description: "Select a clause to analyze",
        duration: 3000,
      })
    }
  }

  const handleSeeFullAnalysis = () => {
    setShowSidebar(true)
    setShowToast(false)
    setSelectedAction("summarize")
  }

  const handleAuthSuccess = () => {
    const onboardingDone = localStorage.getItem("lg_onboarding_done")
    if (!onboardingDone) {
      setShowOnboarding(true)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    router.push("/dashboard")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const applyHighlights = () => {
    const riskySentences = detectRiskSentences()
    const contentElements = document.querySelectorAll(".prose p")

    contentElements.forEach((element) => {
      let html = element.innerHTML

      riskySentences.forEach((sentence) => {
        const regex = new RegExp(`(${sentence.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
        const riskClass = sentence.risk === "high" ? "risk-high" : "risk-medium"
        html = html.replace(regex, `<span class="${riskClass}" data-risk-highlight>$1</span>`)
      })

      element.innerHTML = html
    })

    setHighlightsActive(true)
    track("highlight_applied", { count: riskySentences.length })
    toast({
      description: "Highlighted key risk sentences on this page.",
      duration: 3000,
    })
  }

  const clearHighlights = () => {
    const highlights = document.querySelectorAll("[data-risk-highlight]")
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode
      if (parent) {
        parent.replaceChild(document.createTextNode(highlight.textContent || ""), highlight)
        parent.normalize()
      }
    })

    setHighlightsActive(false)
    track("highlight_cleared")
    toast({
      description: "Highlights cleared.",
      duration: 2000,
    })
  }

  const handleHighlightRisks = () => {
    applyHighlights()
    setShowToast(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">LegalGuard</span>
            <Badge variant="outline" className="ml-2 text-xs">
              MVP
            </Badge>
          </div>
          {showAuthButtons && (
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push("/dashboard")}>Dashboard</DropdownMenuItem>
                      <DropdownMenuItem>Preferences</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => setShowAuthDialog(true)}>
                    Log in
                  </Button>
                  <Button onClick={() => setShowAuthDialog(true)}>Sign up</Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Software License Agreement</h1>
          <p className="text-muted-foreground">Last updated: January 15, 2025</p>
        </header>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Grant of License</h2>
            <p className="text-foreground/80 leading-relaxed" id="legal-text">
              Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive,
              non-transferable, limited license to use the Software solely for Licensee's internal business purposes.
              This license does not include the right to sublicense, distribute, or create derivative works based on the
              Software without prior written consent from the Licensor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Restrictions</h2>
            <p className="text-foreground/80 leading-relaxed">
              Licensee shall not: (a) reverse engineer, decompile, or disassemble the Software; (b) remove any
              proprietary notices or labels on the Software; (c) use the Software for any unlawful purpose; or (d)
              transfer, rent, lease, or lend the Software to any third party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Intellectual Property Rights</h2>
            <p className="text-foreground/80 leading-relaxed">
              The Software and all worldwide intellectual property rights therein are the exclusive property of Licensor
              and its licensors. All rights in and to the Software not expressly granted to Licensee in this Agreement
              are reserved by Licensor.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitation of Liability</h2>
            <p className="text-foreground/80 leading-relaxed">
              In no event shall Licensor be liable for any indirect, incidental, special, consequential, or punitive
              damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
              resulting from your access to or use of or inability to access or use the Software.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Termination</h2>
            <p className="text-foreground/80 leading-relaxed">
              This Agreement is effective until terminated. Your rights under this Agreement will terminate
              automatically without notice if you fail to comply with any term of this Agreement. Upon termination, you
              must cease all use of the Software and destroy all copies.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-2xl">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Try highlighting any paragraph above to see LegalGuard's
            contextual assistance in action! Press <kbd className="px-2 py-1 bg-background rounded border">E</kbd> for
            Explain quickly or <kbd className="px-2 py-1 bg-background rounded border">S</kbd> for See full analysis.
          </p>
        </div>
      </div>

      {showToast && (
        <Toast
          onClose={() => setShowToast(false)}
          onHighlightRisks={handleHighlightRisks}
          onSeeFullAnalysis={handleSeeFullAnalysis}
          docType="License"
        />
      )}

      {showPopup && (
        <ContextualPopup
          position={popupPosition}
          onAction={handleOpenSidebar}
          onClose={() => setShowPopup(false)}
          onDisable={handleDisableContext}
          onOpenSidebar={() => handleOpenSidebar()}
          riskLevel="medium"
        />
      )}

      {showSidebar && (
        <Sidebar onClose={() => setShowSidebar(false)} initialAction={selectedAction} selectedText={selectedText} />
      )}

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} onSuccess={handleAuthSuccess} />
      <OnboardingDialog open={showOnboarding} onComplete={handleOnboardingComplete} />

      {highlightsActive && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <Button onClick={clearHighlights} variant="secondary" className="shadow-lg hover-lift rounded-xl" size="sm">
            <X className="w-4 h-4 mr-2" />
            Clear highlights
          </Button>
        </div>
      )}
    </div>
  )
}
