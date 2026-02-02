// Dr. Neutron Chatbot - Standalone Version
(function() {
  // Backend URL - will be replaced during build or use default
  const BACKEND_URL = window.VITE_BACKEND_URL || 'http://localhost:3000';

  // Create chatbot HTML structure
  const chatbotHTML = `
    <div class="chatbot-container" id="dr-neutron-chatbot">
      <button class="floating-button" id="chatbot-toggle">
        🤖
      </button>
      <div class="chat-window" id="chat-window" style="display: none;">
        <div class="sessions-sidebar" id="sessions-sidebar" style="display: none;">
          <div class="sessions-header">
            <h4>Chat History</h4>
            <button id="new-chat-btn" class="new-chat-btn">+ New Chat</button>
          </div>
          <div class="sessions-list" id="sessions-list"></div>
        </div>

        <div class="chat-main">
          <div class="chat-header">
            <div class="header-left">
              <button id="sessions-toggle-btn" class="sessions-toggle-btn" title="Toggle chat history">
                ☰
              </button>
              <h3>Dr. Neutron</h3>
            </div>
            <div class="header-buttons">
              <button id="new-chat-header-btn" class="new-chat-header-btn" title="New chat">
                ✎
              </button>
              <button id="expand-btn" class="expand-btn" title="Expand">
                🗖
              </button>
              <button id="close-btn" class="close-btn">✕</button>
            </div>
          </div>

          <div class="chat-body" id="chat-body"></div>

          <form class="chat-input-form" id="chat-input-form">
            <input type="text" id="chat-input" placeholder="Ask Dr. Neutron..." />
            <button type="submit">➤</button>
          </form>
        </div>
      </div>
    </div>
  `;

  // Add chatbot to page
  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Load MathJax
    if (!window.MathJax) {
      window.MathJax = {
        tex: {
          inlineMath: [['\\(', '\\)'], ['$', '$']],
          displayMath: [['\\[', '\\]'], ['$$', '$$']],
          processEscapes: true,
          processEnvironments: true
        },
        svg: {
          fontCache: 'global',
          scale: 1.1
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
        }
      };

      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Initialize chatbot
    initChatbot();
  });

  function initChatbot() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chat-window');
    const closeBtn = document.getElementById('close-btn');
    const expandBtn = document.getElementById('expand-btn');
    const sessionsToggleBtn = document.getElementById('sessions-toggle-btn');
    const sessionsSidebar = document.getElementById('sessions-sidebar');
    const newChatBtn = document.getElementById('new-chat-btn');
    const newChatHeaderBtn = document.getElementById('new-chat-header-btn');
    const chatBody = document.getElementById('chat-body');
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input');
    const sessionsList = document.getElementById('sessions-list');

    let isExpanded = false;
    let showSessions = false;
    let currentSessionId = null;
    let messages = [];
    let sessions = [];
    let loading = false;
    let mathJaxRendering = false;

    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('dr-neutron-sessions');
    if (savedSessions) {
      sessions = JSON.parse(savedSessions);
    }

    // Check if there's an active session in sessionStorage (persists during page navigation and reloads, but cleared when browser closes)
    const activeSessionId = sessionStorage.getItem('dr-neutron-active-session');

    // Toggle chatbot
    toggleBtn.addEventListener('click', () => {
      chatWindow.style.display = 'flex';
      toggleBtn.style.display = 'none';

      if (!currentSessionId) {
        // If there's an active session from this browser session, load it
        if (activeSessionId) {
          const sessionExists = sessions.find(s => s.id === activeSessionId);
          if (sessionExists) {
            loadSession(activeSessionId);
          } else {
            // Session was deleted, create new one
            sessionStorage.removeItem('dr-neutron-active-session');
            createNewSession();
          }
        } else {
          // No active session (browser was closed and reopened), create new chat
          createNewSession();
        }
      }
    });

    // Close chatbot
    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      toggleBtn.style.display = 'flex';
    });

    // Expand/minimize
    expandBtn.addEventListener('click', () => {
      isExpanded = !isExpanded;
      chatWindow.classList.toggle('expanded');
      expandBtn.textContent = isExpanded ? '🗗' : '🗖';
      expandBtn.title = isExpanded ? 'Minimize' : 'Expand';
      setTimeout(renderMath, 350);
    });

    // Toggle sessions
    sessionsToggleBtn.addEventListener('click', () => {
      showSessions = !showSessions;
      sessionsSidebar.style.display = showSessions ? 'flex' : 'none';
      setTimeout(renderMath, 350);
    });

    // New chat buttons
    newChatBtn.addEventListener('click', createNewSession);
    newChatHeaderBtn.addEventListener('click', createNewSession);

    // Send message
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = chatInput.value.trim();
      if (!message || loading) return;

      addMessage('user', message);
      chatInput.value = '';
      loading = true;

      try {
        const history = messages
          .filter(msg => msg.sender !== 'bot' || !msg.text.includes('💭'))
          .filter(msg => !(msg.sender === 'bot' && msg.text.includes("Hi! I'm Dr. Neutron")))
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));

        const response = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, history })
        });

        if (!response.ok) {
          addMessage('bot', 'Error: Unable to connect to Dr. Neutron.');
          loading = false;
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        const botMsgIndex = messages.length;
        addMessage('bot', '');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          messages[botMsgIndex].text = formatMessage(accumulatedText);
          renderMessages();
        }

        loading = false;
      } catch (err) {
        console.error('Chat error:', err);
        addMessage('bot', "Sorry, I'm having trouble connecting.");
        loading = false;
      }
    });

    function createNewSession() {
      currentSessionId = Date.now().toString();
      messages = [{ sender: 'bot', text: "Hi! I'm Dr. Neutron. Ask me about study strategies or concepts!" }];
      showSessions = false;
      sessionsSidebar.style.display = 'none';
      // Save active session to sessionStorage (persists during navigation/reload, cleared when browser closes)
      sessionStorage.setItem('dr-neutron-active-session', currentSessionId);
      renderMessages();
      saveSession();
    }

    function loadSession(sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        currentSessionId = sessionId;
        messages = session.messages;
        showSessions = false;
        sessionsSidebar.style.display = 'none';
        // Save active session to sessionStorage (persists during navigation/reload, cleared when browser closes)
        sessionStorage.setItem('dr-neutron-active-session', sessionId);
        renderMessages();
        renderSessions();
      }
    }

    function deleteSession(sessionId) {
      sessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem('dr-neutron-sessions', JSON.stringify(sessions));
      renderSessions();

      if (currentSessionId === sessionId) {
        // Clear from sessionStorage if it's the active session
        sessionStorage.removeItem('dr-neutron-active-session');
        if (sessions.length > 0) {
          loadSession(sessions[0].id);
        } else {
          createNewSession();
        }
      }
    }

    function addMessage(sender, text) {
      messages.push({ sender, text });
      renderMessages();
      saveSession();
    }

    function renderMessages() {
      chatBody.innerHTML = messages.map((msg, i) => `
        <div class="chat-message ${msg.sender}">
          <div>${msg.text}</div>
        </div>
      `).join('') + '<div id="chat-end"></div>';

      document.getElementById('chat-end').scrollIntoView({ behavior: 'smooth' });
      setTimeout(renderMath, loading ? 150 : 50);
    }

    function renderSessions() {
      sessionsList.innerHTML = sessions.map(session => `
        <div class="session-item ${currentSessionId === session.id ? 'active' : ''}"
             onclick="window.drNeutronLoadSession('${session.id}')">
          <span class="session-title">${session.title}</span>
          <button class="delete-session-btn" onclick="event.stopPropagation(); window.drNeutronDeleteSession('${session.id}')">
            🗑️
          </button>
        </div>
      `).join('');
    }

    function saveSession() {
      const title = generateSessionTitle();
      const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);

      const sessionData = {
        id: currentSessionId,
        title,
        messages,
        createdAt: sessionIndex === -1 ? new Date().toISOString() : sessions[sessionIndex].createdAt,
        updatedAt: new Date().toISOString()
      };

      if (sessionIndex === -1) {
        sessions.unshift(sessionData);
      } else {
        sessions[sessionIndex] = sessionData;
      }

      localStorage.setItem('dr-neutron-sessions', JSON.stringify(sessions));
      renderSessions();
    }

    function generateSessionTitle() {
      const userMessages = messages.filter(m => m.sender === 'user');
      if (userMessages.length > 0) {
        const firstMessage = userMessages[0].text;
        return firstMessage.length > 40 ? firstMessage.substring(0, 40) + '...' : firstMessage;
      }
      return 'New Chat';
    }

    function formatMessage(text) {
      return text
        .replace(/\\n\\n/g, '<br><br>')
        .replace(/\\n/g, '<br>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
    }

    async function renderMath() {
      if (mathJaxRendering) return;
      mathJaxRendering = true;

      try {
        if (window.MathJax?.startup?.document) {
          window.MathJax.startup.document.clear();
          window.MathJax.startup.document.updateDocument();
        }

        const chatBody = document.querySelector('.chat-body');
        if (chatBody && window.MathJax?.typesetPromise) {
          await window.MathJax.typesetPromise([chatBody]);
        }
      } catch (err) {
        console.log('MathJax rendering error:', err);
      } finally {
        mathJaxRendering = false;
      }
    }

    // Expose functions globally for onclick handlers
    window.drNeutronLoadSession = loadSession;
    window.drNeutronDeleteSession = deleteSession;
  }
})();
