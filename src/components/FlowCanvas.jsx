import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  addEdge,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useSelector, useDispatch } from 'react-redux';
import DbTableEditor from './DbTableEditor';
import EditModal from '../components/EditModal';
import ChatInput from '../components/ChatInput';
import JamboardToolbar from './Toolbar';
import { fetchDiagramJSON } from '../api/gemini';

// Import constants and utilities
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
import FloatingChatButton from './FloatingChatButton';

// FlowCanvas now accepts all flow state and setters as props
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

  const handleDiagramUpdate = (data) => {
    console.log('Updating diagram with data:', data);
    const newNodes = data.nodes.map((node) => {
      let nodeType = 'custom';
      let nodeData = { ...node.data, onEdit: handleEditNode };
      console.log('diagramType', diagramType);
      if (diagramType === 'architecture') {
        nodeType = node.data.image ? 'custom' : 'default';
        nodeData.image = processImagePath(node.data.image);
      } else if (diagramType === 'db_diagram') {
        console.log('Creating DB node:', nodeType, node.data);
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
    // Update nodes with proper onEdit handlers
    // const updatedNodes = diagramData.nodes.map((node) => ({
    //   ...node,
    //   data: {
    //     ...node.data,
    //     onEdit: handleEditNode,
    //   },
    // }));

    // setNodes(updatedNodes);
    // setEdges(diagramData.edges);
    // setTimeout(() => fitView({ padding: 0.2 }), 100);
  };

  // // Make the callback available globally for the chat component
  // useEffect(() => {
  //   window.updateDiagramFromChat = handleDiagramUpdate;
  //   return () => {
  //     delete window.updateDiagramFromChat;
  //   };
  // }, [handleDiagramUpdate]);

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
      console.log('type', type);
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
            console.log('Creating DB node:', nodeType, data);
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

  // FIX FOR "MAXIMUM UPDATE DEPTH EXCEEDED" ERROR
  useEffect(() => {
    let updatedAnyNode = false;
    const nextNodes = nodes.map((node) => {
      if (node.type === 'styledRectangle' && node.data.showCount) {
        // Filter regular nodes for intersection check
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

        // Only create a new node object (and trigger an update) if the count has actually changed
        if (overlappingCount !== node.data.nodeCount) {
          updatedAnyNode = true;
          return {
            ...node,
            data: { ...node.data, nodeCount: overlappingCount },
          };
        }
      }
      return node; // Return the node as is if no update needed
    });

    // Only call setNodes if at least one node's data (nodeCount) was actually modified
    if (updatedAnyNode) {
      setNodes(nextNodes);
    }
  }, [nodes, setNodes]); // Keep nodes and setNodes in dependencies

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
          case 'n': // Ctrl/Cmd + N for new custom node
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
          onAddCustomNode={addCustomNode}
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

      {/* <ChatInput onSubmit={handleGenerateDiagram} /> */}
      <FloatingChatButton
        apiBaseUrl='http://localhost:8000'
        handleGenerateDiagram={handleDiagramUpdate}
      />
    </>
  );
}

// Export the component directly, not wrapped in ReactFlowProvider here
export default FlowCanvas;
