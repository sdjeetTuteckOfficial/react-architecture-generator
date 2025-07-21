import React, { useState, useRef, useCallback } from 'react';
import { NodeResizer } from 'reactflow';

const ResizableTransparentRectangle = ({ data, selected, id }) => {
  const [isResizing, setIsResizing] = useState(false);
  const nodeRef = useRef(null);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  return (
    <>
      {/* Node Resizer - provides resize handles */}
      <NodeResizer
        color={data.borderColor || '#3b82f6'}
        isVisible={selected}
        minWidth={100}
        minHeight={80}
        onResizeStart={handleResizeStart}
        onResizeEnd={handleResizeEnd}
      />

      <div
        ref={nodeRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: data.backgroundColor || 'rgba(59, 130, 246, 0.08)',
          border: selected
            ? `2px solid ${data.borderColor || '#3b82f6'}`
            : `1px solid ${data.borderColor || 'rgba(59, 130, 246, 0.3)'}`,
          borderRadius: data.borderRadius || '8px',
          position: 'relative',
          cursor: isResizing ? 'nw-resize' : 'move',
          // Very important: lower z-index so other nodes appear on top
          zIndex: -1,
          // Allow pointer events for resizing and moving, but make content transparent to clicks
          pointerEvents: 'auto',
        }}
        className='resizable-transparent-rectangle'
      >
        {/* Background pattern (optional) */}
        {data.showPattern && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `radial-gradient(circle at 1px 1px, ${
                data.patternColor || 'rgba(59, 130, 246, 0.1)'
              } 1px, transparent 0)`,
              backgroundSize: '20px 20px',
              borderRadius: 'inherit',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Label */}
        {data.label && (
          <div
            style={{
              position: 'absolute',
              top: data.labelPosition?.top || '8px',
              left: data.labelPosition?.left || '8px',
              right: data.labelPosition?.right,
              bottom: data.labelPosition?.bottom,
              fontSize: data.fontSize || '12px',
              fontWeight: data.fontWeight || '600',
              color: data.textColor || '#374151',
              backgroundColor: data.labelBg || 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
              borderRadius: '4px',
              maxWidth: 'fit-content',
              pointerEvents: 'none', // Don't block clicks to nodes underneath
              zIndex: 1,
            }}
          >
            {data.label}
          </div>
        )}

        {/* Optional corner indicator */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              backgroundColor: data.borderColor || '#3b82f6',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Size display when resizing */}
        {isResizing && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {Math.round(nodeRef.current?.offsetWidth || 0)} ×{' '}
            {Math.round(nodeRef.current?.offsetHeight || 0)}
          </div>
        )}
      </div>
    </>
  );
};

// Alternative version with more styling options
const StyledResizableRectangle = ({ data, selected, id }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <>
      <NodeResizer
        color={data.resizerColor || '#10b981'}
        isVisible={selected}
        minWidth={data.minWidth || 120}
        minHeight={data.minHeight || 90}
        onResizeStart={() => setIsResizing(true)}
        onResizeEnd={() => setIsResizing(false)}
        onResize={(event, { width, height }) => {
          setDimensions({
            width: Math.round(width),
            height: Math.round(height),
          });
        }}
      />

      <div
        style={{
          width: '100%',
          height: '100%',
          background: data.gradient
            ? `linear-gradient(${data.gradientDirection || '135deg'}, ${
                data.gradientStart || 'rgba(16, 185, 129, 0.05)'
              }, ${data.gradientEnd || 'rgba(59, 130, 246, 0.05)'})`
            : data.backgroundColor || 'rgba(16, 185, 129, 0.06)',
          border: selected
            ? `2px ${data.borderStyle || 'solid'} ${
                data.borderColor || '#10b981'
              }`
            : `1px ${data.borderStyle || 'dashed'} ${
                data.borderColor || 'rgba(16, 185, 129, 0.4)'
              }`,
          borderRadius: data.borderRadius || '12px',
          position: 'relative',
          cursor: isResizing ? 'nw-resize' : 'move',
          zIndex: data.zIndex || -1,
          boxShadow: selected
            ? `0 0 0 1px ${
                data.borderColor || '#10b981'
              }, 0 8px 25px rgba(16, 185, 129, 0.15)`
            : data.shadow
            ? '0 4px 15px rgba(0, 0, 0, 0.05)'
            : 'none',
          transition: 'box-shadow 0.2s ease-in-out',
        }}
        className='styled-resizable-rectangle'
      >
        {/* Header bar */}
        {data.title && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '6px 12px',
              backgroundColor: selected
                ? `${data.borderColor || '#10b981'}15`
                : 'rgba(255, 255, 255, 0.7)',
              borderTopLeftRadius: data.borderRadius || '12px',
              borderTopRightRadius: data.borderRadius || '12px',
              borderBottom: `1px solid ${
                data.borderColor || 'rgba(16, 185, 129, 0.3)'
              }`,
              fontSize: '13px',
              fontWeight: '600',
              color: data.titleColor || '#065f46',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {data.title}
            {data.showCount && data.nodeCount && (
              <span style={{ float: 'right', opacity: 0.7 }}>
                {data.nodeCount} items
              </span>
            )}
          </div>
        )}

        {/* Main content area */}
        <div
          style={{
            position: 'absolute',
            inset: data.title ? '32px 0 0 0' : '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          {data.centerLabel && (
            <div
              style={{
                fontSize: data.centerLabelSize || '14px',
                fontWeight: '500',
                color: data.centerLabelColor || '#6b7280',
                opacity: 0.6,
                textAlign: 'center',
                padding: '0 16px',
              }}
            >
              {data.centerLabel}
            </div>
          )}
        </div>

        {/* Bottom-right info */}
        {(data.label || isResizing) && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              fontSize: '11px',
              color: data.textColor || '#6b7280',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 6px',
              borderRadius: '4px',
              fontFamily: isResizing ? 'monospace' : 'inherit',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {isResizing
              ? `${dimensions.width} × ${dimensions.height}`
              : data.label}
          </div>
        )}
      </div>
    </>
  );
};

export { ResizableTransparentRectangle, StyledResizableRectangle };
