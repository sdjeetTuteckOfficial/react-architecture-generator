import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Clock,
  Layers,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentThread,
  setConversationHistory,
  resetThreadRefresh,
  selectShouldRefreshThreads,
} from '../../redux/threadSlice';
import { processImagePath } from '../../hooks/useFlowStates';
import DbTableEditor from '../DbTableEditor';
import EditModal from '../EditModal';
import axiosInstance from '../../security/axios-instance';

export default function Threads({
  showCustomMessageBox,
  onLoadConversation,
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  selectedNode,
  setSelectedNode,
  selectedNodes,
  setSelectedNodes,
  selectedEdges,
  setSelectedEdges,
  isModalOpen,
  setIsModalOpen,
  loading,
  setLoading,
}) {
  const [threads, setThreads] = useState([]);
  const [expandedThread, setExpandedThread] = useState(null);
  const [threadConversations, setThreadConversations] = useState({});
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState({});
  const [error, setError] = useState(null);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef(null);
  const dispatch = useDispatch();

  // Get states from Redux
  const diagramType = useSelector((state) => state.diagram.diagramType);
  const shouldRefreshThreads = useSelector(selectShouldRefreshThreads);

  // Create handleEditNode function
  const handleEditNode = useCallback(
    (nodeId) => {
      setNodes((currentNodes) => {
        const nodeToEdit = currentNodes.find((n) => n.id === nodeId);
        if (nodeToEdit) {
          setSelectedNode(nodeToEdit);
          setIsModalOpen(true);
        }
        return currentNodes;
      });
    },
    [setNodes, setSelectedNode, setIsModalOpen]
  );

  // Handle node updates from modal
  const handleUpdateNode = useCallback(
    (updatedNode) => {
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === updatedNode.id
            ? {
                ...n,
                data: {
                  ...updatedNode.data,
                  onEdit: handleEditNode,
                },
              }
            : n
        )
      );
      setSelectedNode(null);
      setIsModalOpen(false);
    },
    [setNodes, handleEditNode, setSelectedNode, setIsModalOpen]
  );

  // Handle node deletion from modal
  const handleDeleteNode = useCallback(
    (id) => {
      setNodes((prev) => prev.filter((n) => !n.selected));
      setEdges((prev) =>
        prev.filter((e) => !e.selected && e.source !== id && e.target !== id)
      );
      setSelectedNode(null);
      setSelectedNodes([]);
      setSelectedEdges([]);
      setIsModalOpen(false);
    },
    [
      setNodes,
      setEdges,
      setSelectedNode,
      setSelectedNodes,
      setSelectedEdges,
      setIsModalOpen,
    ]
  );

  const fetchThreads = async (newSkip) => {
    setLoadingThreads(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/architecture/threads', {
        params: {
          skip: newSkip,
          limit: limit, // Assuming 'limit' is available in scope
        },
        // Note: The baseURL (http://localhost:8000/) and Authorization header
        // are automatically handled by the axiosInstance configuration/interceptors.
      });

      // --- CORRECTIONS START HERE ---
      // Axios throws an error for non-2xx statuses, replacing the manual '!response.ok' check.
      // Axios returns the JSON response body directly in response.data.
      const data = response.data;

      setThreads((prev) => {
        return newSkip === 0 ? data : [...prev, ...data];
      });
      setHasMore(data.length === limit);
      // --- CORRECTIONS END HERE ---
    } catch (err) {
      // Axios error handling for non-2xx status codes and network errors
      console.error('Error fetching threads:', err);

      // Log detailed error information from the Axios error structure
      const status = err.response ? err.response.status : 'N/A';
      const errorDetail = err.response
        ? err.response.data.detail || 'Server error'
        : 'Network error';

      setError(`Failed to fetch threads: ${errorDetail}`);
      showCustomMessageBox(
        'Fetch Error',
        `Failed to load threads (Status: ${status}). Please check your connection or authentication.`,
        'error'
      );
    } finally {
      setLoadingThreads(false);
    }
  };

  const fetchConversations = async (threadId) => {
    setLoadingConversations((prev) => ({ ...prev, [threadId]: true }));
    try {
      const response = await axiosInstance.get(
        `/architecture/threads/${threadId}/conversations`
      );

      // --- AXIOS CONVERSION START ---
      // Axios throws an error for non-2xx statuses, replacing the manual '!response.ok' check.
      // Axios returns the JSON response body directly in response.data.
      const conversations = response.data;

      const sortedConversations = conversations.sort(
        (a, b) => a.version - b.version
      );

      setThreadConversations((prev) => ({
        ...prev,
        [threadId]: sortedConversations,
      }));

      dispatch(
        setConversationHistory({
          threadId,
          conversations: sortedConversations,
        })
      );
      // --- AXIOS CONVERSION END ---
    } catch (err) {
      // This catch block handles both network errors and non-2xx HTTP status codes.
      const status = err.response ? err.response.status : 'N/A';
      const statusText = err.response
        ? err.response.statusText
        : 'Network Error';

      console.error('Error fetching conversations:', status, statusText, err);
      showCustomMessageBox(
        'Load Error',
        'Failed to load conversation history.',
        'error'
      );
    } finally {
      setLoadingConversations((prev) => ({ ...prev, [threadId]: false }));
    }
  };

  // Initial load
  useEffect(() => {
    fetchThreads(skip);
  }, [skip]);

  // Listen for refresh trigger from FloatingChatButton
  useEffect(() => {
    if (shouldRefreshThreads) {
      console.log('Refresh triggered from chat - reloading threads');
      setSkip(0); // Reset to beginning
      fetchThreads(0); // Fetch from start
      dispatch(resetThreadRefresh()); // Reset the flag
    }
  }, [shouldRefreshThreads, dispatch]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || loadingThreads || !hasMore) return;

    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 10
    ) {
      setSkip((prev) => prev + limit);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [loadingThreads, hasMore]);

  const handleThreadExpand = async (threadId) => {
    if (expandedThread === threadId) {
      setExpandedThread(null);
    } else {
      setExpandedThread(threadId);
      // Always fetch fresh conversations when expanding a thread
      await fetchConversations(threadId);
    }
  };

  const handleLoadVersion = useCallback(
    (thread, conversation) => {
      console.log('conv', conversation);
      if (conversation.diagram_json && conversation.diagram_json.nodes) {
        const processedNodes = conversation.diagram_json.nodes.map((node) => {
          let nodeType = 'custom';
          let nodeData = {
            ...node.data,
            onEdit: handleEditNode,
          };
          console.log('hellllllllllllo', diagramType);
          if (
            conversation.diagram_json.metadata.diagram_type === 'architecture'
          ) {
            nodeType = node.data.image ? 'custom' : 'default';
            nodeData.image = processImagePath(node.data.image);
          } else if (
            conversation.diagram_json.metadata.diagram_type === 'db_diagram'
          ) {
            nodeType = 'dbTableNode';
          }
          // if (diagramType === 'architecture') {
          //   nodeType = node.data.image ? 'custom' : 'default';
          //   nodeData.image = processImagePath(node.data.image);
          // } else if (diagramType === 'db_diagram') {
          //   nodeType = 'dbTableNode';
          // }

          return {
            ...node,
            type: nodeType,
            position: node.position || { x: 100, y: 100 },
            data: nodeData,
            zIndex: node.zIndex || 1,
          };
        });

        setNodes(processedNodes);
      }

      if (conversation.diagram_json && conversation.diagram_json.edges) {
        const nodeIds = new Set(
          conversation.diagram_json.nodes?.map((n) => n.id) || []
        );
        const processedEdges = conversation.diagram_json.edges
          .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
          .map((e, i) => ({ id: e.id || `edge-${i}`, ...e }));

        setEdges(processedEdges);
      }

      setSelectedNode(null);
      setSelectedNodes([]);
      setSelectedEdges([]);
      setIsModalOpen(false);

      dispatch(setCurrentThread(thread.thread_id));

      showCustomMessageBox(
        'Version Loaded',
        `Loaded version ${conversation.version} from ${new Date(
          conversation.created_at
        ).toLocaleDateString()}`,
        'success'
      );
    },
    [
      diagramType,
      handleEditNode,
      setNodes,
      setEdges,
      setSelectedNode,
      setSelectedNodes,
      setSelectedEdges,
      setIsModalOpen,
      dispatch,
      showCustomMessageBox,
    ]
  );

  const formatDate = (dateString) => {
    if (!dateString) return '—';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';

    const now = new Date();

    // Normalize both to midnight in local time (removes time & TZ issues)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const diffDays = Math.floor(
      (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    // Only show month + day (e.g. "Oct 28")
    return target.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='flex flex-col h-full min-h-0'>
      {/* Header */}
      <div className='flex items-center justify-between mb-2 flex-shrink-0'>
        <h3 className='text-sm font-medium text-gray-700'>Conversations</h3>
        <button
          className='p-1 hover:bg-gray-100 rounded transition-colors'
          title='Create new thread'
          onClick={() => fetchThreads(0)}
        >
          <Plus size={14} className='text-gray-500' />
        </button>
      </div>

      {/* Content */}
      <div className='flex-1 min-h-0'>
        {loadingThreads && threads.length === 0 ? (
          <div className='flex items-center justify-center py-4'>
            <Loader2 size={16} className='animate-spin text-blue-500' />
            <span className='ml-2 text-xs text-gray-600'>Loading...</span>
          </div>
        ) : error ? (
          <div className='text-center py-4'>
            <AlertCircle size={16} className='text-red-500 mx-auto mb-1' />
            <p className='text-red-500 text-xs'>{error}</p>
          </div>
        ) : threads.length === 0 ? (
          <div className='text-center py-6'>
            <div className='text-gray-400 text-lg mb-1'>📜</div>
            <p className='text-gray-500 text-xs'>No conversations yet.</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className='h-full border border-gray-200 rounded-md bg-gray-50 overflow-y-auto custom-scrollbar'
          >
            {threads.map((thread) => (
              <div
                key={thread.thread_id}
                className='border-b border-gray-100 last:border-b-0'
              >
                {/* Thread Header */}
                <button
                  onClick={() => handleThreadExpand(thread.thread_id)}
                  className='w-full p-2 hover:bg-gray-100 transition-colors flex items-center text-left'
                >
                  <div className='flex items-center gap-1 flex-1 min-w-0'>
                    {expandedThread === thread.thread_id ? (
                      <ChevronDown
                        size={12}
                        className='text-gray-500 flex-shrink-0'
                      />
                    ) : (
                      <ChevronRight
                        size={12}
                        className='text-gray-500 flex-shrink-0'
                      />
                    )}
                    <div className='flex-1 min-w-0'>
                      <div className='text-xs font-medium text-gray-700 truncate'>
                        {thread.thread_name}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {formatDate(thread.created_at)}
                      </div>
                    </div>
                  </div>
                  {threadConversations[thread.thread_id] && (
                    <span className='text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0'>
                      {threadConversations[thread.thread_id].length}
                    </span>
                  )}
                </button>

                {/* Conversation Timeline */}
                {expandedThread === thread.thread_id && (
                  <div className='bg-white border-t border-gray-100'>
                    {loadingConversations[thread.thread_id] ? (
                      <div className='flex items-center justify-center py-2'>
                        <Loader2
                          size={12}
                          className='animate-spin text-gray-400'
                        />
                        <span className='ml-1 text-xs text-gray-500'>
                          Loading...
                        </span>
                      </div>
                    ) : threadConversations[thread.thread_id] ? (
                      <div className='py-1'>
                        {threadConversations[thread.thread_id].map(
                          (conversation, index) => (
                            <button
                              key={conversation.conversation_id}
                              onClick={() =>
                                handleLoadVersion(thread, conversation)
                              }
                              className='w-full px-2 py-1.5 hover:bg-blue-50 transition-colors flex items-center gap-2 group'
                            >
                              {/* Timeline indicator */}
                              <div className='flex flex-col items-center'>
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    index ===
                                    threadConversations[thread.thread_id]
                                      .length -
                                      1
                                      ? 'bg-blue-500'
                                      : 'bg-gray-300'
                                  }`}
                                />
                                {index <
                                  threadConversations[thread.thread_id].length -
                                    1 && (
                                  <div className='w-px h-4 bg-gray-200 mt-0.5' />
                                )}
                              </div>

                              {/* Version info */}
                              <div className='flex-1 text-left'>
                                <div className='flex items-center gap-1'>
                                  <Layers size={10} className='text-gray-400' />
                                  <span className='text-xs font-medium text-gray-700'>
                                    v{conversation.version}
                                  </span>
                                  {index ===
                                    threadConversations[thread.thread_id]
                                      .length -
                                      1 && (
                                    <span className='text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded'>
                                      Latest
                                    </span>
                                  )}
                                </div>
                                <div className='flex items-center gap-1 mt-0.5'>
                                  <Clock size={8} className='text-gray-400' />
                                  <span className='text-xs text-gray-500'>
                                    {new Date(
                                      conversation.created_at
                                    ).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {conversation.diagram_json?.metadata && (
                                  <div className='text-xs text-gray-400 mt-0.5'>
                                    {
                                      conversation.diagram_json.metadata
                                        .node_count
                                    }{' '}
                                    nodes
                                  </div>
                                )}
                              </div>

                              {/* View indicator */}
                              <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
                                <ChevronRight
                                  size={12}
                                  className='text-blue-500'
                                />
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    ) : (
                      <div className='py-2 text-center text-xs text-gray-500'>
                        No versions available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loadingThreads && threads.length > 0 && (
              <div className='flex items-center justify-center py-2'>
                <Loader2 size={14} className='animate-spin text-blue-500' />
                <span className='ml-1 text-xs text-gray-600'>
                  Loading more...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Components */}
      {selectedNode?.type === 'dbTableNode' ? (
        <DbTableEditor
          isOpen={isModalOpen}
          node={selectedNode}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      ) : (
        <EditModal
          isOpen={isModalOpen}
          node={selectedNode}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      )}
    </div>
  );
}
