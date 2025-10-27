// src/hooks/useArchitectureWebSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { triggerThreadRefresh } from '../../redux/threadSlice';

const getWebSocketURL = () => {
  const isDev = import.meta.env.DEV;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  if (isDev) {
    return 'ws://localhost:8000';
  } else {
    const host = window.location.host;
    return `${protocol}//${host}`;
  }
};

export const useArchitectureWebSocket = ({ onDiagramGenerated, clientId }) => {
  const token = localStorage.getItem('authToken');
  const diagramType = useSelector((state) => state.diagram.diagramType);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isUnmountedRef = useRef(false);
  const maxReconnectAttempts = 5;
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [memoryContext, setMemoryContext] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);

  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [awaitingClarification, setAwaitingClarification] = useState(false);
  const [clarificationProgress, setClarificationProgress] = useState(null);

  const addMessage = useCallback((type, content, metadata = {}) => {
    if (isUnmountedRef.current) return;

    const newMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date().toISOString(),
      ...metadata,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const handleWebSocketMessage = useCallback(
    (data) => {
      if (isUnmountedRef.current) return;

      console.log('📨 Message received:', data.type);

      switch (data.type) {
        case 'connected':
        case 'authenticated':
          addMessage('bot', data.message);
          break;

        case 'thread_created':
          setCurrentThreadId(data.thread_id);
          setCurrentVersion(0);
          setConversationHistory([]); // Clear history for new thread
          setMemoryContext(null);
          addMessage('bot', data.message);
          break;

        case 'thread_loaded':
          setCurrentThreadId(data.thread_id);
          setCurrentVersion(data.version);
          setMemoryContext(data.memory_context);
          setConversationHistory(data.conversations || []);
          addMessage('bot', data.message);

          if (data.memory_context) {
            addMessage(
              'bot',
              `📚 Memory: ${data.memory_context.previous_versions} versions, ` +
                `${data.memory_context.total_components} components`
            );
          }
          break;

        case 'processing':
          setIsProcessing(true);
          addMessage('bot', data.message);
          break;

        case 'info':
          addMessage('bot', data.message);
          break;

        case 'clarification_needed':
          setIsProcessing(false);
          setAwaitingClarification(true);
          addMessage('bot', data.message);
          if (data.questions?.[0]) {
            addMessage('bot', `🎯 ${data.questions[0]}`);
            setClarificationProgress({
              current: 1,
              total: data.questions.length,
            });
          }
          break;

        case 'next_question':
          addMessage('bot', data.question);
          setClarificationProgress(data.progress);
          break;

        case 'generating':
          setIsProcessing(true);
          addMessage('bot', data.message);
          break;

        case 'diagram_generated':
        case 'diagram_modified':
          setIsProcessing(false);
          setAwaitingClarification(false);
          setClarificationProgress(null);
          setCurrentVersion(data.version + 1);
          dispatch(triggerThreadRefresh());
          // Update conversation history
          if (data.diagram) {
            setConversationHistory((prev) => [
              ...prev,
              {
                version: data.version,
                diagram_json: data.diagram,
                created_at: new Date().toISOString(),
                conversation_id: `conv_${Date.now()}`,
              },
            ]);
          }

          addMessage('bot', data.message);

          if (onDiagramGenerated && data.diagram) {
            console.log('✅ Calling diagram callback', data);
            onDiagramGenerated(data.diagram);
          }

          if (data.metadata) {
            const isModification = data.metadata.is_modification
              ? ' (Modified)'
              : '';
            addMessage(
              'bot',
              `📊 ${data.metadata.node_count} components, ${data.metadata.edge_count} connections${isModification}`
            );
          }
          break;

        case 'error':
          setIsProcessing(false);
          addMessage('bot', data.message, { isError: true });
          break;

        case 'pong':
          break;

        default:
          console.warn('⚠️ Unknown message type:', data.type);
      }
    },
    [addMessage, onDiagramGenerated]
  );

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;

      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close(1000, 'Client disconnect');
      }
      wsRef.current = null;
    }

    if (!isUnmountedRef.current) {
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  const connect = useCallback(() => {
    if (isUnmountedRef.current) {
      console.log('⚠️ Component unmounted, skipping connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected');
      return;
    }

    if (isConnecting) {
      console.log('⏳ Already connecting');
      return;
    }

    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      const errorMsg =
        'Max reconnection attempts reached. Please refresh the page.';
      setConnectionError(errorMsg);
      addMessage('system', `❌ ${errorMsg}`, { isError: true });
      return;
    }

    try {
      if (wsRef.current) {
        disconnect();
      }

      setIsConnecting(true);
      setConnectionError(null);

      const wsBaseUrl = getWebSocketURL();
      const wsUrl = `${wsBaseUrl}/ws/architecture/${clientId}`;

      console.log('🔌 Connecting to:', wsUrl);

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN && !isUnmountedRef.current) {
          console.error('❌ Connection timeout');
          ws.close();
          setConnectionError('Connection timeout - Server may be down');
          setIsConnecting(false);
        }
      }, 10000);

      ws.onopen = () => {
        if (isUnmountedRef.current) {
          ws.close();
          return;
        }

        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connected');

        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;

        if (token) {
          console.log('🔐 Authenticating...');
          ws.send(JSON.stringify({ type: 'auth', token }));
        } else {
          console.warn('⚠️ No auth token');
          addMessage('system', '⚠️ Not authenticated');
        }

        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        addMessage('system', '✨ Connected to AI Architect!');
      };

      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return;

        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Parse error:', error);
        }
      };

      ws.onerror = (error) => {
        if (isUnmountedRef.current) return;

        clearTimeout(connectionTimeout);
        console.error('❌ WebSocket error:', error);

        const errorMsg =
          'Connection error - Check if server is running on port 8000';
        setConnectionError(errorMsg);
        addMessage('system', `⚠️ ${errorMsg}`, { isError: true });
      };

      ws.onclose = (event) => {
        if (isUnmountedRef.current) return;

        clearTimeout(connectionTimeout);
        console.log('🔌 Connection closed. Code:', event.code);

        setIsConnected(false);
        setIsConnecting(false);

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            10000
          );

          addMessage(
            'system',
            `🔄 Reconnecting in ${delay / 1000}s... (${
              reconnectAttemptsRef.current
            }/${maxReconnectAttempts})`,
            { isError: true }
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmountedRef.current) {
              connect();
            }
          }, delay);
        } else if (event.code !== 1000) {
          setConnectionError('Connection lost. Please refresh.');
        }
      };
    } catch (error) {
      console.error('❌ Connection error:', error);
      setIsConnecting(false);
      setConnectionError(`Failed: ${error.message}`);
      addMessage('system', `❌ ${error.message}`, { isError: true });
    }
  }, [
    clientId,
    token,
    isConnecting,
    addMessage,
    handleWebSocketMessage,
    disconnect,
  ]);

  const sendMessage = useCallback(
    (message) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('❌ Not connected');
        addMessage('system', '❌ Not connected', { isError: true });
        return false;
      }

      try {
        console.log('📤 Sending:', message.type);
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('❌ Send error:', error);
        addMessage('system', '❌ Failed to send message', { isError: true });
        return false;
      }
    },
    [addMessage]
  );

  const createThread = useCallback(
    (threadName) => {
      return sendMessage({
        type: 'create_thread',
        thread_name: threadName || `Chat ${new Date().toLocaleString()}`,
      });
    },
    [sendMessage]
  );

  const loadThread = useCallback(
    (threadId) => {
      return sendMessage({
        type: 'load_thread',
        thread_id: threadId,
      });
    },
    [sendMessage]
  );

  const analyzeProject = useCallback(
    (description) => {
      addMessage('user', description);
      return sendMessage({
        type: 'analyze',
        description,
        diagram_type: diagramType,
      });
    },
    [sendMessage, addMessage, diagramType]
  );

  // ✅ NEW: Add modify function for diagram modifications
  const modifyDiagram = useCallback(
    (modification) => {
      addMessage('user', modification);
      return sendMessage({
        type: 'modify',
        modification,
      });
    },
    [sendMessage, addMessage]
  );

  const sendClarificationResponse = useCallback(
    (response) => {
      addMessage('user', response);
      return sendMessage({
        type: 'clarification_response',
        response,
      });
    },
    [sendMessage, addMessage]
  );

  useEffect(() => {
    isUnmountedRef.current = false;
    console.log('🚀 Component mounted, connecting...');

    const initTimeout = setTimeout(() => {
      if (!isUnmountedRef.current) {
        connect();
      }
    }, 100);

    return () => {
      console.log('🧹 Component unmounting');
      isUnmountedRef.current = true;
      clearTimeout(initTimeout);
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
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
    modifyDiagram, // ✅ Export the new function
    sendClarificationResponse,
    addMessage,
  };
};

export default useArchitectureWebSocket;
