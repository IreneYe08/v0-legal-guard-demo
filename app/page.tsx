"use client"

import { useState, useEffect } from "react"
import { Toast } from "@/components/toast"
import { ContextualPopup } from "@/components/contextual-popup"
import { Sidebar } from "@/components/sidebar"

export default function LegalGuardDemo() {
  const [showToast, setShowToast] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  // Show toast after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Auto-hide toast after 8 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [showToast])

  // Simulate text selection on the legal paragraph
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.toString().length > 10) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + window.scrollY + 10,
        })
        setShowPopup(true)
      }
    }

    document.addEventListener("mouseup", handleSelection)
    return () => document.removeEventListener("mouseup", handleSelection)
  }, [])

  const handleOpenSidebar = (action?: string) => {
    setSelectedAction(action || null)
    setShowSidebar(true)
    setShowToast(false)
    setShowPopup(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mock webpage content */}
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
            contextual assistance in action!
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && <Toast onClose={() => setShowToast(false)} onOpen={handleOpenSidebar} />}

      {/* Contextual Popup */}
      {showPopup && (
        <ContextualPopup position={popupPosition} onAction={handleOpenSidebar} onClose={() => setShowPopup(false)} />
      )}

      {/* Sidebar */}
      {showSidebar && <Sidebar onClose={() => setShowSidebar(false)} initialAction={selectedAction} />}
    </div>
  )
}
