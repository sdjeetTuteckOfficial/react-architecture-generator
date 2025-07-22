import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';

// Custom hooks
export const useFlowState = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedNode,
    setSelectedNode,
    selectedNodes,
    setSelectedNodes,
    selectedEdges,
    setSelectedEdges,
    isModalOpen,
    setIsModalOpen,
    loading,
    setLoading,
  };
};

// Utility functions
export const createNodeId = () => `${Date.now()}`;
export const createRectangleId = () => `rectangle-${Date.now()}`;

export const calculateViewportPosition = (
  viewport,
  offsetX = 200,
  offsetY = 150
) => ({
  x: -viewport.x / viewport.zoom + offsetX,
  y: -viewport.y / viewport.zoom + offsetY,
});

export const createRectangleNode = (type, position, data) => ({
  id: createRectangleId(),
  type,
  position,
  data,
  style: {
    width: 300,
    height: 200,
    zIndex: -1,
  },
  zIndex: -1,
  draggable: true,
  selectable: true,
});

export const createCustomNode = (position, type, onEdit) => ({
  id: createNodeId(),
  type: 'custom',
  position,
  data: {
    label: `${type} node`,
    image: null,
    onEdit,
  },
  zIndex: 1,
});

export const processImagePath = (imagePath) => {
  if (!imagePath) return null;
  return imagePath.startsWith('/') ? imagePath : `/images/${imagePath}`;
};

export const isWithinBounds = (nodePos, nodeSize, rectPos, rectSize) => {
  const nodeCenterX = nodePos.x + (nodeSize.width || 0) / 2;
  const nodeCenterY = nodePos.y + (nodeSize.height || 0) / 2;

  const rectBounds = {
    left: rectPos.x,
    right: rectPos.x + rectSize.width,
    top: rectPos.y,
    bottom: rectPos.y + rectSize.height,
  };

  return (
    nodeCenterX > rectBounds.left &&
    nodeCenterX < rectBounds.right &&
    nodeCenterY > rectBounds.top &&
    nodeCenterY < rectBounds.bottom
  );
};
