// extension/sidepanel.js

let messages = []
let highlightActive = false
let currentMatchIndex = 0
let totalMatches = 0
let currentAnalysisData = null // 存储当前的分析数据

// DOM 元素
const messagesContainer = document.getElementById('messages')
const chatInput = document.getElementById('chat-input')
const sendBtn = document.getElementById('send-btn')
const explainBtn = document.getElementById('explain-btn')
const eli3Btn = document.getElementById('eli3-btn')
const highlightBtn = document.getElementById('highlight-btn')
const highlightControls = document.getElementById('highlight-controls')
const prevBtn = document.getElementById('prev-btn')
const nextBtn = document.getElementById('next-btn')
const clearBtn = document.getElementById('clear-btn')
const matchCounter = document.getElementById('match-counter')
const viewFullBtn = document.getElementById('viewFullBtn')
const backButton = document.getElementById('backButton')

// 初始化
function init() {
    // 加载保存的消息
    const saved = localStorage.getItem('lg.chat')
    if (saved) {
        try {
            messages = JSON.parse(saved)
            renderMessages()
        } catch (e) {
            console.error('Failed to load messages:', e)
        }
    }

    // 绑定事件
    sendBtn.addEventListener('click', handleSend)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend()
    })

    explainBtn.addEventListener('click', () => handleQuickPrompt('explain'))
    eli3Btn.addEventListener('click', () => handleQuickPrompt('eli3'))
    highlightBtn.addEventListener('click', toggleHighlight)
    prevBtn.addEventListener('click', handlePrev)
    nextBtn.addEventListener('click', handleNext)
    clearBtn.addEventListener('click', clearHighlights)

    // 完整分析视图事件
    viewFullBtn.addEventListener('click', () => {
        if (currentAnalysisData) {
            showFullAnalysis(currentAnalysisData)
        } else {
            // 如果没有分析数据，显示提示
            alert('No analysis data available. Please analyze a page first.')
        }
    })

    backButton.addEventListener('click', () => {
        hideFullAnalysis()
    })

    // 监听来自 content script 和 background 的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateAnalysis') {
            document.getElementById('data-summary').textContent = request.summary
        }

        if (request.action === 'textSelected') {
            addMessage('user', request.text)
            addMessage('assistant', 'Let me analyze that clause for you...')
        }

        // 接收分析完成的消息
        if (request.action === 'analysisComplete') {
            currentAnalysisData = request.data

            // 更新 UI 显示摘要
            document.getElementById('data-summary').textContent =
                request.data.summary || 'Analysis complete'

            // 更新风险列表
            if (request.data.risks && request.data.risks.length > 0) {
                updateRiskList(request.data.risks)
            }

            sendResponse({ success: true })
        }
    })

    // 请求页面分析（如果需要自动分析）
    requestPageAnalysis()
}

// 请求页面分析
function requestPageAnalysis() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageContent' }, (response) => {
                if (response && response.content) {
                    // 发送到 background 进行分析
                    chrome.runtime.sendMessage({
                        action: 'analyzePage',
                        content: response.content
                    }, (result) => {
                        if (result && result.success) {
                            currentAnalysisData = result.analysisData
                            document.getElementById('data-summary').textContent =
                                result.analysisData.summary || 'Analysis complete'

                            if (result.analysisData.risks) {
                                updateRiskList(result.analysisData.risks)
                            }
                        }
                    })
                }
            })
        }
    })
}

// 更新风险列表
function updateRiskList(risks) {
    const riskList = document.getElementById('risk-list')
    if (!riskList) return

    const severityIcons = {
        high: '🔴',
        medium: '🟡',
        low: '🟢'
    }

    riskList.innerHTML = risks.map(risk => `
    <div class="risk-item">
      <span class="risk-icon">${severityIcons[risk.severity] || '⚠️'}</span>
      <div class="risk-content">
        <div class="risk-header">
          <span class="risk-name">${risk.text}</span>
          <span class="badge badge-${risk.severity}">${risk.severity}</span>
        </div>
      </div>
    </div>
  `).join('')
}

