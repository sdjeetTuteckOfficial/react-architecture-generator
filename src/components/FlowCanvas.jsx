import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import {
  ResizableTransparentRectangle,
  StyledResizableRectangle,
} from './TransparentRectangleNode';
import EditModal from '../components/EditModal';
import ChatInput from './ChatInput';
import JamboardToolbar from './Toolbar'; // Import the new JamboardToolbar component
import { fetchArchitectureJSON } from '../api/gemini';

const nodeTypes = {
  custom: CustomNode,
  resizableRectangle: ResizableTransparentRectangle,
  styledRectangle: StyledResizableRectangle,
};

function FlowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { fitView, project, getViewport, toObject } = useReactFlow(); // Add toObject for export

  // Function to add a resizable transparent rectangle
  const addResizableRectangle = useCallback(
    (type = 'resizableRectangle') => {
      const viewport = getViewport();
      // Position in center of current view
      const position = {
        x: -viewport.x / viewport.zoom + 200,
        y: -viewport.y / viewport.zoom + 150,
      };

      const rectangleConfigs = {
        resizableRectangle: {
          label: 'Group Area',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          borderColor: '#3b82f6',
          textColor: '#1e40af',
          borderRadius: '12px',
          fontSize: '12px',
          showPattern: false,
        },
        styledRectangle: {
          title: 'Component Group',
          centerLabel: 'Drag nodes here',
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          borderColor: '#10b981',
          borderStyle: 'dashed',
          gradientStart: 'rgba(16, 185, 129, 0.02)',
          gradientEnd: 'rgba(59, 130, 246, 0.02)',
          gradient: true,
          shadow: true,
          showCount: true,
          nodeCount: 0,
        },
      };

      const newNode = {
        id: `rectangle-${Date.now()}`,
        type: type,
        position,
        data: rectangleConfigs[type],
        // Initial size
        style: {
          width: 300,
          height: 200,
          zIndex: -1,
        },
        zIndex: -1,
        // Make it draggable and selectable
        draggable: true,
        selectable: true,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes, getViewport]
  );

  const handlePromptSubmit = async (prompt) => {
    try {
      setLoading(true);
      const data = await fetchArchitectureJSON(prompt);

      const newNodes = data.nodes.map((node) => ({
        ...node,
        type: node.type || 'custom',
        position: node.position || { x: 100, y: 100 },
        data: {
          ...node.data,
          image: node.data.image ? `/images/${node.data.image}` : null,
          onEdit: (nodeId) => {
            // Modified to receive nodeId from CustomNode
            const nodeToEdit = nodes.find((n) => n.id === nodeId);
            if (nodeToEdit) {
              setSelectedNode(nodeToEdit);
              setIsModalOpen(true);
            }
          },
        },
        // Ensure regular nodes have higher z-index than rectangles
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
      // Optional: Show an error message to the user
      alert('Failed to generate architecture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = project({
        x: event.clientX - 250,
        y: event.clientY,
      });

      if (['resizableRectangle', 'styledRectangle'].includes(type)) {
        // Position where dropped
        const newNode = {
          id: `rectangle-${Date.now()}`,
          type: type,
          position,
          data:
            type === 'resizableRectangle'
              ? {
                  label: 'Dropped Area',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  borderColor: '#3b82f6',
                }
              : {
                  title: 'Dropped Group',
                  centerLabel: 'Group area',
                  backgroundColor: 'rgba(16, 185, 129, 0.06)',
                  borderColor: '#10b981',
                },
          style: { width: 250, height: 180, zIndex: -1 },
          zIndex: -1,
        };

        setNodes((nds) => [...nds, newNode]);
        return;
      }

      const newNode = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: `${type} node`,
          image: null,
          onEdit: (nodeId) => {
            // Pass nodeId to onEdit here too
            const nodeToEdit = nodes.find((n) => n.id === nodeId);
            if (nodeToEdit) {
              setSelectedNode(nodeToEdit);
              setIsModalOpen(true);
            }
          },
        },
        zIndex: 1, // Regular nodes above rectangles
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes, nodes] // Add 'nodes' to dependencies for onEdit
  );

  // Export Flow
  const onExportFlow = useCallback(() => {
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

  // Import Flow
  const onImportFlow = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flow = JSON.parse(e.target.result);
          if (flow.nodes && flow.edges) {
            // Re-attach onEdit function
            const importedNodes = flow.nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                onEdit: (nodeId) => {
                  // Make sure this is re-attached
                  const nodeToEdit = flow.nodes.find((n) => n.id === nodeId);
                  if (nodeToEdit) {
                    setSelectedNode(nodeToEdit);
                    setIsModalOpen(true);
                  }
                },
                // Ensure image path is correct if loaded from local
                image:
                  node.data.image && !node.data.image.startsWith('/')
                    ? `/images/${node.data.image.split('/').pop()}` // Correct path if it was 'image.png'
                    : node.data.image,
              },
            }));

            setNodes(importedNodes || []);
            setEdges(flow.edges || []);
            setTimeout(() => fitView({ padding: 0.2 }), 100);
            alert('Flow imported successfully!');
          } else {
            alert('Invalid flow file structure.');
          }
        } catch (error) {
          console.error('Error parsing flow file:', error);
          alert('Failed to import flow. Invalid JSON file.');
        } finally {
          // Clear the file input after import attempt
          event.target.value = null;
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges, fitView]
  );

  // Update node count in styled rectangles when nodes change
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.type === 'styledRectangle' && node.data.showCount) {
          // Count overlapping nodes (simplified logic, may need refinement for exact overlap)
          const regularNodes = currentNodes.filter((n) => n.type === 'custom');
          const overlapping = regularNodes.filter((regNode) => {
            const rectWidth = node.style?.width || 300;
            const rectHeight = node.style?.height || 200;
            const rectBounds = {
              left: node.position.x,
              right: node.position.x + rectWidth,
              top: node.position.y,
              bottom: node.position.y + rectHeight,
            };

            // Basic check if node center is within the rectangle's bounds
            // For more accurate checking, you'd need node dimensions
            const nodeCenterX = regNode.position.x + (regNode.width || 0) / 2;
            const nodeCenterY = regNode.position.y + (regNode.height || 0) / 2;

            return (
              nodeCenterX > rectBounds.left &&
              nodeCenterX < rectBounds.right &&
              nodeCenterY > rectBounds.top &&
              nodeCenterY < rectBounds.bottom
            );
          }).length;

          if (overlapping !== node.data.nodeCount) {
            return {
              ...node,
              data: { ...node.data, nodeCount: overlapping },
            };
          }
        }
        return node;
      })
    );
  }, [nodes.length, setNodes]); // Depend on nodes.length to trigger updates when nodes are added/removed

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === 'Delete' &&
        (selectedNodes.length > 0 || selectedEdges.length > 0)
      ) {
        e.preventDefault(); // Prevent default browser delete behavior
        setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
        setEdges((eds) => eds.filter((e) => !selectedEdges.includes(e.id)));
        setSelectedNodes([]);
        setSelectedEdges([]);
      }

      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        // Ctrl for Windows/Linux, Meta (Command) for Mac
        switch (e.key) {
          case 'r':
            e.preventDefault(); // Prevent browser refresh
            addResizableRectangle('resizableRectangle');
            break;
          case 'g':
            e.preventDefault(); // Prevent browser find
            addResizableRectangle('styledRectangle');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, selectedEdges, addResizableRectangle]);

  const handleUpdateNode = useCallback(
    (updatedNode) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === updatedNode.id
            ? {
                ...n,
                data: {
                  ...updatedNode.data,
                  // Ensure onEdit is always correctly re-attached
                  onEdit: (nodeId) => {
                    const nodeToEdit = prev.find((node) => node.id === nodeId);
                    if (nodeToEdit) {
                      setSelectedNode(nodeToEdit);
                      setIsModalOpen(true);
                    }
                  },
                },
              }
            : n
        )
      );
      setIsModalOpen(false);
    },
    [setNodes]
  ); // Depend on setNodes

  const handleDeleteNode = useCallback(
    (id) => {
      setNodes((prev) => prev.filter((n) => n.id !== id));
      setEdges((prev) =>
        prev.filter((e) => e.source !== id && e.target !== id)
      );
      setSelectedNode(null);
      setIsModalOpen(false);
    },
    [setNodes, setEdges]
  ); // Depend on setNodes, setEdges

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
        {/* Replace the old buttons with the new JamboardToolbar component */}
        <JamboardToolbar
          onExport={onExportFlow}
          onImport={onImportFlow}
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
          onSelectionChange={({
            nodes: selectedNodes = [],
            edges: selectedEdges = [],
          }) => {
            // Only update state if selection actually changed to avoid unnecessary re-renders
            const nextSelectedNodeIds = selectedNodes.map((n) => n.id);
            const nextSelectedEdgeIds = selectedEdges.map((e) => e.id);

            setSelectedNodes((prev) => {
              if (
                JSON.stringify(prev) !== JSON.stringify(nextSelectedNodeIds)
              ) {
                return nextSelectedNodeIds;
              }
              return prev;
            });
            setSelectedEdges((prev) => {
              if (
                JSON.stringify(prev) !== JSON.stringify(nextSelectedEdgeIds)
              ) {
                return nextSelectedEdgeIds;
              }
              return prev;
            });
          }}
          nodeTypes={nodeTypes}
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
            nodeColor={(node) => {
              if (
                node.type === 'resizableRectangle' ||
                node.type === 'styledRectangle'
              ) {
                return node.data.borderColor || '#3b82f6';
              }
              return '#1a192b';
            }}
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
