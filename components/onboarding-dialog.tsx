"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface OnboardingDialogProps {
  open: boolean
  onComplete: () => void
}

export function OnboardingDialog({ open, onComplete }: OnboardingDialogProps) {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState("en")
  const [privacyMode, setPrivacyMode] = useState("local")
  const [metricsConsent, setMetricsConsent] = useState(false)

  const handleFinish = () => {
    // Save preferences
    localStorage.setItem("lg_onboarding_done", "true")
    localStorage.setItem("lg_language", language)
    localStorage.setItem("lg_privacy_mode", privacyMode)
    localStorage.setItem("lg_metrics_consent", String(metricsConsent))

    // Track event
    track("lg_onboarding_complete", { language, privacyMode, metricsConsent })

    onComplete()
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to LegalGuard</DialogTitle>
          <p className="text-sm text-muted-foreground">Let's personalize your experience</p>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Privacy Mode</Label>
              <RadioGroup value={privacyMode} onValueChange={setPrivacyMode}>
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value="local" id="local" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="local" className="font-medium cursor-pointer">
                      Local-first analysis
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      All processing happens on your device. No data leaves your browser.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <RadioGroupItem value="remote" id="remote" className="mt-1" />
                  <div className="flex-1">
                    <label htmlFor="remote" className="font-medium cursor-pointer">
                      Allow remote processing with minimization
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send minimal data to our servers for enhanced analysis. We never store your documents.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Help us improve</Label>
              <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox
                  id="metrics"
                  checked={metricsConsent}
                  onCheckedChange={(checked) => setMetricsConsent(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="metrics" className="font-medium cursor-pointer">
                    Anonymous product metrics
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Share anonymous usage data to help us improve LegalGuard. You can change this anytime in Settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button onClick={handleFinish}>Finish</Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Track function stub
function track(event: string, payload: Record<string, unknown>) {
  console.log("[v0] Track:", event, payload)
}
