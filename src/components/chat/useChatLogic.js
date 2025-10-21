import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setDiagramType } from '../../redux/diagramSlice';
import {
  triggerThreadRefresh,
  setCurrentThread,
} from '../../redux/threadSlice';
import chatApiService from './chatApi';

/**
 * Custom hook for managing chat logic and state
 * @param {Object} props - Hook properties
 * @param {Function} props.handleGenerateDiagram - Callback to handle diagram generation
 * @returns {Object} Chat states and functions
 */
export const useChatLogic = ({ handleGenerateDiagram }) => {
  const token = localStorage.getItem('authToken');
  const diagramType = useSelector((state) => state.diagram.diagramType);
  const dispatch = useDispatch();

  // UI States
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThreads, setShowThreads] = useState(false);

  // Message States
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content:
        "✨ Hey there! I'm your AI architecture assistant. Describe your project and I'll craft a stunning architecture diagram for you!",
      timestamp: new Date(),
    },
  ]);

  // Analysis States
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [clarificationResponses, setClarificationResponses] = useState({});
  const [awaitingClarification, setAwaitingClarification] = useState(false);

  // Thread Management States
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Utility Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // NEW: Helper function to update diagram
  const updateDiagram = (diagramData) => {
    console.log('Updating diagram with data:', diagramData);

    try {
      // Validate diagram data
      if (!diagramData) {
        throw new Error('Diagram data is null or undefined');
      }

      if (!diagramData.nodes || !Array.isArray(diagramData.nodes)) {
        console.warn('Invalid or missing nodes array:', diagramData.nodes);
      }

      if (!diagramData.edges || !Array.isArray(diagramData.edges)) {
        console.warn('Invalid or missing edges array:', diagramData.edges);
      }

      // Try the prop function first
      if (
        handleGenerateDiagram &&
        typeof handleGenerateDiagram === 'function'
      ) {
        console.log('Calling handleGenerateDiagram prop...');
        handleGenerateDiagram(diagramData);
        return true;
      }

      // Fallback to global function
      if (
        window.updateDiagramFromChat &&
        typeof window.updateDiagramFromChat === 'function'
      ) {
        console.log('Calling window.updateDiagramFromChat...');
        window.updateDiagramFromChat(diagramData);
        return true;
      }

      console.error('No diagram update function available');
      throw new Error('Diagram update function not found');
    } catch (error) {
      console.error('Error updating diagram:', error);
      addMessage('bot', `⚠️ Failed to update diagram: ${error.message}`, true);
      return false;
    }
  };

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && token) {
      loadThreads();
    }
  }, [isOpen, token]);

  // Thread Management Functions
  const loadThreads = async () => {
    if (!token) {
      console.warn('No auth token available');
      return;
    }

    setIsLoadingThreads(true);
    const result = await chatApiService.loadThreads();

    if (result.success) {
      setThreads(result.data);
    } else {
      addMessage('bot', `⚠️ ${result.error}`, true);
    }

    setIsLoadingThreads(false);
  };

  const createThread = async () => {
    if (!token || isCreatingThread) return null;

    setIsCreatingThread(true);
    console.log('Creating thread with diagram type:', diagramType);

    const result = await chatApiService.createThread(diagramType);

    if (result.success) {
      const { thread, threadId } = result.data;
      console.log('Thread created successfully:', threadId);

      setCurrentThreadId(threadId);
      setThreads((prev) => [thread, ...prev]);

      dispatch(
        setCurrentThread({
          threadId,
          threadName: thread.thread_name,
          currentVersion: 0,
        })
      );
      dispatch(triggerThreadRefresh());

      setIsCreatingThread(false);
      return threadId;
    } else {
      addMessage('bot', `⚠️ ${result.error}`, true);
      setIsCreatingThread(false);
      return null;
    }
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
      currentVersion,
      'diagramData:',
      diagramData
    );
    setIsSaving(true);

    const result = await chatApiService.saveConversation(
      threadId,
      currentVersion,
      messages,
      diagramData
    );

    if (result.success) {
      const savedConversation = result.data;
      console.log('Conversation saved successfully:', savedConversation);

      setCurrentVersion(currentVersion + 1);
      setConversationHistory((prev) => [...prev, savedConversation]);
      dispatch(triggerThreadRefresh());

      addMessage(
        'bot',
        `💾 Conversation saved successfully! (Version ${savedConversation.version})`
      );
    } else {
      addMessage('bot', `⚠️ ${result.error}`, true);
    }

    setIsSaving(false);
  };

  const loadThread = async (threadId) => {
    console.log('Loading thread:', threadId);
    const result = await chatApiService.loadThread(threadId);

    if (result.success) {
      const conversations = result.data;
      setConversationHistory(conversations);

      if (conversations.length > 0) {
        const sortedConversations = conversations.sort(
          (a, b) => b.version - a.version
        );
        const latestConversation = sortedConversations[0];

        console.log('Latest conversation:', latestConversation);

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

        dispatch(
          setCurrentThread({
            threadId,
            threadName: null,
            currentVersion: latestConversation.version + 1,
          })
        );

        // Load diagram data
        if (latestConversation.diagram_json) {
          console.log('Loading diagram from conversation...');
          const diagramLoaded = updateDiagram(latestConversation.diagram_json);

          if (diagramLoaded) {
            addMessage(
              'bot',
              `🔄 Ready to continue! Current version: ${latestConversation.version}. What would you like to update?`
            );
          } else {
            addMessage(
              'bot',
              `⚠️ Thread loaded but diagram could not be displayed. You can still continue the conversation.`,
              true
            );
          }
        } else {
          addMessage(
            'bot',
            `🔄 Thread loaded (no previous diagram). Ready to create something new!`
          );
        }
      }
    } else {
      addMessage('bot', `⚠️ ${result.error}`, true);
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

  // Chat Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      if (awaitingClarification && currentAnalysis) {
        // Handle clarification response
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
          // All clarifications answered, generate diagram
          setAwaitingClarification(false);
          addMessage(
            'bot',
            `🎨 Perfect! I have everything I need. Crafting your ${diagramType} diagram with some AI magic...`
          );

          const threadId = await ensureThreadExists();
          const result = await chatApiService.generateDiagram(
            currentAnalysis.original_description,
            currentAnalysis.extracted_context,
            newResponses,
            diagramType
          );

          if (result.success) {
            const diagramData = result.data;
            console.log('Diagram generated:', diagramData);

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

            // Update the diagram
            const diagramUpdated = updateDiagram(diagramData);

            // Save to thread if available
            if (threadId) {
              await saveConversation(threadId, diagramData);
            }

            if (!diagramUpdated) {
              addMessage(
                'bot',
                '⚠️ Diagram was generated but could not be displayed. Please check console for errors.',
                true
              );
            }
          } else {
            addMessage('bot', `⚠️ ${result.error}`, true);
          }
        } else {
          // Ask next clarification question
          const nextQuestionIndex = Object.keys(newResponses).length;
          addMessage(
            'bot',
            `💡 Got it! Next up: ${currentAnalysis.clarification_questions[nextQuestionIndex]}`
          );
        }
      } else {
        // Initial message - analyze project
        const threadId = await ensureThreadExists();
        const analysisResult = await chatApiService.analyzeProject(userMessage);

        if (!analysisResult.success) {
          addMessage('bot', `⚠️ ${analysisResult.error}`, true);
          setIsLoading(false);
          return;
        }

        const analysis = analysisResult.data;
        setCurrentAnalysis({
          ...analysis,
          original_description: userMessage,
        });

        if (analysis.needs_clarification) {
          // Need clarifications
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
          // No clarifications needed, generate diagram directly
          addMessage(
            'bot',
            `🎉 Excellent! Your ${analysis.project_domain} project looks great. Let me generate your ${diagramType} diagram now...`
          );

          const diagramResult = await chatApiService.generateDiagram(
            userMessage,
            analysis.extracted_context,
            {},
            diagramType
          );

          if (diagramResult.success) {
            const diagramData = diagramResult.data;
            console.log('Diagram generated:', diagramData);

            addMessage(
              'bot',
              `✅ Done! Your ${
                diagramType === 'architecture' ? 'architecture' : 'database'
              } diagram is live with ${
                diagramData.nodes?.length || 0
              } components and ${diagramData.edges?.length || 0} connections!`
            );

            // Update the diagram
            const diagramUpdated = updateDiagram(diagramData);

            // Save to thread if available
            if (threadId) {
              await saveConversation(threadId, diagramData);
            }

            if (!diagramUpdated) {
              addMessage(
                'bot',
                '⚠️ Diagram was generated but could not be displayed. Please check console for errors.',
                true
              );
            }
          } else {
            addMessage('bot', `⚠️ ${diagramResult.error}`, true);
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

  // Other Handlers
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

  return {
    // States
    isOpen,
    setIsOpen,
    messages,
    inputValue,
    setInputValue,
    isLoading,
    currentAnalysis,
    clarificationResponses,
    awaitingClarification,
    currentThreadId,
    threads,
    isLoadingThreads,
    showThreads,
    setShowThreads,
    isSaving,
    isCreatingThread,
    currentVersion,
    conversationHistory,
    diagramType,

    // Refs
    messagesEndRef,
    inputRef,

    // Functions
    handleSubmit,
    handleDiagramTypeChange,
    handleReset,
    handleNewChat,
    handleSaveCurrentChat,
    loadThread,
  };
};

export default useChatLogic;
