// extension/content.js
// 注入到网页中运行

if (!window.__legalGuardianInjected) {
  window.__legalGuardianInjected = true
  
  function detectLegalDocument() {
    const text = document.body.innerText.toLowerCase()
    const keywords = [
      'agreement', 'terms of service', 'privacy policy',
      'license', 'nda', 'non-disclosure', 'confidential',
      'terms and conditions', 'end user license'
    ]
    
    const hasKeyword = keywords.some(kw => text.includes(kw))
    const isLongEnough = text.length > 500
    
    return hasKeyword && isLongEnough
  }

  function isToastSuppressed() {
    const domain = window.location.hostname
    return localStorage.getItem(`lg_toast_suppressed:${domain}`) === 'true'
  }

  function showToast(docType, analysisData) {
    const existingToast = document.getElementById('lg-toast-container')
    if (existingToast) existingToast.remove()

    const container = document.createElement('div')
    container.id = 'lg-toast-container'
    container.className = 'lg-toast-wrapper'
    
    container.innerHTML = `
      <div class="lg-toast">
        <div class="lg-toast-content">
          <div class="lg-toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div class="lg-toast-body">
            <h3 class="lg-toast-title">Legal terms detected</h3>
            <p class="lg-toast-message">${getToastMessage(docType)}</p>
            <div class="lg-toast-actions">
              <button class="lg-btn lg-btn-primary" id="lg-highlight-btn">
                Highlight key risks
              </button>
              <button class="lg-btn lg-btn-ghost" id="lg-analysis-btn">
                See full analysis
              </button>
            </div>
            <button class="lg-toast-dismiss" id="lg-dismiss-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m15 9-6 6m0-6 6 6"></path>
              </svg>
              Dismiss for this site
            </button>
          </div>
          <button class="lg-toast-close" id="lg-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(container)
    
    document.getElementById('lg-close-btn').addEventListener('click', () => {
      container.remove()
    })
    
    document.getElementById('lg-dismiss-btn').addEventListener('click', () => {
      localStorage.setItem(`lg_toast_suppressed:${window.location.hostname}`, 'true')
      container.remove()
    })
    
    document.getElementById('lg-highlight-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'highlightRisks', data: analysisData })
      alert('Risk highlighting feature coming soon!')
    })
    
    document.getElementById('lg-analysis-btn').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openFullAnalysis', data: analysisData })
    })
  }

  function getToastMessage(docType) {
    const messages = {
      NDA: "Potential confidentiality clause detected — want to check what you're agreeing to?",
      License: "License terms detected — review key restrictions before you proceed.",
      Privacy: "We found privacy terms — see what data use means for you.",
      Other: "Legal terms detected — need a quick check?"
    }
    return messages[docType] || messages.Other
  }

  function init() {
    if (!detectLegalDocument()) return
    if (isToastSuppressed()) return
    
    const pageContent = document.body.innerText
    
    chrome.runtime.sendMessage({
      action: 'analyzePage',
      content: pageContent.substring(0, 10000),
      url: window.location.href
    }, (response) => {
      if (response && response.success && response.shouldShowToast) {
        showToast(response.docType, response.analysisData)
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    setTimeout(init, 500)
  }
}
