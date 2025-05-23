import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  GitBranch, 
  GitMerge, 
  Workflow, 
  Cog, 
  RefreshCw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  MoveHorizontal
} from 'lucide-react';

interface DiagramNode {
  id: string;
  type: 'task' | 'choice' | 'parallel' | 'map' | 'wait' | 'pass' | 'fail' | 'succeed';
  label: string;
  status: 'completed' | 'in-progress' | 'pending' | 'failed';
  x: number;
  y: number;
  width: number;
  height: number;
  data?: any;
}

interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'default' | 'success' | 'failure' | 'condition';
}

interface WorkflowStepFunctionDiagramProps {
  workflowId: string;
  workflowTitle: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const WorkflowStepFunctionDiagram: React.FC<WorkflowStepFunctionDiagramProps> = ({
  workflowId,
  workflowTitle,
  nodes,
  edges,
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate diagram dimensions
  const calculateDiagramDimensions = () => {
    if (!nodes.length) return { width: 800, height: 600 };
    
    const maxX = Math.max(...nodes.map(node => node.x + node.width));
    const maxY = Math.max(...nodes.map(node => node.y + node.height));
    
    return {
      width: Math.max(maxX + 100, 800),
      height: Math.max(maxY + 100, 600)
    };
  };

  const diagramDimensions = calculateDiagramDimensions();

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Get node color based on status
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // Green
      case 'in-progress':
        return '#3b82f6'; // Blue
      case 'pending':
        return '#f59e0b'; // Amber
      case 'failed':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  // Get node icon based on type and status
  const getNodeIcon = (type: string, status: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'in-progress') {
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    } else if (status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else if (status === 'pending') {
      return <Clock className="h-5 w-5 text-amber-500" />;
    }

    switch (type) {
      case 'choice':
        return <GitBranch className="h-5 w-5 text-gray-500" />;
      case 'parallel':
        return <GitMerge className="h-5 w-5 text-gray-500" />;
      case 'wait':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'succeed':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Cog className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get edge color based on type
  const getEdgeColor = (type?: string) => {
    switch (type) {
      case 'success':
        return '#10b981'; // Green
      case 'failure':
        return '#ef4444'; // Red
      case 'condition':
        return '#f59e0b'; // Amber
      default:
        return '#6b7280'; // Gray
    }
  };

  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  // Render nodes
  const renderNodes = () => {
    return nodes.map(node => {
      const isSelected = node.id === selectedNode;
      const nodeColor = getNodeColor(node.status);
      
      return (
        <g 
          key={node.id} 
          transform={`translate(${node.x}, ${node.y})`}
          onClick={() => handleNodeClick(node.id)}
          style={{ cursor: 'pointer' }}
          className={`transition-all duration-200 ${isSelected ? 'scale-105' : ''}`}
        >
          {/* Node shape based on type */}
          {node.type === 'choice' ? (
            <polygon 
              points={`${node.width/2},0 ${node.width},${node.height/2} ${node.width/2},${node.height} 0,${node.height/2}`}
              fill="white" 
              stroke={nodeColor} 
              strokeWidth={isSelected ? 3 : 2}
              rx="4" 
              ry="4"
            />
          ) : node.type === 'parallel' || node.type === 'map' ? (
            <rect 
              width={node.width} 
              height={node.height} 
              fill="white" 
              stroke={nodeColor} 
              strokeWidth={isSelected ? 3 : 2}
              rx="4" 
              ry="4"
              strokeDasharray="5,2"
            />
          ) : (
            <rect 
              width={node.width} 
              height={node.height} 
              fill="white" 
              stroke={nodeColor} 
              strokeWidth={isSelected ? 3 : 2}
              rx="4" 
              ry="4"
            />
          )}
          
          {/* Node icon */}
          <foreignObject x="8" y="8" width="24" height="24">
            <div className="flex items-center justify-center">
              {getNodeIcon(node.type, node.status)}
            </div>
          </foreignObject>
          
          {/* Node label */}
          <foreignObject x="8" y="32" width={node.width - 16} height={node.height - 40}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-xs font-medium text-center">{node.label}</div>
              {node.status && (
                <div className={`text-xs mt-1 px-1.5 py-0.5 rounded-full ${
                  node.status === 'completed' ? 'bg-green-100 text-green-800' :
                  node.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  node.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {node.status}
                </div>
              )}
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  // Render edges
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      // Calculate edge points
      const sourceX = sourceNode.x + sourceNode.width / 2;
      const sourceY = sourceNode.y + sourceNode.height;
      const targetX = targetNode.x + targetNode.width / 2;
      const targetY = targetNode.y;
      
      // Calculate control points for curved edges
      const midY = (sourceY + targetY) / 2;
      
      // Path for the edge
      const path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
      
      // Arrow marker for the edge
      const markerId = `arrow-${edge.id}`;
      
      return (
        <g key={edge.id}>
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={getEdgeColor(edge.type)} />
            </marker>
          </defs>
          <path
            d={path}
            fill="none"
            stroke={getEdgeColor(edge.type)}
            strokeWidth="2"
            markerEnd={`url(#${markerId})`}
            className={`transition-all duration-200 ${
              selectedNode === edge.source || selectedNode === edge.target ? 'opacity-100 stroke-[3px]' : 'opacity-70'
            }`}
          />
          {edge.label && (
            <foreignObject
              x={(sourceX + targetX) / 2 - 50}
              y={midY - 10}
              width="100"
              height="20"
            >
              <div className="flex items-center justify-center">
                <span className="text-xs bg-white px-1 py-0.5 rounded border">{edge.label}</span>
              </div>
            </foreignObject>
          )}
        </g>
      );
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative border rounded-md bg-white ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : 'h-[600px]'
      }`}
    >
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/80 p-1 rounded-md border">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleResetView} title="Reset View">
          <MoveHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={toggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Title */}
      <div className="absolute top-2 left-2 z-10 bg-white/80 p-1 rounded-md border">
        <div className="text-sm font-medium flex items-center gap-2">
          <Workflow className="h-4 w-4" />
          {workflowTitle}
        </div>
      </div>
      
      {/* SVG Diagram */}
      <div 
        className="w-full h-full overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${diagramDimensions.width} ${diagramDimensions.height}`}
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Render edges first so they appear behind nodes */}
          {renderEdges()}
          
          {/* Render nodes */}
          {renderNodes()}
        </svg>
      </div>
      
      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute bottom-2 left-2 right-2 bg-white border rounded-md p-2 shadow-md max-h-[200px] overflow-auto">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Node Details</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setSelectedNode(null)}
            >
              ×
            </Button>
          </div>
          {(() => {
            const node = nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-1">
                  <div className="font-medium">ID:</div>
                  <div>{node.id}</div>
                  <div className="font-medium">Type:</div>
                  <div className="capitalize">{node.type}</div>
                  <div className="font-medium">Status:</div>
                  <div>
                    <Badge variant={
                      node.status === 'completed' ? 'default' :
                      node.status === 'in-progress' ? 'secondary' :
                      node.status === 'failed' ? 'destructive' :
                      'outline'
                    }>
                      {node.status}
                    </Badge>
                  </div>
                </div>
                
                {node.data && (
                  <>
                    <Separator className="my-1" />
                    <div className="font-medium">Additional Data:</div>
                    <pre className="bg-muted p-1 rounded text-[10px] overflow-auto max-h-[80px]">
                      {JSON.stringify(node.data, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default WorkflowStepFunctionDiagram;