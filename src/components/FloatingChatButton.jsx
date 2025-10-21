import React, { useState, useRef, useEffect } from 'react';
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
  Save,
  Plus,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { setDiagramType } from '../redux/diagramSlice';
import { triggerThreadRefresh, setCurrentThread } from '../redux/threadSlice';

const FloatingChatButton = ({
  apiBaseUrl = 'http://localhost:8000',
  handleGenerateDiagram,
  userId = '3fa85f64-5717-4562-b3fc-2c963f66afa6',
}) => {
  const token = localStorage.getItem('authToken');
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content:
        "✨ Hey there! I'm your AI architecture assistant. Describe your project and I'll craft a stunning architecture diagram for you!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [clarificationResponses, setClarificationResponses] = useState({});
  const [awaitingClarification, setAwaitingClarification] = useState(false);

  // Thread management states
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);

  const diagramType = useSelector((state) => state.diagram.diagramType);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load threads when chat opens
  useEffect(() => {
    if (isOpen && token) {
      loadThreads();
    }
  }, [isOpen, token]);

  const addMessage = (type, content, isError = false) => {
    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      isError,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  // API Functions for Thread Management
  const loadThreads = async () => {
    if (!token) {
      console.warn('No auth token available');
      return;
    }

    setIsLoadingThreads(true);
    try {
      const response = await fetch(
        `${apiBaseUrl}/architecture/threads?skip=0&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        const threadsData = await response.json();
        setThreads(threadsData);
      } else {
        console.error(
          'Failed to load threads:',
          response.status,
          response.statusText
        );
        addMessage('bot', '⚠️ Failed to load chat history', true);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
      addMessage('bot', '⚠️ Failed to load chat history', true);
    } finally {
      setIsLoadingThreads(false);
    }
  };

  const createThread = async () => {
    if (!token || isCreatingThread) return null;

    setIsCreatingThread(true);
    console.log('Creating thread...');

    try {
      const response = await fetch(`${apiBaseUrl}/architecture/threads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_name: `${
            diagramType === 'architecture' ? 'Architecture' : 'Database'
          } Chat - ${new Date().toLocaleString()}`,
          diagram_type: diagramType,
        }),
      });

      if (response.ok) {
        const thread = await response.json();
        const threadId = thread.thread_id || thread.id;

        console.log('Thread created successfully:', threadId);
        setCurrentThreadId(threadId);
        setThreads((prev) => [thread, ...prev]);

        // Dispatch Redux actions
        dispatch(
          setCurrentThread({
            threadId,
            threadName: thread.thread_name,
            currentVersion: 0,
          })
        );
        dispatch(triggerThreadRefresh()); // Trigger refresh in Threads component

        return threadId;
      } else {
        console.error(
          'Failed to create thread:',
          response.status,
          response.statusText
        );
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        addMessage('bot', '⚠️ Failed to create new chat thread', true);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      addMessage('bot', '⚠️ Failed to create new chat thread', true);
    } finally {
      setIsCreatingThread(false);
    }
    return null;
  };

  const saveConversation = async (threadId, diagramData = null) => {
    if (!threadId || !token) {
      console.warn('Cannot save conversation: missing threadId or token', {
        threadId,
        hasToken: !!token,
      });
      return;
    }

    console.log(
      'Saving conversation to thread:',
      threadId,
      'version:',
      currentVersion
    );
    setIsSaving(true);

    try {
      const conversationData = {
        thread_id: threadId,
        version: currentVersion,
        diagram_json: diagramData || {},
        messages: messages.map((msg) => ({
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      };

      const response = await fetch(
        `${apiBaseUrl}/architecture/threads/${threadId}/conversations`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conversationData),
        }
      );

      if (response.ok) {
        const savedConversation = await response.json();
        console.log('Conversation saved successfully:', savedConversation);

        setCurrentVersion(currentVersion + 1);
        setConversationHistory((prev) => [...prev, savedConversation]);

        // Trigger thread refresh in Threads component
        dispatch(triggerThreadRefresh());

        addMessage(
          'bot',
          `💾 Conversation saved successfully! (Version ${savedConversation.version})`
        );
      } else {
        console.error(
          'Failed to save conversation:',
          response.status,
          response.statusText
        );
        const errorData = await response.json().catch(() => ({}));
        console.error('Save error details:', errorData);
        addMessage('bot', '⚠️ Failed to save conversation', true);
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      addMessage('bot', '⚠️ Failed to save conversation', true);
    } finally {
      setIsSaving(false);
    }
  };

  const loadThread = async (threadId) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/architecture/threads/${threadId}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        const conversations = await response.json();
        setConversationHistory(conversations);

        if (conversations.length > 0) {
          const sortedConversations = conversations.sort(
            (a, b) => b.version - a.version
          );
          const latestConversation = sortedConversations[0];

          let loadedMessages;
          if (
            latestConversation.diagram_json &&
            latestConversation.diagram_json.messages
          ) {
            loadedMessages = latestConversation.diagram_json.messages.map(
              (msg, index) => ({
                id: `loaded-${index}`,
                type: msg.type,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
              })
            );
          } else {
            loadedMessages = [
              {
                id: 'loaded-welcome',
                type: 'bot',
                content: `🔄 Conversation loaded from version ${latestConversation.version}! Your diagram has been restored. You can continue the conversation or ask for updates.`,
                timestamp: new Date(latestConversation.created_at),
              },
            ];
          }

          setMessages(loadedMessages);
          setCurrentThreadId(threadId);
          setCurrentVersion(latestConversation.version + 1);
          setShowThreads(false);

          // Update Redux
          dispatch(
            setCurrentThread({
              threadId,
              threadName: null,
              currentVersion: latestConversation.version + 1,
            })
          );

          if (latestConversation.diagram_json && handleGenerateDiagram) {
            handleGenerateDiagram(latestConversation.diagram_json);
          }

          addMessage(
            'bot',
            `🔄 Ready to continue! Current version: ${latestConversation.version}. What would you like to update?`
          );
        }
      } else {
        console.error('Failed to load conversations:', response.status);
        addMessage('bot', '⚠️ Failed to load conversation history', true);
      }
    } catch (error) {
      console.error('Error loading thread:', error);
      addMessage('bot', '⚠️ Failed to load conversation', true);
    }
  };

  const analyzeProject = async (description) => {
    try {
      const response = await fetch(`${apiBaseUrl}/architecture/analyze`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing project:', error);
      throw error;
    }
  };

  const generateDiagram = async (
    description,
    context,
    responses,
    type = 'architecture'
  ) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/architecture/generate-diagram`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            context: context || {},
            clarification_responses: responses || {},
            diagram_type: type,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      if (handleGenerateDiagram) {
        handleGenerateDiagram(res);
      }
      return res;
    } catch (error) {
      console.error('Error generating diagram:', error);
      throw error;
    }
  };

  const ensureThreadExists = async () => {
    if (currentThreadId) {
      console.log('Thread already exists:', currentThreadId);
      return currentThreadId;
    }

    if (!token) {
      console.warn('No auth token provided, cannot create thread');
      return null;
    }

    console.log('Creating new thread...');
    const threadId = await createThread();
    if (threadId) {
      console.log('Thread created and set:', threadId);
    }
    return threadId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      if (awaitingClarification && currentAnalysis) {
        const questionIndex = Object.keys(clarificationResponses).length;
        const newResponses = {
          ...clarificationResponses,
          [`question_${questionIndex}`]: userMessage,
        };
        setClarificationResponses(newResponses);

        if (
          Object.keys(newResponses).length >=
          currentAnalysis.clarification_questions.length
        ) {
          setAwaitingClarification(false);
          addMessage(
            'bot',
            `🎨 Perfect! I have everything I need. Crafting your ${diagramType} diagram with some AI magic...`
          );

          const threadId = await ensureThreadExists();

          const diagramData = await generateDiagram(
            currentAnalysis.original_description,
            currentAnalysis.extracted_context,
            newResponses,
            diagramType
          );

          addMessage(
            'bot',
            `🚀 Boom! Your ${
              diagramType === 'architecture' ? 'architecture' : 'database'
            } diagram is ready! Created ${
              diagramData.nodes?.length || 0
            } components with ${
              diagramData.edges?.length || 0
            } smart connections. Check it out in your main workspace!`
          );

          if (threadId) {
            await saveConversation(threadId, diagramData);
          }

          if (window.updateDiagramFromChat) {
            window.updateDiagramFromChat(diagramData);
          }
        } else {
          const nextQuestionIndex = Object.keys(newResponses).length;
          addMessage(
            'bot',
            `💡 Got it! Next up: ${currentAnalysis.clarification_questions[nextQuestionIndex]}`
          );
        }
      } else {
        const threadId = await ensureThreadExists();

        const analysis = await analyzeProject(userMessage);
        setCurrentAnalysis({
          ...analysis,
          original_description: userMessage,
        });

        if (analysis.needs_clarification) {
          setAwaitingClarification(true);
          setClarificationResponses({});
          addMessage(
            'bot',
            `🔍 Awesome! I analyzed your ${
              analysis.project_domain
            } project (${Math.round(
              analysis.completeness_score * 100
            )}% complete). Let me ask a few quick questions to make it perfect:`
          );
          addMessage('bot', `🎯 ${analysis.clarification_questions[0]}`);
        } else {
          addMessage(
            'bot',
            `🎉 Excellent! Your ${analysis.project_domain} project looks great. Let me generate your ${diagramType} diagram now...`
          );

          const diagramData = await generateDiagram(
            userMessage,
            analysis.extracted_context,
            {},
            diagramType
          );

          addMessage(
            'bot',
            `✅ Done! Your ${
              diagramType === 'architecture' ? 'architecture' : 'database'
            } diagram is live with ${
              diagramData.nodes?.length || 0
            } components and ${diagramData.edges?.length || 0} connections!`
          );

          if (threadId) {
            await saveConversation(threadId, diagramData);
          }

          if (window.updateDiagramFromChat) {
            window.updateDiagramFromChat(diagramData);
          }
        }
      }
    } catch (error) {
      console.error('Error during chat submission:', error);
      addMessage(
        'bot',
        `💥 Oops! Something went wrong: ${error.message}. Let's try that again!`,
        true
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagramTypeChange = (type) => {
    dispatch(setDiagramType(type));
    addMessage(
      'bot',
      `🔄 Switched to ${
        type === 'architecture' ? 'Architecture' : 'Database'
      } mode! Ready to create some ${
        type === 'architecture' ? 'system magic' : 'data wizardry'
      }?`
    );
  };

  const handleReset = () => {
    setCurrentAnalysis(null);
    setClarificationResponses({});
    setAwaitingClarification(false);
    setCurrentThreadId(null);
    setCurrentVersion(0);
    setConversationHistory([]);
    setMessages([
      {
        id: `${Date.now()}-reset`,
        type: 'bot',
        content:
          "🔥 Fresh start! Tell me about your project and let's build something amazing together!",
        timestamp: new Date(),
      },
    ]);
  };

  const handleNewChat = () => {
    handleReset();
    setShowThreads(false);
  };

  const handleSaveCurrentChat = async () => {
    const threadId = await ensureThreadExists();

    if (threadId) {
      await saveConversation(threadId);
    } else {
      addMessage(
        'bot',
        '⚠️ Unable to save chat - failed to create thread',
        true
      );
    }
  };

  return (
    <>
      {/* Floating Button with Pulse Animation */}
      <div className='fixed bottom-6 right-6 z-50'>
        <div
          className={`relative transition-all duration-500 ${
            isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20'></div>
          <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-30'></div>

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

      {/* Chat Window - Rest of the component remains same */}
      {isOpen && (
        <div className='fixed bottom-6 right-6 z-50 w-[420px] h-[90vh] backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden transition-all duration-500 animate-in slide-in-from-bottom-10'>
          {/* Header */}
          <div className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-5 rounded-t-2xl'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-90'></div>
            <div
              className='absolute inset-0 animate-pulse'
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>

            <div className='relative flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='relative'>
                  <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm'>
                    <Bot size={24} className='text-white' />
                  </div>
                  <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse'></div>
                </div>
                <div>
                  <h3 className='font-bold text-lg'>AI Architect</h3>
                  <p className='text-sm text-white/80 flex items-center gap-1'>
                    <Zap size={12} />
                    {diagramType === 'architecture'
                      ? 'System Design Expert'
                      : 'Database Wizard'}
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setShowThreads(!showThreads)}
                  className='w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group'
                  title='Chat History'
                >
                  <History
                    size={16}
                    className='text-white group-hover:scale-110 transition-transform duration-200'
                  />
                </button>
                {token && (
                  <button
                    onClick={handleSaveCurrentChat}
                    disabled={isSaving || isCreatingThread}
                    className='w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group disabled:opacity-50'
                    title='Save Chat'
                  >
                    {isSaving || isCreatingThread ? (
                      <Loader2 size={16} className='text-white animate-spin' />
                    ) : (
                      <Save
                        size={16}
                        className='text-white group-hover:scale-110 transition-transform duration-200'
                      />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className='w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group'
                >
                  <X
                    size={18}
                    className='text-white group-hover:rotate-90 transition-transform duration-200'
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Thread History Sidebar */}
          {showThreads && (
            <div className='bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 max-h-48 overflow-y-auto'>
              <div className='p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-semibold text-gray-800 flex items-center gap-2'>
                    <History size={16} />
                    Chat History
                  </h4>
                  <button
                    onClick={handleNewChat}
                    className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm'
                  >
                    <Plus size={14} />
                    New Chat
                  </button>
                </div>
                {isLoadingThreads ? (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 size={20} className='animate-spin text-gray-500' />
                  </div>
                ) : threads.length > 0 ? (
                  <div className='space-y-2'>
                    {threads.map((thread) => (
                      <button
                        key={thread.thread_id || thread.id}
                        onClick={() =>
                          loadThread(thread.thread_id || thread.id)
                        }
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          currentThreadId === (thread.thread_id || thread.id)
                            ? 'bg-blue-100 border-2 border-blue-300'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className='font-medium text-sm text-gray-800 truncate'>
                          {thread.thread_name ||
                            thread.title ||
                            'Untitled Chat'}
                        </div>
                        <div className='text-xs text-gray-500 mt-1'>
                          {new Date(
                            thread.created_at || Date.now()
                          ).toLocaleString()}
                        </div>
                        <div className='text-xs text-blue-600 mt-1 capitalize'>
                          {thread.diagram_type || 'architecture'}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className='text-gray-500 text-sm text-center py-4'>
                    No previous chats found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mode Selector */}
          <div className='p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-100/50'>
            <div className='flex items-center justify-between'>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleDiagramTypeChange('architecture')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform ${
                    diagramType === 'architecture'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-gray-50 hover:scale-105'
                  }`}
                >
                  🏗️ Architecture
                </button>
                <button
                  onClick={() => handleDiagramTypeChange('db_diagram')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform ${
                    diagramType === 'db_diagram'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-gray-50 hover:scale-105'
                  }`}
                >
                  🗄️ Database
                </button>
              </div>
              <button
                onClick={handleReset}
                className='px-3 py-2 rounded-lg text-sm bg-gray-200/80 text-gray-700 hover:bg-gray-300/80 transition-all duration-200 backdrop-blur-sm'
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-gray-50/30'>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                } animate-in fade-in-50 slide-in-from-bottom-3`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`flex items-start space-x-3 max-w-[85%] ${
                    message.type === 'user'
                      ? 'flex-row-reverse space-x-reverse'
                      : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User size={18} />
                    ) : message.isError ? (
                      <AlertCircle size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : message.isError
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200'
                        : 'bg-white/80 text-gray-800 border border-gray-100'
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
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className='flex justify-start animate-in fade-in-50'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-lg'>
                    <Loader2 size={18} className='animate-spin' />
                  </div>
                  <div className='bg-gradient-to-r from-gray-100 to-white text-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 backdrop-blur-sm'>
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
                      <span className='text-sm'>AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className='p-4 bg-gradient-to-r from-white/50 to-gray-50/50 backdrop-blur-sm border-t border-gray-100/50'>
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
                  awaitingClarification
                    ? '🤔 Your answer...'
                    : currentThreadId
                    ? '💬 Continue the conversation or ask for updates...'
                    : '✨ Describe your dream project...'
                }
                className='flex-1 border-2 border-gray-200/50 rounded-2xl px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 placeholder:text-gray-500'
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isLoading}
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl p-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 disabled:hover:scale-100 group'
              >
                {isLoading ? (
                  <Loader2 size={20} className='animate-spin' />
                ) : (
                  <Send
                    size={20}
                    className='group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200'
                  />
                )}
              </button>
            </div>
            {awaitingClarification && currentAnalysis && (
              <div className='mt-3 flex items-center justify-between text-xs'>
                <span className='text-gray-500'>
                  Question {Object.keys(clarificationResponses).length + 1} of{' '}
                  {currentAnalysis.clarification_questions.length}
                </span>
                <div className='flex space-x-1'>
                  {Array.from(
                    { length: currentAnalysis.clarification_questions.length },
                    (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          i < Object.keys(clarificationResponses).length
                            ? 'bg-green-400'
                            : i === Object.keys(clarificationResponses).length
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
                  <>
                    💾 Thread: {String(currentThreadId).slice(0, 8)}... (v
                    {currentVersion})
                  </>
                ) : (
                  <>📝 New conversation</>
                )}
              </span>
              {(isSaving || isCreatingThread) && (
                <span className='flex items-center gap-1'>
                  <Loader2 size={12} className='animate-spin' />
                  {isCreatingThread ? 'Creating thread...' : 'Saving...'}
                </span>
              )}
            </div>
            {currentThreadId && !awaitingClarification && (
              <div className='mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2'>
                💡 You can now ask me to update, modify, or enhance your
                diagram!
                <br />
                Try: "Add authentication", "Make it more scalable", "Add a cache
                layer"
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
