// extension/sidepanel.js

let messages = []
let highlightActive = false
let currentMatchIndex = 0
let totalMatches = 0

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

  // 监听来自 content script 的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateAnalysis') {
      document.getElementById('data-summary').textContent = request.summary
    }
    
    if (request.action === 'textSelected') {
      addMessage('user', request.text)
      addMessage('assistant', 'Let me analyze that clause for you...')
    }
  })
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
