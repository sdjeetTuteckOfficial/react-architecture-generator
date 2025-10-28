import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDiagramType } from '../../redux/diagramSlice';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Sparkles,
  Zap,
  Plus,
  Wifi,
  WifiOff,
  Database,
  Brain,
  Sun,
  Moon,
} from 'lucide-react';
import useArchitectureWebSocket from './useArchitectureWebSocket';

const FloatingChatWebSocket = ({ handleGenerateDiagram }) => {
  const dispatch = useDispatch();
  const diagramType = useSelector((state) => state.diagram.diagramType);
  const clientId = useRef(
    `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  ).current;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showMemory, setShowMemory] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    currentThreadId,
    currentVersion,
    memoryContext,
    conversationHistory,
    messages,
    isProcessing,
    awaitingClarification,
    clarificationProgress,
    createThread,
    loadThread,
    analyzeProject,
    modifyDiagram,
    sendClarificationResponse,
  } = useArchitectureWebSocket({
    onDiagramGenerated: handleGenerateDiagram,
    clientId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing || !isConnected) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    if (awaitingClarification) {
      sendClarificationResponse(userMessage);
    } else if (conversationHistory.length > 0) {
      console.log('🔧 Modifying existing diagram');
      modifyDiagram(userMessage);
    } else {
      console.log('🎨 Creating first diagram');
      analyzeProject(userMessage);
    }
  };

  const handleDiagramTypeChange = (type) => {
    dispatch(setDiagramType(type));
  };

  const handleNewChat = () => {
    const threadName = `${
      diagramType === 'architecture' ? 'Architecture' : 'Database'
    } Chat ${new Date().toLocaleString()}`;
    createThread(threadName);
  };

  return (
    <>
      {/* Floating Button */}
      <div className='fixed bottom-8 right-8 z-50'>
        <div
          className={`relative transition-all duration-700 ease-out ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div
            className={`absolute inset-0 rounded-full blur-xl opacity-60 animate-pulse ${
              isDark
                ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600'
                : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600'
            }`}
          ></div>
          <button
            onClick={() => setIsOpen(true)}
            className={`relative rounded-full p-5 shadow-2xl transition-all duration-500 hover:scale-110 border group overflow-hidden ${
              isDark
                ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50'
                : 'bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 border-blue-400/50'
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                isDark
                  ? 'from-cyan-500/20 to-purple-500/20'
                  : 'from-white/20 to-transparent'
              }`}
            ></div>
            <MessageCircle
              size={28}
              className='relative z-10 group-hover:rotate-12 transition-transform duration-500 text-white'
            />
            <Sparkles
              className={`absolute -top-1 -right-1 w-4 h-4 animate-pulse ${
                isDark ? 'text-cyan-400' : 'text-yellow-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-8 right-8 z-50 w-[440px] h-[85vh] backdrop-blur-2xl ${
            isDark
              ? 'bg-slate-900/95 border-slate-700/50'
              : 'bg-white/95 border-gray-200'
          } rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-colors duration-300`}
        >
          {/* Ambient Glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              isDark
                ? 'from-cyan-500/5 via-transparent to-purple-500/5'
                : 'from-cyan-500/3 via-transparent to-purple-500/3'
            } pointer-events-none`}
          ></div>

          {/* Header */}
          <div
            className={`relative p-6 border-b ${
              isDark ? 'border-slate-800/50' : 'border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='relative'>
                  <div className='w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50'>
                    <Bot size={24} className='text-white' />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${
                      isDark ? 'border-slate-900' : 'border-white'
                    } ${
                      isConnected
                        ? 'bg-emerald-400'
                        : isConnecting
                        ? 'bg-yellow-400 animate-spin'
                        : 'bg-red-400'
                    }`}
                  ></div>
                </div>
                <div>
                  <h3
                    className={`font-semibold text-lg ${
                      isDark ? 'text-white' : 'text-gray-900'
                    } flex items-center gap-2`}
                  >
                    Gunevo ArchitectX
                    {memoryContext && (
                      <Brain size={16} className='text-cyan-400' />
                    )}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-gray-600'
                    } flex items-center gap-2`}
                  >
                    {isConnected ? (
                      <>
                        <Wifi size={12} />
                        {diagramType === 'architecture'
                          ? 'System Design'
                          : 'Database'}
                      </>
                    ) : isConnecting ? (
                      <>
                        <Loader2 size={12} className='animate-spin' />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <WifiOff size={12} />
                        Offline
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setIsDark(!isDark)}
                  className={`w-10 h-10 ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                  } rounded-xl backdrop-blur-sm transition-all flex items-center justify-center group border`}
                >
                  {isDark ? (
                    <Sun
                      size={18}
                      className='text-slate-400 group-hover:text-yellow-400 transition-colors'
                    />
                  ) : (
                    <Moon
                      size={18}
                      className='text-gray-600 group-hover:text-blue-600 transition-colors'
                    />
                  )}
                </button>
                {memoryContext && (
                  <button
                    onClick={() => setShowMemory(!showMemory)}
                    className={`w-10 h-10 ${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                        : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                    } rounded-xl backdrop-blur-sm transition-all flex items-center justify-center group relative border`}
                  >
                    <Brain
                      size={18}
                      className={`${
                        isDark
                          ? 'text-slate-400 group-hover:text-cyan-400'
                          : 'text-gray-600 group-hover:text-cyan-600'
                      } transition-colors`}
                    />
                    <span className='absolute -top-1 -right-1 w-5 h-5 bg-cyan-400 text-xs flex items-center justify-center rounded-full text-slate-900 font-bold'>
                      {memoryContext.previous_versions}
                    </span>
                  </button>
                )}
                <button
                  onClick={handleNewChat}
                  disabled={!isConnected}
                  className={`w-10 h-10 ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                  } rounded-xl backdrop-blur-sm transition-all flex items-center justify-center border disabled:opacity-50`}
                >
                  <Plus
                    size={18}
                    className={isDark ? 'text-slate-400' : 'text-gray-600'}
                  />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`w-10 h-10 ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
                      : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                  } rounded-xl backdrop-blur-sm transition-all flex items-center justify-center border`}
                >
                  <X
                    size={18}
                    className={isDark ? 'text-slate-400' : 'text-gray-600'}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Memory Panel */}
          {showMemory && memoryContext && (
            <div
              className={`${
                isDark
                  ? 'bg-slate-800/30 border-slate-700/50'
                  : 'bg-gray-50 border-gray-200'
              } border-b p-5 backdrop-blur-sm`}
            >
              <div className='flex items-center justify-between mb-4'>
                <h4
                  className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } flex items-center gap-2`}
                >
                  <Brain size={16} className='text-cyan-400' />
                  Memory Context
                </h4>
                <button
                  onClick={() => setShowMemory(false)}
                  className={`${
                    isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors`}
                >
                  <X size={16} />
                </button>
              </div>
              <div className='space-y-3 text-sm'>
                <div
                  className={`flex items-center justify-between ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50'
                      : 'bg-white border-gray-200'
                  } rounded-xl p-3 border`}
                >
                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                    Versions
                  </span>
                  <span className='font-semibold text-cyan-400'>
                    {memoryContext.previous_versions}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between ${
                    isDark
                      ? 'bg-slate-800/50 border-slate-700/50'
                      : 'bg-white border-gray-200'
                  } rounded-xl p-3 border`}
                >
                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>
                    Components
                  </span>
                  <span className='font-semibold text-cyan-400'>
                    {memoryContext.total_components}
                  </span>
                </div>
                {memoryContext.technologies_used?.length > 0 && (
                  <div
                    className={`${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700/50'
                        : 'bg-white border-gray-200'
                    } rounded-xl p-3 border`}
                  >
                    <span
                      className={`${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      } block mb-2`}
                    >
                      Technologies
                    </span>
                    <div className='flex flex-wrap gap-2'>
                      {memoryContext.technologies_used
                        .slice(0, 8)
                        .map((tech, idx) => (
                          <span
                            key={idx}
                            className='text-xs bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-400/20'
                          >
                            {tech}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode Selector */}
          <div
            className={`p-5 border-b ${
              isDark ? 'border-slate-800/50' : 'border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex space-x-3'>
                <button
                  onClick={() => handleDiagramTypeChange('architecture')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    diagramType === 'architecture'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                      : isDark
                      ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:text-gray-900'
                  }`}
                >
                  🏗️ Architecture
                </button>
                <button
                  onClick={() => handleDiagramTypeChange('db_diagram')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    diagramType === 'db_diagram'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                      : isDark
                      ? 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:text-gray-900'
                  }`}
                >
                  🗄️ Database
                </button>
              </div>
              {currentThreadId && (
                <div
                  className={`text-xs ${
                    isDark ? 'text-slate-500' : 'text-gray-500'
                  } flex items-center gap-1.5`}
                >
                  <Database size={12} />v{currentVersion}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-6 space-y-6'>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in-50`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    message.type === 'user'
                      ? 'flex-row-reverse space-x-reverse'
                      : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-500 to-pink-500'
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                        : isDark
                        ? 'bg-slate-800/50 border border-slate-700/50'
                        : 'bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User size={18} className='text-white' />
                    ) : message.isError ? (
                      <AlertCircle size={18} className='text-white' />
                    ) : message.type === 'system' ? (
                      <Zap size={18} className='text-white' />
                    ) : (
                      <Bot size={18} className='text-cyan-400' />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl backdrop-blur-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border'
                        : isDark
                        ? 'bg-slate-800/50 text-slate-200 border border-slate-700/50'
                        : 'bg-gray-50 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.type === 'user'
                          ? 'text-cyan-100'
                          : isDark
                          ? 'text-slate-500'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className='flex justify-start'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={`w-10 h-10 rounded-2xl ${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700/50'
                        : 'bg-gray-100 border-gray-200'
                    } border flex items-center justify-center`}
                  >
                    <Loader2 size={18} className='animate-spin text-cyan-400' />
                  </div>
                  <div
                    className={`${
                      isDark
                        ? 'bg-slate-800/50 border-slate-700/50'
                        : 'bg-gray-50 border-gray-200'
                    } p-4 rounded-2xl border`}
                  >
                    <div className='flex items-center space-x-2'>
                      <div className='flex space-x-1'>
                        <div className='w-2 h-2 bg-cyan-400 rounded-full animate-bounce'></div>
                        <div
                          className='w-2 h-2 bg-blue-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.15s' }}
                        ></div>
                        <div
                          className='w-2 h-2 bg-purple-400 rounded-full animate-bounce'
                          style={{ animationDelay: '0.3s' }}
                        ></div>
                      </div>
                      <span
                        className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-gray-600'
                        }`}
                      >
                        AI thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {connectionError && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2'>
                <AlertCircle size={16} className='text-red-600 mt-0.5' />
                <div className='flex-1'>
                  <p className='text-sm text-red-800 font-medium'>
                    Connection Error
                  </p>
                  <p className='text-xs text-red-600'>{connectionError}</p>
                  <button
                    onClick={connect}
                    className='text-xs text-red-700 underline mt-1'
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className={`p-6 border-t ${
              isDark ? 'border-slate-800/50' : 'border-gray-200'
            }`}
          >
            <div className='flex space-x-3'>
              <input
                ref={inputRef}
                type='text'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={
                  !isConnected
                    ? '⚠️ Connecting...'
                    : awaitingClarification
                    ? '🤔 Your answer...'
                    : currentThreadId
                    ? '💬 Continue or update...'
                    : '✨ Describe your project...'
                }
                className={`flex-1 border ${
                  isDark
                    ? 'border-slate-700/50 bg-slate-800/50 text-white placeholder-slate-500 focus:ring-cyan-500/50'
                    : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:ring-cyan-500/30'
                } rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-50 transition-all`}
                disabled={isProcessing || !isConnected}
              />
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isProcessing || !isConnected}
                className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-2xl px-5 py-3.5 shadow-lg shadow-cyan-500/30 disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 group'
              >
                {isProcessing ? (
                  <Loader2 size={20} className='animate-spin' />
                ) : (
                  <Send
                    size={20}
                    className='group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform'
                  />
                )}
              </button>
            </div>

            {awaitingClarification && clarificationProgress && (
              <div className='mt-3 flex items-center justify-between text-xs'>
                <span className={isDark ? 'text-slate-500' : 'text-gray-500'}>
                  Question {clarificationProgress.current} of{' '}
                  {clarificationProgress.total}
                </span>
                <div className='flex space-x-1'>
                  {Array.from(
                    { length: clarificationProgress.total },
                    (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i < clarificationProgress.current - 1
                            ? 'bg-green-400'
                            : i === clarificationProgress.current - 1
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-gray-300'
                        }`}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <div className='mt-4 flex items-center justify-between text-xs'>
              <span
                className={`${
                  isDark ? 'text-slate-500' : 'text-gray-500'
                } flex items-center gap-2`}
              >
                {currentThreadId ? (
                  <>💾 Thread (v{currentVersion})</>
                ) : (
                  <>📝 No thread</>
                )}
              </span>
              <span
                className={`${
                  isDark ? 'text-slate-500' : 'text-gray-500'
                } flex items-center gap-2`}
              >
                {isConnected ? (
                  <>
                    <Wifi size={12} className='text-emerald-400' />
                    <span className='text-emerald-400'>Connected</span>
                  </>
                ) : isConnecting ? (
                  <>
                    <Loader2
                      size={12}
                      className='animate-spin text-yellow-600'
                    />
                    <span className='text-yellow-600'>Connecting...</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={12} className='text-red-400' />
                    <span className='text-red-400'>Disconnected</span>
                  </>
                )}
              </span>
            </div>

            {currentThreadId && !awaitingClarification && memoryContext && (
              <div
                className={`mt-3 text-xs ${
                  isDark
                    ? 'text-cyan-400 bg-cyan-400/10'
                    : 'text-blue-600 bg-blue-50'
                } rounded-lg p-3 border ${
                  isDark ? 'border-cyan-400/20' : 'border-blue-200'
                }`}
              >
                🧠 Memory active with {memoryContext.previous_versions}{' '}
                versions!
                <br />
                Try: "Add caching", "Make it scalable", "Enhance security"
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatWebSocket;
