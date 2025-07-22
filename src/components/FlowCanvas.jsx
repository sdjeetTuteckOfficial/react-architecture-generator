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

import { useSelector, useDispatch } from 'react-redux';
import { setUserPrompt } from '../redux/diagramSlice';

import EditModal from '../components/EditModal';
import ChatInput from '../components/ChatInput';
import JamboardToolbar from './Toolbar';
import { fetchDiagramJSON } from '../api/gemini';

// Import constants and utilities
import {
  NODE_TYPES, // NODE_TYPES now includes 'custom' and 'dbTableNode'
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

// --- The entire CustomNodeWithDropZone component definition block has been REMOVED from here ---
// It is now expected to be in src/components/CustomNode.jsx and imported via NODE_TYPES.

function FlowCanvas() {
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

  // Redux State and Dispatch
  const diagramType = useSelector((state) => state.diagram.diagramType);
  const dispatch = useDispatch(); // You have this here, but setUserPrompt isn't dispatched in this file directly

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

  // This function is now passed as onSubmit to ChatInput
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
          let nodeType = 'custom'; // Default to 'custom' for architecture nodes with images or general nodes
          let nodeData = { ...node.data, onEdit: handleEditNode };

          if (diagramType === 'architecture') {
            nodeType = node.data.image ? 'custom' : 'default'; // If no image, fallback to default React Flow node
            nodeData.image = processImagePath(node.data.image);
          } else if (diagramType === 'db_diagram') {
            nodeType = 'dbTableNode'; // Explicitly use the DbTableNode for database diagrams
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
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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

      // Logic for dropping an image onto an existing 'custom' node to replace its image
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

      // Logic for dropping a rectangle type
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

      // Logic for dropping a new custom node (e.g., image node from toolbar)
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
    // Set a distinct color for DB table nodes on the minimap
    if (node.type === 'dbTableNode') {
      return '#8b5cf6'; // A shade of purple, for example
    }
    return '#1a192b'; // Default color for other nodes (like 'custom' or 'default')
  }, []);

  // Effects
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.type === 'styledRectangle' && node.data.showCount) {
          // This logic currently counts 'custom' nodes.
          // If you want to count 'dbTableNode's within styled rectangles as well,
          // you'd adjust this filter:
          // const regularNodes = currentNodes.filter((n) => n.type === 'custom' || n.type === 'dbTableNode');
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
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, selectedEdges, addResizableRectangle, handleDeleteNode]);

  return (
    <>
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
          isLoading={loading}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={handleSelectionChange}
          nodeTypes={NODE_TYPES} // This is where React Flow gets your custom node types
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

      {/* Use the ChatInput component and pass handleGenerateDiagram as onSubmit */}
      <ChatInput onSubmit={handleGenerateDiagram} />
    </>
  );
}

// Export the component wrapped in ReactFlowProvider
export default function AppFlowCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
