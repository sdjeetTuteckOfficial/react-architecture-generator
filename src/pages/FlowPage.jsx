import React from 'react';
import Sidebar from '../components/Sidebar';
import AppFlowCanvasWrapper from '../components/AppFlowCanvasWrapper';
import { useFlowState } from '../hooks/useFlowStates';
import { ReactFlowProvider } from 'reactflow';

export default function FlowPage() {
  // Single source of truth for flow state
  const flowState = useFlowState();

  return (
    <ReactFlowProvider>
      <div className='h-screen flex'>
        <Sidebar
          // Pass the state setters to Sidebar
          {...flowState}
        />
        <div className='flex-1 flex flex-col relative'>
          <AppFlowCanvasWrapper {...flowState} />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
