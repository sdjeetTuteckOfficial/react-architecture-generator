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
import EditModal from '../components/EditModal';
import ChatInput from './ChatInput';
import { fetchArchitectureJSON } from '../api/gemini';

const nodeTypes = { custom: CustomNode };

function FlowCanvasInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { fitView, project } = useReactFlow();

  // 🧠 Prompt -> fetch architecture
  const handlePromptSubmit = async (prompt) => {
    try {
      setLoading(true);
      const data = await fetchArchitectureJSON(prompt);

      const newNodes = data.nodes.map((node) => ({
        ...node,
        type: 'custom',
        position: node.position || { x: 100, y: 100 },
        data: {
          ...node.data,
          onEdit: () => {
            setSelectedNode(node);
            setIsModalOpen(true);
          },
        },
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

  // 🔗 Connect handler
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // 📦 Drag + drop node creation
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = project({
        x: event.clientX - 250,
        y: event.clientY,
      });

      const newNode = {
        id: `${+new Date()}`,
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
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [project]
  );

  // ⌨️ Delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete') {
        setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
        setEdges((eds) => eds.filter((e) => !selectedEdges.includes(e.id)));
        setSelectedNodes([]);
        setSelectedEdges([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, selectedEdges]);

  const handleUpdateNode = (updatedNode) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === updatedNode.id ? updatedNode : n))
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
      {/* 🔄 Loading */}
      {loading && (
        <div className='w-full h-full relative overflow-hidden'>
          <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50'>
            <div className='w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin' />
            <span className='ml-4 text-lg font-medium text-gray-700'>
              Generating architecture...
            </span>
          </div>
        </div>
      )}

      {/* 🧠 React Flow Canvas */}
      <div
        className='w-full h-full'
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(e, node) => {
            setSelectedNode(node);
            setIsModalOpen(true);
          }}
          onSelectionChange={({ nodes = [], edges = [] }) => {
            const nextSelectedNodeIds = nodes.map((n) => n.id);
            const nextSelectedEdgeIds = edges.map((e) => e.id);

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
          className='bg-gray-100 w-full h-full'
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>

        {/* 📝 Modal */}
        <EditModal
          isOpen={isModalOpen}
          node={selectedNode}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleUpdateNode}
          onDelete={handleDeleteNode}
        />
      </div>

      {/* 💬 Chat Prompt (bottom bar) */}

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
