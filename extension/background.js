chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'analyzePage') {
        analyzeDocument(request.content)
            .then(result => {
                sendResponse({
                    success: true,
                    shouldShowToast: true,
                    docType: result.docType,
                    analysisData: result
                })
            })
            .catch(error => {
                console.error('Analysis Fail:', error)
                sendResponse({ success: false, error: error.message })
            })
        return true
    }

    if (request.action === 'highlightRisks') {
        console.log('Highlight Risk:', request.data)
        sendResponse({ success: true })
        return true
    }

    // ❌ 删除这整个 if 块 - 不再需要打开新标签页
    // if (request.action === 'openFullAnalysis') { ... }

    // 添加 openSidePanel 处理
    if (request.action === 'openSidePanel') {
        chrome.sidePanel.open({ windowId: sender.tab.windowId })
        sendResponse({ success: true })
        return true
    }
})

// click button and open side panel
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId })
})

// TODO: Engineer 需要在这里实现真实的 Google API 调用
async function analyzeDocument(content) {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    const docType = detectDocumentType(content)
    return {
        docType: docType,
        summary: `This is a summary of a ${docType}document。The following key clauses were detected...`,
        risks: [
            { text: "Perpetual Confidentiality Obligation", severity: "high" },
            { text: "Unilateraal Indemnification Clause", severity: "medium" },
            { text: "Intellectual Property Assignment", severity: "high" }
        ],
        fullAnalysis: `View Full Analysis:\n\nDocType: ${docType}\n\n${content.substring(0, 800)}...`
    }
}

function detectDocumentType(content) {
    const lower = content.toLowerCase()
    if (lower.includes('non-disclosure') || lower.includes('nda')) return 'NDA'
    if (lower.includes('license agreement') || lower.includes('software license')) return 'License'
    if (lower.includes('privacy policy') || lower.includes('personal data')) return 'Privacy'
    return 'Other'
}