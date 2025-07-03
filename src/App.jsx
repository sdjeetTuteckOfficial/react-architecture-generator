// App.js
import React, { useState, useCallback } from 'react';
import FlowCanvas from './components/FlowCanvas';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import { fetchArchitectureJSON } from './api/gemini';

export default function App() {
  const [elements, setElements] = useState({ nodes: [], edges: [] });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePromptSubmit = async (prompt) => {
    try {
      setLoading(true);
      const data = await fetchArchitectureJSON(prompt);
      setElements({ nodes: data.nodes, edges: data.edges });
    } catch (error) {
      console.error('Failed to load architecture', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex h-screen'>
      {loading && (
        <div className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 z-50'>
          <div className='border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12 animate-spin' />
          <span className='ml-4 text-xl font-medium'>
            Generating architecture...
          </span>
        </div>
      )}
      <Sidebar
        selected={selected}
        setElements={setElements}
        elements={elements}
      />
      <div className='flex-1 h-full'>
        <FlowCanvas
          elements={elements}
          onElementsChange={setElements} // ✅ Pass this prop
          setSelected={setSelected}
        />
        <ChatInput onSubmit={handlePromptSubmit} />
      </div>
    </div>
  );
}
