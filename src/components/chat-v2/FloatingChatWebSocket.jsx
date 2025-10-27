// src/components/FloatingChatWebSocket.jsx
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
  History,
  Plus,
  Wifi,
  WifiOff,
  Database,
  Brain,
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
  const [showThreads, setShowThreads] = useState(false);
  const [showMemory, setShowMemory] = useState(false);

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
    modifyDiagram, // ✅ ADD THIS
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
      // During clarification flow
      sendClarificationResponse(userMessage);
    } else if (conversationHistory.length > 0) {
      // ✅ If diagram exists, use modify
      console.log('🔧 Modifying existing diagram');
      modifyDiagram(userMessage);
    } else {
      // ✅ If no diagram, use analyze to create first one
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
    setShowThreads(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className='fixed bottom-6 right-6 z-50'>
        <div
          className={`relative transition-all duration-500 ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20'></div>
          <button
            onClick={() => setIsOpen(true)}
            className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group'
          >
            <MessageCircle
              size={28}
              className='group-hover:rotate-12 transition-transform duration-300'
            />
            <Sparkles className='absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-bounce' />
          </button>
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className='fixed bottom-6 right-6 z-50 w-[420px] h-[90vh] backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden'>
          {/* Header */}
          <div className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-5 rounded-t-2xl'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-90'></div>

            <div className='relative flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='relative'>
                  <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                    <Bot size={24} className='text-white' />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      isConnected
                        ? 'bg-green-400 animate-pulse'
                        : isConnecting
                        ? 'bg-yellow-400 animate-spin'
                        : 'bg-red-400'
                    }`}
                  ></div>
                </div>
                <div>
                  <h3 className='font-bold text-lg flex items-center gap-2'>
                    AI Architect
                    {memoryContext && (
                      <Brain
                        size={16}
                        className='text-yellow-300 animate-pulse'
                      />
                    )}
                  </h3>
                  <p className='text-sm text-white/80 flex items-center gap-1'>
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
                        Disconnected
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                {memoryContext && (
                  <button
                    onClick={() => setShowMemory(!showMemory)}
                    className='w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center group relative'
                  >
                    <Brain size={16} className='text-white' />
                    <span className='absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-xs flex items-center justify-center rounded-full text-gray-900 font-bold'>
                      {memoryContext.previous_versions}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowThreads(!showThreads)}
                  className='w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center'
                >
                  <History size={16} className='text-white' />
                </button>
                <button
                  onClick={handleNewChat}
                  disabled={!isConnected}
                  className='w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center disabled:opacity-50'
                >
                  <Plus size={16} className='text-white' />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className='w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all flex items-center justify-center'
                >
                  <X size={18} className='text-white' />
                </button>
              </div>
            </div>
          </div>

          {/* Memory Panel */}
          {showMemory && memoryContext && (
            <div className='bg-gradient-to-b from-yellow-50 to-white border-b border-yellow-200 p-4'>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-semibold text-gray-800 flex items-center gap-2'>
                  <Brain size={16} className='text-yellow-600' />
                  Memory Context
                </h4>
                <button
                  onClick={() => setShowMemory(false)}
                  className='text-gray-500 hover:text-gray-700'
                >
                  <X size={16} />
                </button>
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex items-center justify-between bg-white rounded-lg p-2 border'>
                  <span className='text-gray-600'>Versions:</span>
                  <span className='font-bold text-yellow-700'>
                    {memoryContext.previous_versions}
                  </span>
                </div>
                <div className='flex items-center justify-between bg-white rounded-lg p-2 border'>
                  <span className='text-gray-600'>Components:</span>
                  <span className='font-bold text-yellow-700'>
                    {memoryContext.total_components}
                  </span>
                </div>
                {memoryContext.technologies_used?.length > 0 && (
                  <div className='bg-white rounded-lg p-2 border'>
                    <span className='text-gray-600 block mb-1'>
                      Technologies:
                    </span>
                    <div className='flex flex-wrap gap-1'>
                      {memoryContext.technologies_used
                        .slice(0, 8)
                        .map((tech, idx) => (
                          <span
                            key={idx}
                            className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full'
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

          {/* Thread History */}
          {showThreads && (
            <div className='bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 max-h-48 overflow-y-auto'>
              <div className='p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-semibold text-gray-800 flex items-center gap-2'>
                    <History size={16} />
                    History
                  </h4>
                  <button
                    onClick={() => setShowThreads(false)}
                    className='text-gray-500'
                  >
                    <X size={16} />
                  </button>
                </div>
                {conversationHistory.length > 0 ? (
                  <div className='space-y-2'>
                    {conversationHistory.map((conv) => (
                      <div
                        key={conv.conversation_id}
                        className='bg-white border rounded-lg p-3'
                      >
                        <div className='flex items-center justify-between mb-1'>
                          <span className='text-sm font-medium'>
                            Version {conv.version}
                          </span>
                          <Database size={14} className='text-blue-600' />
                        </div>
                        <div className='text-xs text-gray-500'>
                          {new Date(conv.created_at).toLocaleString()}
                        </div>
                        <div className='text-xs text-blue-600 mt-1'>
                          {conv.diagram_json?.nodes?.length || 0} components
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500 text-sm text-center py-4'>
                    No history
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mode Selector */}
          <div className='p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-b'>
            <div className='flex items-center justify-between'>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleDiagramTypeChange('architecture')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    diagramType === 'architecture'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-700 border hover:scale-105'
                  }`}
                >
                  🏗️ Architecture
                </button>
                <button
                  onClick={() => handleDiagramTypeChange('db_diagram')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    diagramType === 'db_diagram'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-700 border hover:scale-105'
                  }`}
                >
                  🗄️ Database
                </button>
              </div>
              {currentThreadId && (
                <div className='text-xs text-gray-600 flex items-center gap-1'>
                  <Database size={12} />v{currentVersion}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-50/30'>
            {messages.map((message, index) => (
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
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-white text-gray-700 border'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User size={18} />
                    ) : message.isError ? (
                      <AlertCircle size={18} />
                    ) : message.type === 'system' ? (
                      <Zap size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
                        : message.type === 'system'
                        ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border'
                        : 'bg-white/80 text-gray-800 border'
                    }`}
                  >
                    <p className='text-sm whitespace-pre-wrap leading-relaxed'>
                      {message.content}
                    </p>
                    <p
                      className={`text-xs mt-2 ${
                        message.type === 'user'
                          ? 'text-white/70'
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
                  <div className='w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-lg'>
                    <Loader2 size={18} className='animate-spin' />
                  </div>
                  <div className='bg-white p-4 rounded-2xl shadow-sm border'>
                    <div className='flex items-center space-x-2'>
                      <div className='flex space-x-1'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'></div>
                        <div
                          className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className='w-2 h-2 bg-indigo-500 rounded-full animate-bounce'
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className='text-sm'>AI thinking...</span>
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
          <div className='p-4 bg-gradient-to-r from-white/50 to-gray-50/50 backdrop-blur-sm border-t'>
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
                className='flex-1 border-2 rounded-2xl px-4 py-3 text-sm bg-white/80 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50'
                disabled={isProcessing || !isConnected}
              />
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isProcessing || !isConnected}
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl p-3 shadow-lg disabled:opacity-50 transition-all hover:scale-105 disabled:hover:scale-100 group'
              >
                {isProcessing ? (
                  <Loader2 size={20} className='animate-spin' />
                ) : (
                  <Send
                    size={20}
                    className='group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform'
                  />
                )}
              </button>
            </div>

            {awaitingClarification && clarificationProgress && (
              <div className='mt-3 flex items-center justify-between text-xs'>
                <span className='text-gray-500'>
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

            <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
              <span className='flex items-center gap-1'>
                {currentThreadId ? (
                  <>💾 Thread (v{currentVersion})</>
                ) : (
                  <>📝 No thread</>
                )}
              </span>
              <span className='flex items-center gap-1'>
                {isConnected ? (
                  <>
                    <Wifi size={12} className='text-green-600' />
                    <span className='text-green-600'>Connected</span>
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
                    <WifiOff size={12} className='text-red-600' />
                    <span className='text-red-600'>Disconnected</span>
                  </>
                )}
              </span>
            </div>

            {currentThreadId && !awaitingClarification && memoryContext && (
              <div className='mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2'>
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
