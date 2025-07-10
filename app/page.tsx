'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Globe, Database, Code2, Sparkles } from 'lucide-react';
import MCPToolsStatus from '@/components/mcp-tools-status';
import SignupPopup from '@/components/signup-popup';
export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
  onError: (error) => {
    console.error('Chat error:', error);
    if (error.message.includes('Request limit exceeded') || 
        error.message.includes('429') ||
        error.message.includes('RATE_LIMIT_EXCEEDED')) {
      setShowSignupPopup(true);
    }
  },
  onResponse: async (response) => {
    if (response.status === 429) {
      setShowSignupPopup(true);
    }
  }
});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [isLoading]);

  // Predefined example prompts
  const examplePrompts = [
    "What tools are available in this MCP server?",
    "Search for information about artificial intelligence",
    "Scrape data from a website",
    "Get LinkedIn profile information",
    "Find product reviews on Amazon"
  ];

  const handleExampleClick = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any);
    
    setTimeout(() => {
      const formData = new FormData();
      formData.append('prompt', prompt);
      handleSubmit({ preventDefault: () => {} } as any, { data: { prompt } });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* MCP Status Component */}
      <MCPToolsStatus />
      <SignupPopup 
        isOpen={showSignupPopup} 
        onClose={() => setShowSignupPopup(false)} 
      />
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-hide">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-4 bg-gradient-to-r from-blue-700/10 to-blue-900/10 rounded-full mb-6">
                <img src={"https://idsai.net.technion.ac.il/files/2022/01/Logo-600.png"} 
                className="w-40 h-40"/>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Bright Data MCP Playground
              </h2>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                I can help you collect data from the web using 60+ specialized tools. 
                Try one of these examples or ask me anything!
              </p>
              
              {/* Example Prompts */}
              <div className="grid gap-3 max-w-2xl mx-auto">
                {examplePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(prompt)}
                    className="p-3 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-500/20 rounded">
                        {index === 0 && <Code2 className="w-4 h-4 text-blue-400" />}
                        {index === 1 && <Globe className="w-4 h-4 text-green-400" />}
                        {index === 2 && <Database className="w-4 h-4 text-purple-400" />}
                        {index === 3 && <User className="w-4 h-4 text-orange-400" />}
                        {index === 4 && <Zap className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {prompt}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-700 to-blue-900 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-700 to-blue-900 text-white'
                      : 'bg-white/10 backdrop-blur-sm text-gray-100 border border-white/10'
                  }`}
                >
                  <div className="prose prose-invert max-w-none">
                    {message.content.split('\n').map((line, index) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4 justify-start">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/10">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-300">
                <p className="text-sm">Something went wrong. Please try again.</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask me about web scraping, data collection, or anything else..."
                className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl font-medium hover:from-blue-800 hover:to-blue-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
          
          {/* Status Indicator */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                error ? 'bg-red-500' : 
                isLoading ? 'bg-yellow-500 animate-pulse' : 
                'bg-green-500'
              }`}></div>
              <span>
                {error ? 'Connection error' : 
                 isLoading ? 'AI is thinking...' : 
                 'Ready to help'}
              </span>
            </div>
            <span>Powered by Bright Data MCP</span>
          </div>
        </div>
      </div>
    </div>
  );
}