// 显示完整分析视图
function showFullAnalysis(data) {
    document.getElementById('mainView').style.display = 'none'
    document.getElementById('fullAnalysisView').classList.add('active')

    const content = document.getElementById('fullAnalysisContent')
    content.innerHTML = `
    <div class="analysis-section">
      <div class="analysis-label">Document Type</div>
      <div class="analysis-value">${data.docType || 'Unknown'}</div>
    </div>
    
    <div class="analysis-section">
      <div class="analysis-label">Summary</div>
      <div class="analysis-value">${data.summary || 'No summary available'}</div>
    </div>
    
    <div class="analysis-section">
      <div class="analysis-label">Detected Risks</div>
      <div class="analysis-pre">${JSON.stringify(data.risks || [], null, 2)}</div>
    </div>
    
    <div class="analysis-section">
      <div class="analysis-label">Full Analysis Details</div>
      <div class="analysis-pre">${data.fullAnalysis || 'No detailed analysis available'}</div>
    </div>
    
    <div class="analysis-section">
      <div class="analysis-label">Raw Data (JSON)</div>
      <div class="analysis-pre">${JSON.stringify(data, null, 2)}</div>
    </div>
  `
}

// 隐藏完整分析视图
function hideFullAnalysis() {
    document.getElementById('mainView').style.display = 'block'
    document.getElementById('fullAnalysisView').classList.remove('active')
}

// 发送消息
function handleSend() {
    const text = chatInput.value.trim()
    if (!text) return

    addMessage('user', text)
    chatInput.value = ''

    // 模拟 AI 响应
    setTimeout(() => {
        addMessage('assistant', `Based on your question "${text}", here's what you need to know: This clause is designed to protect the vendor while limiting your rights. It's important to understand these terms before agreeing.`)
    }, 1000)
}

// 快速提示
function handleQuickPrompt(type) {
    const prompts = {
        explain: 'Explain this document in simple terms',
        eli3: 'Explain this like I\'m 3 years old'
    }

    addMessage('user', prompts[type])

    setTimeout(() => {
        const responses = {
            explain: 'This is a standard agreement that defines how you can use the service. Key points: 1) You get permission to use it, but don\'t own it. 2) You can\'t share it with others. 3) The company keeps all rights. 4) They\'re not responsible if something goes wrong.',
            eli3: 'Think of it like borrowing a toy. You can play with it, but you have to follow the rules. You can\'t give it to your friends, and if it breaks, it\'s not the toy maker\'s fault.'
        }
        addMessage('assistant', responses[type])
    }, 1000)
}

// 添加消息
function addMessage(role, text) {
    messages.push({ role, text, timestamp: Date.now() })
    localStorage.setItem('lg.chat', JSON.stringify(messages))
    renderMessages()
}

// 渲染消息
function renderMessages() {
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="empty-state">Start by highlighting a clause or asking a question below.</div>'
        return
    }

    messagesContainer.innerHTML = messages.map(msg => `
    <div class="message message-${msg.role}">
      ${msg.text}
    </div>
  `).join('')

    messagesContainer.scrollTop = messagesContainer.scrollHeight
}

// 高亮功能
function toggleHighlight() {
    if (highlightActive) {
        clearHighlights()
        return
    }

    // 发送消息给 content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightRisks' }, (response) => {
            if (response && response.count > 0) {
                highlightActive = true
                totalMatches = response.count
                currentMatchIndex = 0
                highlightBtn.textContent = '❌ Clear highlights'
                highlightControls.style.display = 'flex'
                updateMatchCounter()
            }
        })
    })
}

function clearHighlights() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'clearHighlights' })
    })

    highlightActive = false
    highlightBtn.textContent = '✨ Highlight risks'
    highlightControls.style.display = 'none'
}

function handlePrev() {
    if (totalMatches === 0) return
    currentMatchIndex = currentMatchIndex > 0 ? currentMatchIndex - 1 : totalMatches - 1
    navigateToMatch(currentMatchIndex)
}

function handleNext() {
    if (totalMatches === 0) return
    currentMatchIndex = currentMatchIndex < totalMatches - 1 ? currentMatchIndex + 1 : 0
    navigateToMatch(currentMatchIndex)
}

function navigateToMatch(index) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'navigateToMatch',
            index: index
        })
    })
    updateMatchCounter()
}

function updateMatchCounter() {
    matchCounter.textContent = `${currentMatchIndex + 1} of ${totalMatches}`
}

// 启动
init()