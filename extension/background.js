// extension/background.js
// 后台服务 - 负责调用 Google API

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
  
  if (request.action === 'openFullAnalysis') {
    chrome.tabs.create({
      url: 'data:text/html,' + encodeURIComponent(`
        <html>
          <head><title>Analysis Results</title></head>
          <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
            <h1>Full Analysis</h1>
            <pre>${JSON.stringify(request.data, null, 2)}</pre>
          </body>
        </html>
      `)
    })
    sendResponse({ success: true })
    return true
  }
})

// TODO: Engineer 需要在这里实现真实的 Google API 调用
async function analyzeDocument(content) {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const docType = detectDocumentType(content)
  
  return {
    docType: docType,
    summary: `这是一份${docType}文档的AI分析摘要。检测到以下关键条款...`,
    risks: [
      { text: "无限期保密义务", severity: "high" },
      { text: "单方面赔偿条款", severity: "medium" },
      { text: "知识产权转让", severity: "high" }
    ],
    fullAnalysis: `完整分析报告:\n\n文档类型: ${docType}\n\n${content.substring(0, 800)}...`
  }
}

function detectDocumentType(content) {
  const lower = content.toLowerCase()
  if (lower.includes('non-disclosure') || lower.includes('nda')) return 'NDA'
  if (lower.includes('license agreement') || lower.includes('software license')) return 'License'
  if (lower.includes('privacy policy') || lower.includes('personal data')) return 'Privacy'
  return 'Other'
}
