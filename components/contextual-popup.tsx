"use client"

import { Wand2, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContextualPopupProps {
  position: { x: number; y: number }
  onAction: (action: string) => void
  onClose: () => void
  onDisable: () => void
}

export function ContextualPopup({ position, onAction, onClose, onDisable }: ContextualPopupProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popup */}
      <div
        className="fixed z-50 animate-scale-in"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="bg-card border border-border rounded-2xl shadow-[0_12px_30px_rgba(20,24,40,0.12)] overflow-hidden">
          <div className="p-2 flex items-center gap-1">
            <Button
              onClick={() => onAction("summarize")}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-accent rounded-lg active:scale-[0.98] transition-transform"
            >
              <Wand2 className="w-4 h-4" />
              Summarize
            </Button>
            <Button
              onClick={() => onAction("explain")}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-accent rounded-lg active:scale-[0.98] transition-transform"
            >
              <FileText className="w-4 h-4" />
              Explain
            </Button>
            <Button
              onClick={() => onAction("risks")}
              size="sm"
              variant="ghost"
              className="gap-2 hover:bg-accent rounded-lg active:scale-[0.98] transition-transform"
            >
              <AlertTriangle className="w-4 h-4" />
              Key Risks
            </Button>
          </div>
          <div className="border-t border-border px-3 py-2 bg-muted/30">
            <button
              onClick={onDisable}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              I don't want this pop-up
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
