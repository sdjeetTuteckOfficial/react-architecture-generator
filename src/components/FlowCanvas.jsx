// FlowCanvas.js
import React, { useCallback, useEffect } from 'react';
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

const nodeTypes = { custom: CustomNode };

function FlowCanvasInner({
  elements,
  onElementsChange,
  setSelected,
  openModal,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(elements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(elements.edges);
  const { fitView, project } = useReactFlow();

  useEffect(() => {
    const nodesWithEdit = elements.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onEdit: (id) => {
          const n = elements.nodes.find((n) => n.id === id);
          setSelected(n);
          openModal();
        },
      },
    }));

    setNodes(nodesWithEdit);
    setEdges(elements.edges);

    const timeout = setTimeout(() => fitView({ padding: 0.2 }), 50);
    return () => clearTimeout(timeout);
  }, [elements]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const position = project({
        x: event.clientX - 250, // offset for sidebar width
        y: event.clientY,
      });

      const newNode = {
        id: `${+new Date()}`,
        type: 'custom',
        position,
        data: {
          label: `${type} node`,
          image: null,
          onEdit: (id) => {
            const n = nodes.find((n) => n.id === id);
            setSelected(n);
            openModal();
          },
        },
      };

      setNodes((nds) => nds.concat(newNode));
      onElementsChange((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));
    },
    [project, setNodes, onElementsChange, openModal, setSelected, nodes]
  );

  return (
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
        nodeTypes={nodeTypes}
        fitView
        className='bg-gray-100 w-full h-full'
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function FlowCanvas(props) {
  return (
    <ReactFlowProvider>
      <div className='w-full h-full relative'>
        <FlowCanvasInner {...props} />
      </div>
    </ReactFlowProvider>
  );
}
