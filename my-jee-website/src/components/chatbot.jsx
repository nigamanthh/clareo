import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';

const DrNeutronChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m **Dr. Neutron**, your JEE Physics, Chemistry, and Mathematics tutor powered by Gemini AI. I can help you understand complex concepts, solve problems, and explain formulas. Just ask me anything about JEE topics!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const apiKey = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with your actual API key
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const renderLatex = (text) => {
    if (!text) return '';
    
    const parts = [];
    let currentIndex = 0;
    const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: text.substring(currentIndex, match.index)
        });
      }
      
      parts.push({
        type: 'latex',
        content: match[1] || match[2],
        display: !!match[1]
      });
      
      currentIndex = regex.lastIndex;
    }
    
    if (currentIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(currentIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const formatMessage = (content) => {
    const parts = renderLatex(content);
    
    return parts.map((part, idx) => {
      if (part.type === 'latex') {
        return (
          <span
            key={idx}
            className={`${part.display ? 'block my-2 text-center' : 'inline-block mx-1'} bg-blue-50 px-2 py-1 rounded font-mono text-sm`}
          >
            {part.content}
          </span>
        );
      } else {
        const textParts = part.content.split(/(\*\*[^*]+\*\*)/g);
        return textParts.map((text, textIdx) => {
          if (text.startsWith('**') && text.endsWith('**')) {
            return <strong key={`${idx}-${textIdx}`}>{text.slice(2, -2)}</strong>;
          }
          return <span key={`${idx}-${textIdx}`}>{text}</span>;
        });
      }
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Dr. Neutron, an expert AI tutor specializing in JEE (Joint Entrance Examination) preparation for Physics, Chemistry, and Mathematics. Your role is to:

1. Explain complex concepts in simple, clear language
2. Break down problems step-by-step
3. Use LaTeX notation for mathematical expressions (use $ for inline math and $$ for display math)
4. Provide relevant formulas and derivations
5. Give helpful tips and tricks for JEE preparation
6. Be encouraging and patient with students

When using LaTeX, wrap inline math with single dollar signs like $E=mc^2$ and display math with double dollar signs like $$\\int_0^\\infty e^{-x}dx = 1$$

Student's question: ${input}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const assistantMessage = {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please check your API key and try again.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
        aria-label="Open Dr. Neutron Chat"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl transition-all duration-300 z-50 flex flex-col ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
            ⚛️
          </div>
          <div>
            <h3 className="font-bold text-lg">Dr. Neutron</h3>
            <p className="text-xs opacity-90">JEE Physics, Chem, Math Tutor</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {formatMessage(msg.content)}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about JEE Physics, Chemistry, or Math..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DrNeutronChatbot;