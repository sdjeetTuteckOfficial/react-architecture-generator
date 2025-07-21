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

  const { fitView, project, getViewport } = useReactFlow();

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
          onEdit: () => {
            setSelectedNode(node);
            setIsModalOpen(true);
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
          onEdit: () => {
            setSelectedNode(newNode);
            setIsModalOpen(true);
          },
        },
        zIndex: 1, // Regular nodes above rectangles
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [project, setNodes]
  );

  // Update node count in styled rectangles when nodes change
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.type === 'styledRectangle' && node.data.showCount) {
          // Count overlapping nodes (simplified logic)
          const regularNodes = currentNodes.filter((n) => n.type === 'custom');
          const overlapping = regularNodes.filter((regNode) => {
            const rectBounds = {
              left: node.position.x,
              right: node.position.x + (node.style?.width || 300),
              top: node.position.y,
              bottom: node.position.y + (node.style?.height || 200),
            };

            return (
              regNode.position.x >= rectBounds.left - 50 &&
              regNode.position.x <= rectBounds.right + 50 &&
              regNode.position.y >= rectBounds.top - 50 &&
              regNode.position.y <= rectBounds.bottom + 50
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
  }, [nodes.length, setNodes]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
        setEdges((eds) => eds.filter((e) => !selectedEdges.includes(e.id)));
        setSelectedNodes([]);
        setSelectedEdges([]);
      }

      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'r':
            e.preventDefault();
            addResizableRectangle('resizableRectangle');
            break;
          case 'g':
            e.preventDefault();
            addResizableRectangle('styledRectangle');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, selectedEdges, addResizableRectangle]);

  const handleUpdateNode = (updatedNode) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === updatedNode.id
          ? {
              ...n,
              data: {
                ...updatedNode.data,
                onEdit: () => {
                  setSelectedNode(updatedNode);
                  setIsModalOpen(true);
                },
              },
            }
          : n
      )
    );
    setIsModalOpen(false);
  };

  const handleDeleteNode = (id) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
    setIsModalOpen(false);
  };

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
        {/* Control buttons */}
        <div className='absolute top-4 right-4 z-10 flex flex-col gap-2'>
          <button
            onClick={() => addResizableRectangle('resizableRectangle')}
            className='px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors shadow-lg'
            title='Add resizable rectangle (Ctrl+R)'
          >
            📦 Rectangle
          </button>
          <button
            onClick={() => addResizableRectangle('styledRectangle')}
            className='px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors shadow-lg'
            title='Add styled group (Ctrl+G)'
          >
            🎯 Group
          </button>
        </div>

        {/* Instructions */}
        <div className='absolute top-4 left-4 z-10 bg-white/90 rounded-lg p-3 text-sm text-gray-600 shadow-lg max-w-xs'>
          <div className='font-semibold mb-2'>Rectangle Controls:</div>
          <div>• Select rectangle to resize with handles</div>
          <div>• Rectangles stay behind other nodes</div>
          <div>
            • <kbd className='px-1 bg-gray-200 rounded'>Ctrl+R</kbd> Basic
            rectangle
          </div>
          <div>
            • <kbd className='px-1 bg-gray-200 rounded'>Ctrl+G</kbd> Styled
            group
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={({ nodes = [], edges = [] }) => {
            const nextSelectedNodeIds = nodes.map((n) => n.id);
            const nextSelectedEdgeIds = edges.map((e) => e.id);

            setSelectedNodes((prev) =>
              JSON.stringify(prev) !== JSON.stringify(nextSelectedNodeIds)
                ? nextSelectedNodeIds
                : prev
            );
            setSelectedEdges((prev) =>
              JSON.stringify(prev) !== JSON.stringify(nextSelectedEdgeIds)
                ? nextSelectedEdgeIds
                : prev
            );
          }}
          nodeTypes={nodeTypes}
          fitView
          className='bg-gray-50 w-full h-full'
          // Important settings for proper layering
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
