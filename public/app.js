// --- Application State ---
let sessions = JSON.parse(localStorage.getItem('aether_chat_sessions')) || [];
let activeSessionId = localStorage.getItem('aether_active_session_id') || null;
let isGenerating = false;

// --- DOM Elements ---
const sidebar = document.getElementById('sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const chatList = document.getElementById('chat-list');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');
const chatWindow = document.getElementById('chat-window');
const welcomeScreen = document.getElementById('welcome-screen');
const messageList = document.getElementById('message-list');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const charCounter = document.getElementById('char-counter');
const suggestionCards = document.querySelectorAll('.suggestion-card');

// Create sidebar overlay for mobile view
const sidebarOverlay = document.createElement('div');
sidebarOverlay.className = 'sidebar-overlay';
document.body.appendChild(sidebarOverlay);

// --- Configure Marked Markdown Parser ---
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
  const validLang = language || 'plaintext';
  
  // Clean code text (marked v11+ passes code as token/object sometimes, but in CDN it's usually string)
  let codeText = typeof code === 'object' ? code.text : code;
  codeText = codeText || '';

  return `
    <div class="code-block-container">
      <div class="code-block-header">
        <span class="code-block-lang">${validLang}</span>
        <button class="copy-code-btn" onclick="copyCode(this)">
          <i data-lucide="copy" class="copy-icon"></i>
          <span>Copy</span>
        </button>
      </div>
      <pre><code class="language-${validLang}">${escapeHtml(codeText.trim())}</code></pre>
    </div>
  `;
};
marked.use({ renderer, gfm: true, breaks: true });

// --- Helper Functions ---
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Global copy code function (called from inline onclick)
window.copyCode = function(button) {
  const container = button.closest('.code-block-container');
  const codeElement = container.querySelector('code');
  const textToCopy = codeElement.textContent;

  navigator.clipboard.writeText(textToCopy).then(() => {
    // Visual feedback
    const span = button.querySelector('span');
    const icon = button.querySelector('i');
    
    span.textContent = 'Copied!';
    button.style.color = 'var(--success)';
    
    if (icon) {
      icon.setAttribute('data-lucide', 'check');
      lucide.createIcons();
    }

    setTimeout(() => {
      span.textContent = 'Copy';
      button.style.color = '';
      if (icon) {
        icon.setAttribute('data-lucide', 'copy');
        lucide.createIcons();
      }
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy code: ', err);
  });
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons
  lucide.createIcons();

  // Load theme
  const savedTheme = localStorage.getItem('aether_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Set up event listeners
  setupEventListeners();

  // Load active session or show welcome screen
  if (activeSessionId) {
    loadSession(activeSessionId);
  } else {
    showWelcome();
  }

  // Render sidebar chat list
  renderChatList();
});

// --- Theme Toggle ---
function updateThemeIcon(theme) {
  const icon = themeToggleBtn.querySelector('i');
  if (theme === 'light') {
    icon.setAttribute('data-lucide', 'sun');
  } else {
    icon.setAttribute('data-lucide', 'moon');
  }
  lucide.createIcons();
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Theme toggle
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('aether_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // Sidebar toggle on mobile
  sidebarToggleBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('show');
  });

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('show');
  };

  sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Input auto-growth
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
    
    const length = chatInput.value.length;
    charCounter.textContent = length;
    
    // Enable/disable send button
    sendBtn.disabled = length === 0 || isGenerating;
  });

  // Enter key submits (Shift+Enter adds new line)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Send button click
  sendBtn.addEventListener('click', handleSendMessage);

  // New Chat button
  newChatBtn.addEventListener('click', () => {
    createNewSession();
    closeSidebar();
  });

  // Clear Chat button
  clearChatBtn.addEventListener('click', () => {
    if (activeSessionId) {
      if (confirm('Are you sure you want to clear this chat history?')) {
        deleteSession(activeSessionId);
      }
    }
  });

  // Suggestion Cards
  suggestionCards.forEach(card => {
    card.addEventListener('click', () => {
      const promptText = card.getAttribute('data-prompt');
      chatInput.value = promptText;
      // Trigger input event to resize textarea and enable send button
      chatInput.dispatchEvent(new Event('input'));
      handleSendMessage();
    });
  });
}

