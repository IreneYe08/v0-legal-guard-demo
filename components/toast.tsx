"use client"

import { useState, useEffect } from "react"
import { X, Shield, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToastProps {
  onClose: () => void
  onHighlightRisks: () => void // Replaced onExplainQuickly with onHighlightRisks
  onSeeFullAnalysis: () => void
  docType?: "NDA" | "License" | "Privacy" | "Other"
}

const getToastCopy = (docType: "NDA" | "License" | "Privacy" | "Other") => {
  const copyMap = {
    NDA: "Potential confidentiality clause detected — want to check what you're agreeing to?",
    License: "License terms detected — review key restrictions before you proceed.",
    Privacy: "We found privacy terms — see what data use means for you.",
    Other: "Legal terms detected — need a quick check?",
  }
  return copyMap[docType]
}

export function Toast({ onClose, onHighlightRisks, onSeeFullAnalysis, docType = "Other" }: ToastProps) {
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "s" || e.key === "S") {
        onSeeFullAnalysis()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [onSeeFullAnalysis]) // Removed onExplainQuickly from dependencies

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      const domain = window.location.hostname
      localStorage.setItem(`lg_toast_suppressed:${domain}`, "true")
    }
    onClose()
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-6 right-6 z-50 animate-toast-slide-down"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-card border border-border rounded-2xl shadow-[0_12px_30px_rgba(20,24,40,0.12)] p-4 w-96 hover-lift">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">Legal terms detected</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{getToastCopy(docType)}</p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={onHighlightRisks}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98] transition-transform"
              >
                Highlight key risks
              </Button>
              <Button
                onClick={onSeeFullAnalysis}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground rounded-lg active:scale-[0.98] transition-transform"
              >
                See full analysis
              </Button>
            </div>
            <button
              onClick={handleDismiss}
              className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Ban className="w-3 h-3" />
              Dismiss
            </button>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
