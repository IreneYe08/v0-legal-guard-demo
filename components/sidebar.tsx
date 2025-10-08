"use client"

import { useState, useEffect, useRef } from "react"
import { X, Shield, Mic, Send, Sparkles, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface SidebarProps {
  onClose: () => void
  initialAction: string | null
}

const mockResponses = {
  summarize:
    "This license agreement grants you limited, non-exclusive rights to use the software for internal business purposes only. You cannot modify, distribute, or sublicense the software. The licensor retains all intellectual property rights and limits their liability for damages.",
  explain:
    "This is a standard software license agreement that defines how you can use the software. Key points: 1) You get a license to use it, but you don't own it. 2) You can't share it with others or modify it. 3) The company that made it keeps all rights. 4) They're not responsible if something goes wrong. Think of it like renting software rather than buying it.",
  risks:
    "Key risks to be aware of: 1) Limited liability clause means the vendor isn't responsible for business losses. 2) Automatic termination if you breach any terms. 3) No right to modify or create derivative works. 4) Non-transferable license restricts business flexibility. 5) Vendor retains all IP rights, limiting your control.",
}

export function Sidebar({ onClose, initialAction }: SidebarProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialAction) {
      handleQuickPrompt(initialAction)
    }
  }, [initialAction])

  const handleQuickPrompt = (action: string) => {
    setIsLoading(true)
    setResponse("")

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setResponse(
        mockResponses[action as keyof typeof mockResponses] ||
          "Analysis complete. The selected text contains important legal terms that may affect your rights and obligations.",
      )
    }, 1000)
  }

  const handleSend = () => {
    if (!input.trim()) return

    setIsLoading(true)
    setResponse("")

    // Simulate AI response
    setTimeout(() => {
      setIsLoading(false)
      setResponse(
        `Based on your question "${input}", here's what you need to know: This clause is designed to protect the software vendor while limiting your rights as a user. It's important to understand these terms before agreeing to them.`,
      )
      setInput("")
    }, 1000)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real implementation, this would use the Web Speech API
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 animate-fade-in" onClick={onClose} />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 w-[460px] bg-card border-l border-border z-50 flex flex-col animate-slide-in-right shadow-2xl">
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
            <div className="bg-muted rounded-xl p-4 text-sm text-foreground/80 leading-relaxed">
              Subject to the terms and conditions of this Agreement, Licensor hereby grants to Licensee a non-exclusive,
              non-transferable, limited license to use the Software solely for Licensee's internal business purposes...
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleQuickPrompt("summarize")}
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
                Summary
              </Button>
              <Button
                onClick={() => handleQuickPrompt("explain")}
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
              >
                <FileText className="w-4 h-4" />
                Explanation
              </Button>
              <Button
                onClick={() => handleQuickPrompt("risks")}
                variant="outline"
                size="sm"
                className="gap-2 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4" />
                Key Risks
              </Button>
            </div>
          </div>

          {/* Response */}
          {(isLoading || response) && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Analysis</h3>
              <div className="bg-accent rounded-xl p-4">
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

        {/* Footer / Composer */}
        <div className="border-t border-border px-6 py-4 space-y-3">
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
                placeholder="Highlight a passage and ask a question..."
                className="min-h-[80px] resize-none rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs bg-transparent"
                onClick={() => setInput("Can you explain this in simpler terms?")}
              >
                Explain
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs bg-transparent"
                onClick={() => setInput("Explain this like I'm 3 years old")}
              >
                Explain like I'm 3
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mic className="w-4 h-4" />
                {isRecording && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
                )}
              </button>
              <Button
                onClick={handleSend}
                size="sm"
                disabled={!input.trim()}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
              >
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