// --- Session Management ---
function createNewSession() {
  const newSession = {
    id: 'session_' + Date.now(),
    title: 'New Chat',
    messages: []
  };
  
  sessions.unshift(newSession);
  saveSessionsToStorage();
  
  activeSessionId = newSession.id;
  localStorage.setItem('aether_active_session_id', activeSessionId);
  
  loadSession(activeSessionId);
  renderChatList();
}

function loadSession(sessionId) {
  activeSessionId = sessionId;
  localStorage.setItem('aether_active_session_id', activeSessionId);

  const session = sessions.find(s => s.id === sessionId);
  if (!session) {
    showWelcome();
    return;
  }

  // Highlight active item in sidebar
  document.querySelectorAll('.chat-item').forEach(item => {
    if (item.getAttribute('data-id') === sessionId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  if (session.messages.length === 0) {
    showWelcome();
  } else {
    welcomeScreen.style.display = 'none';
    messageList.style.display = 'flex';
    messageList.innerHTML = '';
    
    session.messages.forEach(msg => {
      appendMessageToUI(msg.role, msg.content);
    });
    
    scrollToBottom();
  }
}

function deleteSession(sessionId) {
  sessions = sessions.filter(s => s.id !== sessionId);
  saveSessionsToStorage();

  if (activeSessionId === sessionId) {
    if (sessions.length > 0) {
      loadSession(sessions[0].id);
    } else {
      activeSessionId = null;
      localStorage.removeItem('aether_active_session_id');
      showWelcome();
    }
  }

  renderChatList();
}

function saveSessionsToStorage() {
  localStorage.setItem('aether_chat_sessions', JSON.stringify(sessions));
}

function renderChatList() {
  chatList.innerHTML = '';
  
  if (sessions.length === 0) {
    chatList.innerHTML = `
      <div class="chat-list-empty">
        <i data-lucide="message-square-dashed"></i>
        <p>No recent chats</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  sessions.forEach(session => {
    const chatItem = document.createElement('div');
    chatItem.className = `chat-item ${session.id === activeSessionId ? 'active' : ''}`;
    chatItem.setAttribute('data-id', session.id);
    
    chatItem.innerHTML = `
      <i data-lucide="message-square" style="width: 16px; height: 16px; margin-right: 10px; flex-shrink:0;"></i>
      <span class="chat-item-title">${escapeHtml(session.title)}</span>
      <button class="chat-item-delete" title="Delete conversation">
        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
      </button>
    `;

    // Click to load chat
    chatItem.addEventListener('click', (e) => {
      // Don't trigger if clicked on delete button
      if (e.target.closest('.chat-item-delete')) return;
      loadSession(session.id);
    });

    // Delete button click
    chatItem.querySelector('.chat-item-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete "${session.title}"?`)) {
        deleteSession(session.id);
      }
    });

    chatList.appendChild(chatItem);
  });

  lucide.createIcons();
}

function showWelcome() {
  welcomeScreen.style.display = 'flex';
  messageList.style.display = 'none';
  messageList.innerHTML = '';
}

