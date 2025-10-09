"use client"

import { useState } from "react"
import { X, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ToastProps {
  onClose: () => void
  onOpen: () => void
}

export function Toast({ onClose, onOpen }: ToastProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="fixed top-6 right-6 z-50 animate-slide-down"
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
            <h3 className="text-sm font-semibold text-foreground mb-1">Potential legal terms detected</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We noticed some legal terms on this page. LegalGuard can help you understand them.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button
                onClick={onOpen}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98] transition-transform"
              >
                Open
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground rounded-lg active:scale-[0.98] transition-transform"
              >
                Dismiss
              </Button>
            </div>
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
