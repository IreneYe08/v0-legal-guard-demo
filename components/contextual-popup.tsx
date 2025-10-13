"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Wand2, FileText, AlertTriangle, Pin, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ContextualPopupProps {
  position: { x: number; y: number }
  onAction: (action: string) => void
  onClose: () => void
  onDisable: () => void
  onOpenSidebar: () => void
  riskLevel?: "low" | "medium" | "high"
}

const track = (event: string, data?: Record<string, unknown>) => {
  console.log("[v0] Track:", event, data)
}

export function ContextualPopup({
  position,
  onAction,
  onClose,
  onDisable,
  onOpenSidebar,
  riskLevel = "medium",
}: ContextualPopupProps) {
  const [followUpInput, setFollowUpInput] = useState("")
  const [qaHistory, setQaHistory] = useState<Array<{ question: string; answer: string }>>([])
  const [isPinned, setIsPinned] = useState(false)
  const [dragPosition, setDragPosition] = useState(position)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentResult, setCurrentResult] = useState("")
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pinned = sessionStorage.getItem("lg_popup_pinned") === "true"
      setIsPinned(pinned)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  useEffect(() => {
    track("lg_popup_open", { riskLevel })
  }, [riskLevel])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPinned) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setDragPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleAction = (action: string) => {
    track(`lg_popup_action_${action}`, { riskLevel })
    setCurrentResult(`${action.charAt(0).toUpperCase() + action.slice(1)} result will appear here...`)
    onAction(action)
  }

  const handleFollowUpSubmit = () => {
    if (!followUpInput.trim()) return

    track("lg_popup_followup_sent", { question: followUpInput, riskLevel })

    const mockAnswer = `Answer to "${followUpInput}": This is a simulated response to your question.`
    setQaHistory([...qaHistory, { question: followUpInput, answer: mockAnswer }])
    setFollowUpInput("")
  }

  const handlePinToggle = () => {
    const newPinned = !isPinned
    setIsPinned(newPinned)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("lg_popup_pinned", String(newPinned))
    }
    if (newPinned) {
      setDragPosition(position)
    }
  }

  const getRiskBadgeVariant = () => {
    switch (riskLevel) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const currentPosition = isPinned ? dragPosition : position

  return (
    <>
      {/* Backdrop - only show if not pinned */}
      {!isPinned && <div className="fixed inset-0 z-40" onClick={onClose} />}

      {/* Popup */}
      <div
        ref={popupRef}
        className={`fixed z-50 ${isPinned ? "cursor-move shadow-2xl" : "animate-scale-in"}`}
        style={{
          left: `${currentPosition.x}px`,
          top: `${currentPosition.y}px`,
          transform: isPinned ? "none" : "translateX(-50%)",
          transition: isPinned && !isDragging ? "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" : "none",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="bg-card border border-border rounded-2xl shadow-[0_12px_30px_rgba(20,24,40,0.12)] overflow-hidden max-w-md">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
            <Badge variant={getRiskBadgeVariant()} className="text-xs capitalize">
              {riskLevel} risk
            </Badge>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePinToggle}
                className={`p-1.5 rounded-lg transition-colors ${
                  isPinned ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
                aria-label={isPinned ? "Unpin popup" : "Pin popup"}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              {isPinned && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Close popup"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-2 flex items-center gap-1">
            <Button
              onClick={() => handleAction("summarize")}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-accent rounded-lg active:scale-[0.98] transition-transform"
            >
              <Wand2 className="w-4 h-4" />
              Summarize
            </Button>
            <Button
              onClick={() => handleAction("explain")}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-accent rounded-lg active:scale-[0.98] transition-transform"
            >
              <FileText className="w-4 h-4" />
              Explain
            </Button>
            <Button
              onClick={() => handleAction("risks")}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-accent rounded-lg active:scale-[0.98] transition-transform"
            >
              <AlertTriangle className="w-4 h-4" />
              Key Risks
            </Button>
          </div>

          {currentResult && (
            <div className="px-3 py-2 border-t border-border bg-muted/10">
              <p className="text-xs text-foreground/80">{currentResult}</p>
            </div>
          )}

          {qaHistory.length > 0 && (
            <div className="px-3 py-2 border-t border-border bg-muted/10 space-y-2 max-h-48 overflow-y-auto">
              {qaHistory.map((qa, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-xs font-medium text-foreground">Q: {qa.question}</p>
                  <p className="text-xs text-muted-foreground">A: {qa.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="px-3 py-2 border-t border-border">
            <Input
              value={followUpInput}
              onChange={(e) => setFollowUpInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleFollowUpSubmit()
                }
              }}
              placeholder="Ask a specific question about this clause…"
              className="text-xs h-8 rounded-lg"
            />
          </div>

          <div className="border-t border-border px-3 py-2 bg-muted/30 flex items-center justify-between">
            <button
              onClick={onDisable}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              I don't want this pop-up
            </button>
            <button
              onClick={onOpenSidebar}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              See full analysis
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