// --- Message DOM Rendering ---
function appendMessageToUI(role, content) {
  const messageRow = document.createElement('div');
  messageRow.className = `message-row ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = role === 'user' ? '<i data-lucide="user"></i>' : '<i data-lucide="bot"></i>';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  if (role === 'user') {
    bubble.textContent = content; // Text only for user to avoid HTML injection
  } else {
    bubble.innerHTML = marked.parse(content);
  }

  messageRow.appendChild(avatar);
  messageRow.appendChild(bubble);
  messageList.appendChild(messageRow);

  // Instantiate Lucide icons for the new elements
  lucide.createIcons({
    attrs: {
      class: 'lucide-icon'
    }
  });

  // Highlight syntax inside the bubble
  if (role === 'assistant') {
    Prism.highlightAllUnder(bubble);
  }
}

function showTypingIndicator() {
  const indicatorRow = document.createElement('div');
  indicatorRow.className = 'message-row assistant typing-indicator-row';
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = '<i data-lucide="bot"></i>';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = `
    <div class="typing-indicator">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  `;

  indicatorRow.appendChild(avatar);
  indicatorRow.appendChild(bubble);
  messageList.appendChild(indicatorRow);
  
  lucide.createIcons();
  scrollToBottom();
  
  return indicatorRow;
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// --- Chat Actions (Core logic) ---
async function handleSendMessage() {
  const messageText = chatInput.value.trim();
  if (!messageText || isGenerating) return;

  // Reset input field
  chatInput.value = '';
  chatInput.style.height = 'auto';
  charCounter.textContent = '0';
  sendBtn.disabled = true;

  // Create session if none exists
  if (!activeSessionId) {
    const newSession = {
      id: 'session_' + Date.now(),
      title: messageText.substring(0, 30) + (messageText.length > 30 ? '...' : ''),
      messages: []
    };
    sessions.unshift(newSession);
    activeSessionId = newSession.id;
    localStorage.setItem('aether_active_session_id', activeSessionId);
    saveSessionsToStorage();
  }

  const currentSession = sessions.find(s => s.id === activeSessionId);
  
  // If it's the first message, update session title
  if (currentSession.messages.length === 0) {
    currentSession.title = messageText.substring(0, 30) + (messageText.length > 30 ? '...' : '');
    renderChatList();
  }

  // Save user message to session
  currentSession.messages.push({ role: 'user', content: messageText });
  saveSessionsToStorage();

  // Show user message in UI
  welcomeScreen.style.display = 'none';
  messageList.style.display = 'flex';
  appendMessageToUI('user', messageText);
  scrollToBottom();

  // Show typing indicator
  const indicator = showTypingIndicator();
  isGenerating = true;

  // Prepare full chat history for the API context
  const apiHistory = currentSession.messages.slice(0, -1); // exclude the message we just added (it's passed as 'message')

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: messageText,
        history: apiHistory
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Failed to get response');
    }

    // Remove typing indicator
    indicator.remove();

    // Create container for AI response
    const aiRow = document.createElement('div');
    aiRow.className = 'message-row assistant';
    
    const aiAvatar = document.createElement('div');
    aiAvatar.className = 'message-avatar';
    aiAvatar.innerHTML = '<i data-lucide="bot"></i>';

    const aiBubble = document.createElement('div');
    aiBubble.className = 'message-bubble';
    
    aiRow.appendChild(aiAvatar);
    aiRow.appendChild(aiBubble);
    messageList.appendChild(aiRow);
    lucide.createIcons();

    // Read stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let aiText = '';
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Save last incomplete line back to buffer
      buffer = lines.pop();

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        if (cleanLine.startsWith('data: ')) {
          const dataContent = cleanLine.slice(6);
          
          if (dataContent === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataContent);
            if (parsed.text) {
              aiText += parsed.text;
              // Render partial markdown for streaming feel
              aiBubble.innerHTML = marked.parse(aiText);
              // Format icons if code blocks were generated
              lucide.createIcons();
              scrollToBottom();
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }
          } catch (e) {
            console.warn('Error parsing SSE data chunk:', e);
          }
        }
      }
    }

    // Final render and code highlighting
    aiBubble.innerHTML = marked.parse(aiText);
    Prism.highlightAllUnder(aiBubble);
    lucide.createIcons();
    scrollToBottom();

    // Save AI response to session
    currentSession.messages.push({ role: 'assistant', content: aiText });
    saveSessionsToStorage();

  } catch (error) {
    console.error('Error during chat stream:', error);
    indicator.remove();
    appendMessageToUI('assistant', `⚠️ **Error:** ${error.message || 'Something went wrong. Please check your connection and try again.'}`);
    scrollToBottom();
  } finally {
    isGenerating = false;
    // Re-evaluate input character length to enable/disable send button
    chatInput.dispatchEvent(new Event('input'));
  }
}
