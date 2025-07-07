import React from 'react';
import Sidebar from './components/Sidebar';
import FlowCanvas from './components/FlowCanvas';

export default function App() {
  return (
    <div className='h-screen flex'>
      <Sidebar />
      <div className='flex-1 flex flex-col relative'>
        <FlowCanvas />
      </div>
    </div>
  );
}
