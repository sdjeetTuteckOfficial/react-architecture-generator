import React, { useEffect } from 'react';
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

function FlowCanvasInner({ elements, onElementsChange, setSelected }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(elements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(elements.edges);
  const { fitView } = useReactFlow();

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));
  const onNodeClick = (_, node) => setSelected(node);

  useEffect(() => {
    setNodes(elements.nodes);
    setEdges(elements.edges);
    // Slight delay ensures nodes render before centering
    const timeout = setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 50);
    return () => clearTimeout(timeout);
  }, [elements]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      fitView
      className='bg-gray-100'
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  );
}

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
