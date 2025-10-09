"use client"

import { useState, useEffect, useRef } from "react"
import { X, Shield, Mic, Send, Wand2, FileText, AlertTriangle, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface SidebarProps {
  onClose: () => void
  initialAction: string | null
  selectedText: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showContextPopup, setShowContextPopup] = useState(true)
  const [showToastNotif, setShowToastNotif] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowContextPopup(localStorage.getItem("lg.context.disabled") !== "true")
      setShowToastNotif(Number(localStorage.getItem("lg.toast.snooze") || 0) < Date.now())
    }
  }, [])

  useEffect(() => {
    if (initialAction) {
      handleQuickPrompt(initialAction)
    }
  }, [initialAction])

  const handleQuickPrompt = (action: string) => {
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

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 animate-fade-in" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-[448px] bg-card border-l border-border z-50 flex flex-col animate-slide-in-right shadow-[0_0_50px_rgba(20,24,40,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">LegalGuard</span>
          </div>
          <div className="flex items-center gap-2">
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
            <Button size="sm" className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
              Sign up
            </Button>
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
                    <Switch id="context-popup" checked={showContextPopup} onCheckedChange={handleContextPopupToggle} />
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Detected Text */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Detected Text</h3>
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-sm text-foreground/80 leading-relaxed font-mono">
              {selectedText ||
                "Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive, non-transferable, limited license to use the Software solely for Licensee's internal business purposes..."}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleQuickPrompt("summarize")}
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg hover:bg-accent active:scale-[0.98] transition-transform"
              >
                <Wand2 className="w-4 h-4" />
                Summary
              </Button>
              <Button
                onClick={() => handleQuickPrompt("explain")}
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg hover:bg-accent active:scale-[0.98] transition-transform"
              >
                <FileText className="w-4 h-4" />
                Explanation
              </Button>
              <Button
                onClick={() => handleQuickPrompt("risks")}
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg hover:bg-accent active:scale-[0.98] transition-transform"
              >
                <AlertTriangle className="w-4 h-4" />
                Key Risks
              </Button>
            </div>
          </div>

          {/* Analysis */}
          {(isLoading || response) && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Analysis</h3>
              <div className="border border-border rounded-2xl p-4 bg-card">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                    <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
                  </div>
                ) : (
                  <p className="text-sm text-foreground/80 leading-relaxed">{response}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Composer (sticky footer) */}
        <div className="border-t border-border px-6 py-4 space-y-3 bg-card">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Highlight a passage and ask a question…"
                className="min-h-[80px] resize-none rounded-2xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs bg-transparent hover:bg-accent active:scale-[0.98] transition-transform"
                onClick={() => setInput(selectedText ? `Explain: ${selectedText}` : "Can you explain this?")}
              >
                Explain
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs bg-transparent hover:bg-accent active:scale-[0.98] transition-transform"
                onClick={() =>
                  setInput(selectedText ? `Explain like I'm 3: ${selectedText}` : "Explain this like I'm 3 years old")
                }
              >
                Explain like I'm 3
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleRecording}
                className={`relative p-2 rounded-lg transition-all active:scale-[0.98] ${
                  isRecording
                    ? "bg-destructive text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="w-4 h-4" />
                {isRecording && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse-glow" />
                )}
              </button>
              <Button
                onClick={handleSend}
                size="sm"
                disabled={!input.trim()}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg active:scale-[0.98] transition-transform"
              >
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">Demo only. No data is stored.</p>
        </div>
      </div>
    </>
  )
}
