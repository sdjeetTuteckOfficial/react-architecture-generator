// App.js
import React, { useState, useEffect } from 'react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import EditModal from './components/EditModal';
import { fetchArchitectureJSON } from './api/gemini';

export default function App() {
  const [elements, setElements] = useState({ nodes: [], edges: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateNode = (updatedNode) => {
    setElements((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)),
    }));
  };

  const handleDeleteNode = (id) => {
    setElements((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
    }));
    setSelected(null);
  };

  const handleDeleteEdge = (edgeId) => {
    setElements((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== edgeId),
    }));
  };

  const handlePromptSubmit = async (prompt) => {
    try {
      setLoading(true);
      const data = await fetchArchitectureJSON(prompt);

      const enrichedNodes = data.nodes.map((node) => ({
        ...node,
        type: 'custom',
        position: node.position || { x: 100, y: 100 },
        data: {
          ...node.data,
          onEdit: (id) => {
            const found = data.nodes.find((n) => n.id === id);
            setSelected(found);
            setIsModalOpen(true);
          },
          onDelete: (id) => handleDeleteNode(id),
        },
      }));

      const nodeIds = new Set(enrichedNodes.map((n) => n.id));
      const validEdges = data.edges
        .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
        .map((e, index) => ({
          id: e.id || `edge-${index}`,
          ...e,
        }));

      setElements({ nodes: enrichedNodes, edges: validEdges });
    } catch (error) {
      console.error('Failed to load architecture', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selected) {
        handleDeleteNode(selected.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);
  return (
    <div className='h-screen flex'>
      <Sidebar />

      <div className='flex-1 flex flex-col'>
        {/* Loading Overlay */}
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50'>
            <div className='border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin' />
            <span className='ml-4 text-xl font-medium'>
              Generating architecture...
            </span>
          </div>
        )}

        {/* Top Canvas Area (Take available vertical space) */}
        <div className='flex-1 relative'>
          <FlowCanvas
            elements={elements}
            onElementsChange={setElements}
            setSelected={setSelected}
            openModal={() => setIsModalOpen(true)}
            onDeleteEdge={handleDeleteEdge}
          />
        </div>

        {/* Bottom Chat Input */}
        <ChatInput onSubmit={handlePromptSubmit} />
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={isModalOpen}
        node={selected}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateNode}
        onDelete={handleDeleteNode}
      />
    </div>
  );
}
