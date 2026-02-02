import { useState, useEffect, useRef } from 'react';
import './DrNeutron.css';

// Get backend URL from environment variable or default to localhost
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function DrNeutron() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi! I'm Dr. Neutron. Ask me about study strategies or concepts!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const chatEndRef = useRef(null);
  const mathJaxRendering = useRef(false);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem('dr-neutron-sessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
    }
  }, []);

  // Create new session when chatbot is opened (only if no session exists)
  useEffect(() => {
    if (isOpen && !hasLoadedSession) {
      // Only create new session if there are no existing sessions
      if (sessions.length === 0) {
        createNewSession();
      } else {
        // Load the most recent session
        loadSession(sessions[0].id);
      }
      setHasLoadedSession(true);
    } else if (!isOpen) {
      setHasLoadedSession(false);
    }
  }, [isOpen]);

  // Save current session when messages change
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      const updatedSessions = sessions.map(session =>
        session.id === currentSessionId
          ? { ...session, messages, updatedAt: new Date().toISOString() }
          : session
      );

      // If session doesn't exist yet, add it
      if (!sessions.find(s => s.id === currentSessionId)) {
        updatedSessions.unshift({
          id: currentSessionId,
          title: generateSessionTitle(messages),
          messages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        // Update title based on conversation
        const sessionIndex = updatedSessions.findIndex(s => s.id === currentSessionId);
        if (sessionIndex !== -1) {
          updatedSessions[sessionIndex].title = generateSessionTitle(messages);
        }
      }

      setSessions(updatedSessions);
      localStorage.setItem('dr-neutron-sessions', JSON.stringify(updatedSessions));
    }
  }, [messages, currentSessionId]);

  const generateSessionTitle = (msgs) => {
    const userMessages = msgs.filter(m => m.sender === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].text;
      return firstMessage.length > 40 ? firstMessage.substring(0, 40) + '...' : firstMessage;
    }
    return 'New Chat';
  };

  const createNewSession = () => {
    const newSessionId = Date.now().toString();
    setCurrentSessionId(newSessionId);
    setMessages([{ sender: 'bot', text: "Hi! I'm Dr. Neutron. Ask me about study strategies or concepts!" }]);
    setShowSessions(false);
    setHasLoadedSession(true);
  };

  const loadSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setShowSessions(false);
    }
  };

  const deleteSession = (sessionId) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('dr-neutron-sessions', JSON.stringify(updatedSessions));

    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        loadSession(updatedSessions[0].id);
      } else {
        createNewSession();
      }
    }
  };

  // Load MathJax for LaTeX support
  useEffect(() => {
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
  }, []);

  // Re-render MathJax when messages change (with debounce for streaming)
  useEffect(() => {
    const renderMath = async () => {
      if (mathJaxRendering.current) return;
      mathJaxRendering.current = true;

      try {
        // Clear previous MathJax output to prevent conflicts
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
        mathJaxRendering.current = false;
      }

      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Debounce MathJax rendering for streaming performance
    const timeoutId = setTimeout(renderMath, loading ? 150 : 50);

    return () => clearTimeout(timeoutId);
  }, [messages, loading]);

  // Re-render MathJax when chatbot is expanded/minimized or sessions toggled
  useEffect(() => {
    const renderMath = async () => {
      if (mathJaxRendering.current) return;
      mathJaxRendering.current = true;

      try {
        // Clear previous MathJax output to prevent conflicts
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
        mathJaxRendering.current = false;
      }
    };

    if (isOpen) {
      // Delay for CSS transition to complete (300ms transition + 50ms buffer)
      setTimeout(renderMath, 350);
    }
  }, [isExpanded, isOpen, showSessions]);

  const formatMessage = (text) => {
    // Handle both actual newlines and literal \n strings
    return text
      .replace(/\\n\\n/g, '<br><br>')  // Handle literal \n\n (if AI sends them)
      .replace(/\\n/g, '<br>')          // Handle literal \n
      .replace(/\n\n/g, '<br><br>')     // Handle actual double newlines
      .replace(/\n/g, '<br>');          // Handle actual single newlines
  };

  const convertLatexToSpoken = (text) => {
    // Convert LaTeX to spoken text
    let spoken = text;

    // Remove HTML tags first
    spoken = spoken.replace(/<[^>]*>/g, ' ');

    // Convert common LaTeX patterns to spoken text
    spoken = spoken.replace(/\\Delta\s*H/g, 'delta H');
    spoken = spoken.replace(/\\Delta/g, 'delta');
    spoken = spoken.replace(/\\_(\{[^}]+\}|[a-zA-Z0-9])/g, ' subscript $1');
    spoken = spoken.replace(/\^(\{[^}]+\}|[a-zA-Z0-9])/g, ' superscript $1');

    // Remove LaTeX delimiters
    spoken = spoken.replace(/\\\[|\\\]|\\\(|\\\)/g, '');
    spoken = spoken.replace(/\$\$/g, '');
    spoken = spoken.replace(/\$/g, '');

    // Remove curly braces
    spoken = spoken.replace(/\{|\}/g, '');

    // Clean up multiple spaces
    spoken = spoken.replace(/\s+/g, ' ').trim();

    // Limit length - truncate at sentence boundary for cleaner result
    const maxLength = 400;
    if (spoken.length > maxLength) {
      // Try to cut at last sentence within limit
      const truncated = spoken.substring(0, maxLength);
      const lastPeriod = truncated.lastIndexOf('.');
      if (lastPeriod > maxLength * 0.7) {
        spoken = truncated.substring(0, lastPeriod + 1);
      } else {
        spoken = truncated;
      }
    }

    return spoken;
  };

  const generateVideo = async () => {
    // Get the last user question
    const userMessages = messages.filter(m => m.sender === 'user');
    if (userMessages.length === 0) {
      alert('No question available to generate video.');
      return;
    }

    const lastQuestion = userMessages[userMessages.length - 1].text;

    setShowVideoModal(true);
    setVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/generate-motion-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: lastQuestion })
      });

      const data = await response.json();

      if (!response.ok) {
        setVideoError(data.error || 'Failed to generate video');
        return;
      }

      setVideoUrl(data.videoUrl);
    } catch (err) {
      console.error('Video generation error:', err);
      setVideoError('Failed to connect to video generation service. Make sure the backend server is running.');
    } finally {
      setVideoLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const userInput = input;
    setInput('');
    setLoading(true);

    // Add empty bot message for streaming
    const botMessageIndex = newMessages.length;
    const streamingMessages = [...newMessages, { sender: 'bot', text: '' }];
    setMessages(streamingMessages);

    try {
      // Send previous messages as history (excluding thinking messages and initial welcome)
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
        body: JSON.stringify({
          message: userInput,
          history: history
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => `Server error: ${response.status}`);
        setMessages([...newMessages, { sender: 'bot', text: errorText || `Error: ${response.status}` }]);
        setLoading(false);
        return;
      }

      // Read stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode chunk
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // Update message in real-time
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[botMessageIndex] = {
            sender: 'bot',
            text: formatMessage(accumulatedText)
          };
          return updatedMessages;
        });
      }

      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setMessages([...newMessages, { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please make sure the backend server is running on port 3000." }]);
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button className="floating-button" onClick={() => setIsOpen(true)}>
          🤖
        </button>
      )}
      {isOpen && (
        <div className={`chat-window ${isExpanded ? 'expanded' : ''}`}>
          {/* Sessions Sidebar */}
          {showSessions && (
            <div className="sessions-sidebar">
              <div className="sessions-header">
                <h4>Chat History</h4>
                <button onClick={createNewSession} className="new-chat-btn">+ New Chat</button>
              </div>
              <div className="sessions-list">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={`session-item ${currentSessionId === session.id ? 'active' : ''}`}
                    onClick={() => loadSession(session.id)}
                  >
                    <span className="session-title">{session.title}</span>
                    <button
                      className="delete-session-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="chat-main">
            <div className="chat-header">
              <div className="header-left">
                <button
                  onClick={() => setShowSessions(!showSessions)}
                  className="sessions-toggle-btn"
                  title="Toggle chat history"
                >
                  ☰
                </button>
                <h3>Dr. Neutron</h3>
              </div>
              <div className="header-buttons">
                <button
                  onClick={generateVideo}
                  className="video-gen-btn"
                  title="Generate video explanation"
                  disabled={messages.filter(m => m.sender === 'bot' && !m.text.includes('💭') && !m.text.includes("Hi! I'm Dr. Neutron")).length === 0}
                >
                  🎬
                </button>
                <button
                  onClick={createNewSession}
                  className="new-chat-header-btn"
                  title="New chat"
                >
                  ✎
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="expand-btn"
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? '🗗' : '🗖'}
                </button>
                <button onClick={() => setIsOpen(false)} className="close-btn">✕</button>
              </div>
            </div>
            <div className="chat-body">
              {messages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Dr. Neutron..."
                disabled={loading}
              />
              <button type="submit" disabled={loading}>➤</button>
            </form>
          </div>
        </div>
      )}

      {/* Video Generation Modal */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={() => setShowVideoModal(false)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h3>🚀 Motion in 1D - Space Animation</h3>
              <button onClick={() => setShowVideoModal(false)} className="video-close-btn">✕</button>
            </div>
            <div className="video-modal-body">
              {videoLoading && (
                <div className="video-loading">
                  <div className="space-loader"></div>
                  <p>Rendering your physics animation...</p>
                  <p className="video-loading-subtitle">This may take 15-30 seconds</p>
                </div>
              )}
              {videoError && (
                <div className="video-error">
                  <p>⚠️ {videoError}</p>
                </div>
              )}
              {videoUrl && !videoLoading && (
                <div className="video-player-container">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="video-player"
                  />
                  <a href={videoUrl} download className="download-video-btn">
                    ⬇️ Download Video
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}