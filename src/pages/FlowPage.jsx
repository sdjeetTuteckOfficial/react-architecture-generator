import React from 'react';
import Sidebar from '../components/Sidebar';
import AppFlowCanvasWrapper from '../components/AppFlowCanvasWrapper'; // Corrected import path
import { useFlowState } from '../hooks/useFlowStates'; // Import the custom hook

export default function FlowPage() {
  // Call useFlowState here to manage the flow's state
  const flowState = useFlowState();
  console.log('flowww', flowState.nodes, flowState.edges);

  return (
    <div className='h-screen flex'>
      <Sidebar nodes={flowState.nodes} edges={flowState.edges} />
      <div className='flex-1 flex flex-col relative'>
        {/* Pass all properties from flowState as props to AppFlowCanvasWrapper */}
        <AppFlowCanvasWrapper {...flowState} />
      </div>
    </div>
  );
}
