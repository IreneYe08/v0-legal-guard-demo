"use client"

import { Sparkles, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContextualPopupProps {
  position: { x: number; y: number }
  onAction: (action: string) => void
  onClose: () => void
}

export function ContextualPopup({ position, onAction, onClose }: ContextualPopupProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div
        className="fixed z-50 animate-fade-in"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="bg-card border border-border rounded-xl shadow-xl p-2 flex items-center gap-1">
          <Button
            onClick={() => onAction("summarize")}
            size="sm"
            variant="ghost"
            className="gap-2 hover:bg-accent rounded-lg"
          >
            <Sparkles className="w-4 h-4" />
            Summarize
          </Button>
          <Button
            onClick={() => onAction("explain")}
            size="sm"
            variant="ghost"
            className="gap-2 hover:bg-accent rounded-lg"
          >
            <FileText className="w-4 h-4" />
            Explain
          </Button>
          <Button
            onClick={() => onAction("risks")}
            size="sm"
            variant="ghost"
            className="gap-2 hover:bg-accent rounded-lg"
          >
            <AlertTriangle className="w-4 h-4" />
            Key Risks
          </Button>
        </div>
      </div>
    </>
  )
}
