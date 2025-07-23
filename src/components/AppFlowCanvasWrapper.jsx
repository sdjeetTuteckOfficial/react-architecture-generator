import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowCanvas from './FlowCanvas'; // Adjust path if necessary

// This wrapper now accepts props and passes them down
export default function AppFlowCanvasWrapper(props) {
  return (
    <ReactFlowProvider>
      {/* Pass all received props to FlowCanvas */}
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
