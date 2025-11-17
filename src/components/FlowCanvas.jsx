import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSelector, useDispatch } from 'react-redux';
import { Save, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import DbTableEditor from './DbTableEditor';
import EditModal from '../components/EditModal';
import JamboardToolbar from './Toolbar';
import { fetchDiagramJSON } from '../api/gemini';
import { domToPng } from 'modern-screenshot';
import {
  NODE_TYPES,
  RECTANGLE_CONFIGS,
  KEYBOARD_SHORTCUTS,
} from '../constants/flow_constants';
import {
  calculateViewportPosition,
  createRectangleNode,
  createCustomNode,
  createDbNode,
  processImagePath,
  isWithinBounds,
} from '../hooks/useFlowStates';
import FloatingChatWebSocket from './chat-v2/FloatingChatWebSocket';

// Change Notification Popover Component
const ChangeNotificationPopover = ({ isVisible, onUpdate, isSaving }) => {
  if (!isVisible) return null;

  return (
    <div
      className='fixed top-20 right-8 z-[60]'
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
          }
        }
      `}</style>
      <div className='bg-white rounded-2xl shadow-2xl border border-blue-200 backdrop-blur-sm overflow-hidden'>
        <div className='px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100'>
              <RefreshCw size={16} className='text-blue-600' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-semibold text-gray-800'>
                Diagram Changed
              </p>
              <p className='text-xs text-gray-600'>
                Your changes are not saved yet
              </p>
            </div>
          </div>
        </div>
        <div className='px-5 py-3 bg-white border-t border-gray-100'>
          <button
            onClick={onUpdate}
            disabled={isSaving}
            className='w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-400 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed'
            style={
              !isSaving
                ? {
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }
                : {}
            }
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className='animate-spin' />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Update Diagram</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Save Status Toast Component (for success/error messages)
const SaveStatusToast = ({ status, message }) => {
  if (status === 'idle') return null;

  const statusConfig = {
    success: {
      icon: Check,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      iconClass: '',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      iconClass: '',
    },
  };

  const config = statusConfig[status] || statusConfig.success;
  const Icon = config.icon;

  return (
    <div
      className='fixed top-20 right-8 z-[60]'
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div
        className={`${config.bgColor} ${config.textColor} rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-3 border border-white/20 backdrop-blur-sm`}
      >
        <Icon size={20} className={config.iconClass} />
        <span className='font-medium text-sm'>{message}</span>
      </div>
    </div>
  );
};

// FlowCanvas Component
function FlowCanvas({
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
  const { fitView, project, getViewport, toObject } = useReactFlow();
  const diagramType = useSelector((state) => state.diagram.diagramType);
  const dispatch = useDispatch();

  // Change detection state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [currentThreadId, setCurrentThreadId] = useState(null);

  const lastSaveRef = useRef(null);
  const statusTimeoutRef = useRef(null);
  const dragDiagramRef = useRef(null);

  // Auto-hide success/error messages after 3 seconds
  useEffect(() => {
    if (saveStatus === 'success' || saveStatus === 'error') {
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, [saveStatus]);

  // Manual save function (kept for backward compatibility, but uses WebSocket drag)
  const handleManualUpdate = useCallback(async () => {
    if (!currentThreadId || nodes.length === 0) {
      console.log('⏭️ Cannot save: No thread or nodes', {
        threadId: currentThreadId,
        nodeCount: nodes.length,
      });
      return;
    }

    console.log('💾 Sending drag update via WebSocket...', {
      threadId: currentThreadId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });

    setIsSaving(true);

    try {
      // Send drag event via WebSocket
      if (dragDiagramRef.current) {
        const diagramData = {
          nodes: nodes,
          edges: edges,
          metadata: {
            diagram_type: diagramType,
            node_count: nodes.length,
            edge_count: edges.length,
            timestamp: new Date().toISOString(),
          },
        };

        const success = dragDiagramRef.current(diagramData);

        if (success) {
          const currentState = JSON.stringify({
            nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
            edges: edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          });
          lastSaveRef.current = currentState;

          setHasUnsavedChanges(false);
          setSaveStatus('success');
          setSaveMessage('Diagram updated successfully!');
          console.log('✅ Drag update sent via WebSocket');
        } else {
          setSaveStatus('error');
          setSaveMessage('Failed to send drag update');
          console.error('❌ WebSocket not ready');
        }
      } else {
        // WebSocket not available yet - show popover
        console.log(
          '⚠️ WebSocket drag not available, please wait for connection'
        );
        setSaveStatus('error');
        setSaveMessage('WebSocket not connected, please try again');
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage('Failed to update diagram');
      console.error('❌ Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentThreadId, nodes, edges, diagramType]);

  // Check for changes
  const checkForChanges = useCallback(() => {
    if (!currentThreadId || nodes.length === 0) return;

    const currentState = JSON.stringify({
      nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
      })),
    });

    if (lastSaveRef.current && lastSaveRef.current !== currentState) {
      setHasUnsavedChanges(true);
    }
  }, [currentThreadId, nodes, edges]);

  const handleScreenshot = useCallback(async () => {
    try {
      const flowElement = document.querySelector('.react-flow');

      if (!flowElement) {
        alert('Unable to find diagram');
        return;
      }

      const minimap = document.querySelector('.react-flow__minimap');
      const controls = document.querySelector('.react-flow__controls');
      const toolbar = document.querySelector('.absolute.top-4.left-4');

      const elementsToHide = [minimap, controls, toolbar].filter(Boolean);
      const originalDisplays = elementsToHide.map((el) => el.style.display);
      elementsToHide.forEach((el) => (el.style.display = 'none'));

      const allElements = flowElement.querySelectorAll('*');
      const originalStyles = [];

      allElements.forEach((el, index) => {
        const computedStyle = window.getComputedStyle(el);

        originalStyles[index] = {
          element: el,
          color: el.style.color,
          backgroundColor: el.style.backgroundColor,
          borderColor: el.style.borderColor,
          display: el.style.display,
          WebkitLineClamp: el.style.WebkitLineClamp,
          WebkitBoxOrient: el.style.WebkitBoxOrient,
          whiteSpace: el.style.whiteSpace,
          overflow: el.style.overflow,
        };

        const color = computedStyle.color;
        const bgColor = computedStyle.backgroundColor;
        const borderColor = computedStyle.borderColor;

        if (color && (color.includes('oklch') || color.includes('color('))) {
          el.style.color = computedStyle.color;
        }
        if (
          bgColor &&
          (bgColor.includes('oklch') || bgColor.includes('color('))
        ) {
          el.style.backgroundColor = computedStyle.backgroundColor;
        }
        if (
          borderColor &&
          (borderColor.includes('oklch') || borderColor.includes('color('))
        ) {
          el.style.borderColor = computedStyle.borderColor;
        }

        if (el.style.display === '-webkit-box') {
          el.style.display = 'block';
        }
        el.style.WebkitLineClamp = 'unset';
        el.style.WebkitBoxOrient = 'unset';

        if (el.textContent && el.textContent.trim()) {
          el.style.whiteSpace = 'normal';
          el.style.wordWrap = 'break-word';
          el.style.wordBreak = 'break-word';
          el.style.overflowWrap = 'break-word';
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await domToPng(flowElement, {
        backgroundColor: '#f9fafb',
        scale: 2,
        quality: 1,
        pixelRatio: 2,
        features: {
          removeControlCharacter: true,
        },
        style: {
          transform: 'scale(1)',
        },
      });

      allElements.forEach((el, index) => {
        const original = originalStyles[index];
        if (original && original.element === el) {
          el.style.color = original.color;
          el.style.backgroundColor = original.backgroundColor;
          el.style.borderColor = original.borderColor;
          el.style.display = original.display;
          el.style.WebkitLineClamp = original.WebkitLineClamp;
          el.style.WebkitBoxOrient = original.WebkitBoxOrient;
          el.style.whiteSpace = original.whiteSpace;
          el.style.overflow = original.overflow;
        }
      });

      elementsToHide.forEach((el, i) => {
        el.style.display = originalDisplays[i];
      });

      const link = document.createElement('a');
      link.download = `diagram-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Screenshot error:', error);

      const minimap = document.querySelector('.react-flow__minimap');
      const controls = document.querySelector('.react-flow__controls');
      const toolbar = document.querySelector('.absolute.top-4.left-4');
      [minimap, controls, toolbar].forEach((el) => {
        if (el) el.style.display = '';
      });

      alert('Failed to capture screenshot. Error: ' + error.message);
    }
  }, []);

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

  const handleDiagramUpdate = useCallback(
    (data) => {
      console.log('Updating diagram with data:', data);
      const newNodes = data.nodes.map((node) => {
        let nodeType = 'custom';
        let nodeData = { ...node.data, onEdit: handleEditNode };

        if (data.metadata.diagram_type === 'architecture') {
          nodeType = node.data.image ? 'custom' : 'default';
          nodeData.image = processImagePath(node.data.image);
        } else if (data.metadata.diagram_type === 'db_diagram') {
          nodeType = 'dbTableNode';
        }

        return {
          ...node,
          type: nodeType,
          position: node.position || { x: 100, y: 100 },
          data: nodeData,
          zIndex: node.zIndex || 1,
        };
      });

      const nodeIds = new Set(newNodes.map((n) => n.id));
      const newEdges = data.edges
        .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
        .map((e, i) => ({ id: e.id || `edge-${i}`, ...e }));

      setNodes(newNodes);
      setEdges(newEdges);

      // Reset change detection
      lastSaveRef.current = JSON.stringify({
        nodes: newNodes.map((n) => ({ id: n.id, position: n.position })),
        edges: newEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
        })),
      });
      setHasUnsavedChanges(false);

      setTimeout(() => fitView({ padding: 0.2 }), 100);
    },
    [handleEditNode, setNodes, setEdges, fitView]
  );

  const addResizableRectangle = useCallback(
    (type = 'resizableRectangle') => {
      const viewport = getViewport();
      const position = calculateViewportPosition(viewport);
      const config = RECTANGLE_CONFIGS[type];

      const newNode = createRectangleNode(type, position, config);
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, getViewport]
  );

  const addCustomNode = useCallback(
    (initialLabel = 'New Custom Node', type = 'custom') => {
      const viewport = getViewport();
      const position = calculateViewportPosition(viewport);

      let newNode = null;
      if (type === 'custom') {
        newNode = createCustomNode(position, type, handleEditNode);
      } else {
        newNode = createDbNode(position, type, handleEditNode);
      }

      newNode.data = {
        ...newNode.data,
        label: initialLabel,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, getViewport, handleEditNode]
  );

  const handleGenerateDiagram = useCallback(
    async (prompt) => {
      if (!prompt) {
        alert('Please enter a prompt to generate a diagram.');
        return;
      }

      try {
        setLoading(true);
        const data = await fetchDiagramJSON(prompt, diagramType);

        const newNodes = data.nodes.map((node) => {
          let nodeType = 'custom';
          let nodeData = { ...node.data, onEdit: handleEditNode };

          if (diagramType === 'architecture') {
            nodeType = node.data.image ? 'custom' : 'default';
            nodeData.image = processImagePath(node.data.image);
          } else if (diagramType === 'db_diagram') {
            nodeType = 'dbTableNode';
          }

          return {
            ...node,
            type: nodeType,
            position: node.position || { x: 100, y: 100 },
            data: nodeData,
            zIndex: node.zIndex || 1,
          };
        });

        const nodeIds = new Set(newNodes.map((n) => n.id));
        const newEdges = data.edges
          .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
          .map((e, i) => ({ id: e.id || `edge-${i}`, ...e }));

        setNodes(newNodes);
        setEdges(newEdges);
        setTimeout(() => fitView({ padding: 0.2 }), 100);
      } catch (err) {
        console.error('Error loading diagram:', err);
        alert('Failed to generate diagram. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, handleEditNode, setNodes, setEdges, fitView, diagramType]
  );

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      checkForChanges();
    },
    [setEdges, checkForChanges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const imageSrc = event.dataTransfer.getData('image/src');
      const imageName = event.dataTransfer.getData('image/name');

      const elementBelow = document.elementFromPoint(
        event.clientX,
        event.clientY
      );

      const nodeElement = elementBelow?.closest('.react-flow__node');

      if (type === 'imageNode' && imageSrc && nodeElement) {
        const nodeId = nodeElement.getAttribute('data-id');
        const targetNode = nodes.find(
          (node) => node.id === nodeId && node.type === 'custom'
        );

        if (targetNode) {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === nodeId
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      image: imageSrc,
                    },
                  }
                : node
            )
          );
          return;
        }
      }

      const position = project({
        x: event.clientX - (event.target.getBoundingClientRect().left || 0),
        y: event.clientY - (event.target.getBoundingClientRect().top || 0),
      });

      if (['resizableRectangle', 'styledRectangle'].includes(type)) {
        const config = {
          ...RECTANGLE_CONFIGS[type],
          ...(type === 'resizableRectangle'
            ? { label: 'Dropped Area' }
            : { title: 'Dropped Group', centerLabel: 'Group area' }),
        };

        const newNode = createRectangleNode(type, position, config);
        newNode.style = { width: 250, height: 180, zIndex: -1 };
        setNodes((nds) => [...nds, newNode]);
        return;
      }

      const newNode = createCustomNode(position, type, handleEditNode);

      if (type === 'imageNode' && imageSrc) {
        newNode.data.image = imageSrc;
        newNode.data.label = imageName || 'Image node';
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes, handleEditNode, nodes]
  );

  const handleExportFlow = useCallback(() => {
    const flow = toObject();
    const jsonString = JSON.stringify(flow, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'react-flow-architecture.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Flow exported successfully!');
  }, [toObject]);

  const handleImportFlow = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);

          if (!flow.nodes || !flow.edges) {
            alert('Invalid flow file structure.');
            return;
          }

          const importedNodes = flow.nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onEdit: handleEditNode,
              image: processImagePath(node.data.image),
            },
          }));

          setNodes(importedNodes);
          setEdges(flow.edges);
          setTimeout(() => fitView({ padding: 0.2 }), 100);
          alert('Flow imported successfully!');
        } catch (error) {
          console.error('Error parsing flow file:', error);
          alert('Failed to import flow. Invalid JSON file.');
        } finally {
          event.target.value = null;
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges, fitView, handleEditNode]
  );

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
      checkForChanges();
    },
    [
      setNodes,
      setEdges,
      setSelectedNode,
      setSelectedNodes,
      setSelectedEdges,
      setIsModalOpen,
      checkForChanges,
    ]
  );

  const handleSelectionChange = useCallback(
    ({ nodes: newSelectedNodes = [], edges: newSelectedEdges = [] }) => {
      const nextSelectedNodeIds = newSelectedNodes.map((n) => n.id).sort();
      const nextSelectedEdgeIds = newSelectedEdges.map((e) => e.id).sort();

      setSelectedNodes((prev) => {
        const prevSorted = [...prev].sort();
        return JSON.stringify(prevSorted) !==
          JSON.stringify(nextSelectedNodeIds)
          ? nextSelectedNodeIds
          : prev;
      });

      setSelectedEdges((prev) => {
        const prevSorted = [...prev].sort();
        return JSON.stringify(prevSorted) !==
          JSON.stringify(nextSelectedEdgeIds)
          ? nextSelectedEdgeIds
          : prev;
      });
    },
    [setSelectedNodes, setSelectedEdges]
  );

  const getMiniMapNodeColor = useCallback((node) => {
    if (node.type === 'resizableRectangle' || node.type === 'styledRectangle') {
      return node.data.borderColor || '#3b82f6';
    }
    if (node.type === 'dbTableNode') {
      return '#8b5cf6';
    }
    return '#1a192b';
  }, []);

  // Handle node drag stop - send drag event via WebSocket or show change notification
  const onNodeDragStop = useCallback(
    (event, node) => {
      console.log('🎯 Node drag stopped:', node.id);

      // If WebSocket drag is available and thread exists, send immediately
      if (dragDiagramRef.current && currentThreadId && nodes.length > 0) {
        console.log('📤 Sending drag event via WebSocket');

        const diagramData = {
          nodes: nodes,
          edges: edges,
          metadata: {
            diagram_type: diagramType,
            node_count: nodes.length,
            edge_count: edges.length,
            timestamp: new Date().toISOString(),
          },
        };

        const success = dragDiagramRef.current(diagramData);
        if (success) {
          const currentState = JSON.stringify({
            nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
            edges: edges.map((e) => ({
              id: e.id,
              source: e.source,
              target: e.target,
            })),
          });
          lastSaveRef.current = currentState;
          setHasUnsavedChanges(false);
          console.log('✅ Drag sent via WebSocket');
        } else {
          // If WebSocket fails, show the popover for manual save
          checkForChanges();
        }
      } else {
        // Fallback: show change notification popover
        checkForChanges();
      }
    },
    [
      nodes,
      edges,
      currentThreadId,
      diagramType,
      dragDiagramRef,
      checkForChanges,
    ]
  );

  // Enhanced onNodesChange to detect movements
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      const hasPositionChange = changes.some(
        (change) => change.type === 'position' && change.dragging === false
      );

      if (hasPositionChange) {
        checkForChanges();
      }
    },
    [onNodesChange, checkForChanges]
  );

  // Trigger on edge changes
  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);

      const hasEdgeChange = changes.some(
        (change) => change.type === 'add' || change.type === 'remove'
      );

      if (hasEdgeChange) {
        checkForChanges();
      }
    },
    [onEdgesChange, checkForChanges]
  );

  // Callback to receive thread ID from WebSocket component
  const handleThreadIdChange = useCallback((threadId) => {
    console.log('🔄 Thread ID updated:', threadId);
    setCurrentThreadId(threadId);
  }, []);

  // Callback to receive dragDiagram function from WebSocket component
  const handleDragDiagramCallback = useCallback((dragFunction) => {
    console.log('🔗 Drag function received from WebSocket');
    dragDiagramRef.current = dragFunction;
  }, []);

  useEffect(() => {
    let updatedAnyNode = false;
    const nextNodes = nodes.map((node) => {
      if (node.type === 'styledRectangle' && node.data.showCount) {
        const regularNodes = nodes.filter(
          (n) => n.type === 'custom' || n.type === 'dbTableNode'
        );
        const rectSize = {
          width: node.style?.width || 300,
          height: node.style?.height || 200,
        };

        const overlappingCount = regularNodes.filter((regNode) =>
          isWithinBounds(
            regNode.position,
            { width: regNode.width || 0, height: regNode.height || 0 },
            node.position,
            rectSize
          )
        ).length;

        if (overlappingCount !== node.data.nodeCount) {
          updatedAnyNode = true;
          return {
            ...node,
            data: { ...node.data, nodeCount: overlappingCount },
          };
        }
      }
      return node;
    });

    if (updatedAnyNode) {
      setNodes(nextNodes);
    }
  }, [nodes, setNodes]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === KEYBOARD_SHORTCUTS.DELETE &&
        (selectedNodes.length > 0 || selectedEdges.length > 0)
      ) {
        e.preventDefault();
        handleDeleteNode(null);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case KEYBOARD_SHORTCUTS.ADD_RECTANGLE:
            e.preventDefault();
            addResizableRectangle('resizableRectangle');
            break;
          case KEYBOARD_SHORTCUTS.ADD_GROUP:
            e.preventDefault();
            addResizableRectangle('styledRectangle');
            break;
          case 'n':
            e.preventDefault();
            addCustomNode();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodes,
    selectedEdges,
    addResizableRectangle,
    handleDeleteNode,
    addCustomNode,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Change Notification Popover */}
      <ChangeNotificationPopover
        isVisible={hasUnsavedChanges && !isSaving}
        onUpdate={handleManualUpdate}
        isSaving={isSaving}
      />

      {/* Save Status Toast */}
      <SaveStatusToast status={saveStatus} message={saveMessage} />

      {loading && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-white bg-opacity-70'>
          <div className='w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin' />
          <span className='ml-4 text-lg font-medium text-gray-700'>
            {diagramType === 'architecture'
              ? 'Generating architecture...'
              : 'Generating DB diagram...'}
          </span>
        </div>
      )}

      <div
        className='w-full h-full relative'
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <JamboardToolbar
          onExport={handleExportFlow}
          onImport={handleImportFlow}
          onAddRectangle={() => addResizableRectangle('resizableRectangle')}
          onAddGroup={() => addResizableRectangle('styledRectangle')}
          onAddCustomNode={addCustomNode}
          isLoading={loading}
          onScreenshot={handleScreenshot}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={handleSelectionChange}
          nodeTypes={NODE_TYPES}
          fitView
          className='bg-gray-50 w-full h-full'
          elevateNodesOnSelect={false}
          selectNodesOnDrag={true}
          multiSelectionKeyCode='Shift'
        >
          <MiniMap
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
            nodeColor={getMiniMapNodeColor}
          />
          <Controls />
          <Background />
        </ReactFlow>
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

      <FloatingChatWebSocket
        handleGenerateDiagram={handleDiagramUpdate}
        onThreadIdChange={handleThreadIdChange}
        onDragDiagram={handleDragDiagramCallback}
      />
    </>
  );
}

export default FlowCanvas;
