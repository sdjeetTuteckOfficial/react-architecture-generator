import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import EditModal from '../components/EditModal';
import ChatInput from './ChatInput';
import JamboardToolbar from './Toolbar';
import { fetchArchitectureJSON } from '../api/gemini';

// Import constants and utilities
import {
  NODE_TYPES,
  RECTANGLE_CONFIGS,
  KEYBOARD_SHORTCUTS,
} from '../constants/flow_constants';
import {
  useFlowState,
  calculateViewportPosition,
  createRectangleNode,
  createCustomNode,
  processImagePath,
  isWithinBounds,
} from '../hooks/useFlowStates';

// Main component
function FlowCanvasInner() {
  const {
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
  } = useFlowState();

  const { fitView, project, getViewport, toObject } = useReactFlow();

  // Event handlers
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

  const handlePromptSubmit = useCallback(
    async (prompt) => {
      try {
        setLoading(true);
        const data = await fetchArchitectureJSON(prompt);

        const newNodes = data.nodes.map((node) => ({
          ...node,
          type: node.type || 'custom',
          position: node.position || { x: 100, y: 100 },
          data: {
            ...node.data,
            image: processImagePath(node.data.image),
            onEdit: handleEditNode,
          },
          zIndex: node.zIndex || 1,
        }));

        const nodeIds = new Set(newNodes.map((n) => n.id));
        const newEdges = data.edges
          .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
          .map((e, i) => ({ id: e.id || `edge-${i}`, ...e }));

        setNodes(newNodes);
        setEdges(newEdges);
        setTimeout(() => fitView({ padding: 0.2 }), 100);
      } catch (err) {
        console.error('Error loading architecture:', err);
        alert('Failed to generate architecture. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, handleEditNode, setNodes, setEdges, fitView]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const imageSrc = event.dataTransfer.getData('image/src');

      // Get the drop position
      const position = project({
        x: event.clientX - 250,
        y: event.clientY,
      });

      // Check if we're dropping an image
      if (type === 'imageNode' && imageSrc) {
        // Find if there's an existing node at the drop position
        const droppedOnNode = nodes.find((node) => {
          if (node.type !== 'custom') return false;

          const nodeWidth = node.width || 150; // Default width
          const nodeHeight = node.height || 100; // Default height

          return (
            position.x >= node.position.x &&
            position.x <= node.position.x + nodeWidth &&
            position.y >= node.position.y &&
            position.y <= node.position.y + nodeHeight
          );
        });

        if (droppedOnNode) {
          // Replace the existing node's image
          setNodes((nds) =>
            nds.map((node) =>
              node.id === droppedOnNode.id
                ? {
                    ...node,
                    data: {
                      ...node.data,
                      image: imageSrc,
                      label: node.data.label || `Image node`, // Keep existing label or set default
                    },
                  }
                : node
            )
          );
          return; // Exit early, don't create a new node
        }
      }

      // Original logic for creating new nodes
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

      // Create new custom node (including image nodes)
      const newNode = createCustomNode(position, type, handleEditNode);

      // If it's an image node, set the image source
      if (type === 'imageNode' && imageSrc) {
        newNode.data.image = imageSrc;
        newNode.data.label = 'Image node';
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes, handleEditNode, nodes]
  );

  // Alternative: More precise collision detection using DOM elements
  const onDropWithDOMDetection = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const imageSrc = event.dataTransfer.getData('image/src');

      // Check if we're dropping an image
      if (type === 'imageNode' && imageSrc) {
        // Get the element under the mouse cursor
        const elementBelow = document.elementFromPoint(
          event.clientX,
          event.clientY
        );

        // Find the closest node element
        const nodeElement = elementBelow?.closest('[data-id]');

        if (nodeElement) {
          const nodeId = nodeElement.getAttribute('data-id');
          const targetNode = nodes.find(
            (node) => node.id === nodeId && node.type === 'custom'
          );

          if (targetNode) {
            // Replace the existing node's image
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
            return; // Exit early, don't create a new node
          }
        }
      }

      // Original logic for other cases...
      const position = project({
        x: event.clientX - 250,
        y: event.clientY,
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
        newNode.data.label = 'Image node';
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes, handleEditNode, nodes]
  );

  // Enhanced Custom Node Component with drop zone highlighting
  const CustomNodeWithDropZone = ({ data, selected }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e) => {
      e.preventDefault();
      const type = e.dataTransfer.types.includes('application/reactflow');
      const hasImage = e.dataTransfer.types.includes('image/src');

      if (type && hasImage) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = () => {
      setIsDragOver(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragOver(false);
      // Let the parent onDrop handler deal with this
    };

    return (
      <div
        className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
          selected ? 'border-blue-500' : 'border-gray-200'
        } ${isDragOver ? 'border-dashed border-blue-400 bg-blue-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Image display */}
        {data.image && (
          <div className='mb-2'>
            <img
              src={data.image}
              alt='Node'
              className='w-16 h-16 object-cover rounded mx-auto'
            />
          </div>
        )}

        {/* Node label */}
        <div className='text-center'>
          <div className='text-xs font-medium'>{data.label}</div>
        </div>

        {/* Drop zone indicator */}
        {isDragOver && (
          <div className='absolute inset-0 flex items-center justify-center bg-blue-100 bg-opacity-80 rounded-md'>
            <div className='text-blue-600 text-xs font-medium'>
              Drop to replace image
            </div>
          </div>
        )}

        {/* Edit button */}
        <button
          onClick={() => data.onEdit && data.onEdit(data.id)}
          className='absolute top-1 right-1 text-gray-400 hover:text-gray-600'
        >
          ⚙️
        </button>
      </div>
    );
  };

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
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) =>
        prev.filter((e) => e.source !== id && e.target !== id)
      );
      setSelectedNode(null);
      setIsModalOpen(false);
    },
    [setNodes, setEdges, setSelectedNode, setIsModalOpen]
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes = [], edges: selectedEdges = [] }) => {
      const nextSelectedNodeIds = selectedNodes.map((n) => n.id).sort();
      const nextSelectedEdgeIds = selectedEdges.map((e) => e.id).sort();

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
    return '#1a192b';
  }, []);

  // Effects
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.type === 'styledRectangle' && node.data.showCount) {
          const regularNodes = currentNodes.filter((n) => n.type === 'custom');
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
            return {
              ...node,
              data: { ...node.data, nodeCount: overlappingCount },
            };
          }
        }
        return node;
      })
    );
  }, [nodes.length, setNodes]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected items
      if (
        e.key === KEYBOARD_SHORTCUTS.DELETE &&
        (selectedNodes.length > 0 || selectedEdges.length > 0)
      ) {
        e.preventDefault();
        setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
        setEdges((eds) => eds.filter((e) => !selectedEdges.includes(e.id)));
        setSelectedNodes([]);
        setSelectedEdges([]);
        return;
      }

      // Keyboard shortcuts with Ctrl/Cmd
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
    setNodes,
    setEdges,
    setSelectedNodes,
    setSelectedEdges,
  ]);

  return (
    <>
      {loading && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-white bg-opacity-70'>
          <div className='w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin' />
          <span className='ml-4 text-lg font-medium text-gray-700'>
            Generating architecture...
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
          isLoading={loading}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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

        <EditModal
          isOpen={isModalOpen}
          node={selectedNode}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      </div>

      <ChatInput onSubmit={handlePromptSubmit} />
    </>
  );
}

export default function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
