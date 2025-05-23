import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowRight, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Workflow, 
  Maximize2, 
  Minimize2,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  Download,
  RefreshCw
} from 'lucide-react';
import { StageStatus } from '@/types/workflow';

interface Node {
  id: string;
  name: string;
  type: 'start' | 'task' | 'choice' | 'parallel' | 'end';
  status: StageStatus;
  position: { x: number; y: number };
  data?: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface WorkflowStepFunctionDiagramProps {
  workflowId: string;
  workflowTitle: string;
  nodes: Node[];
  edges: Edge[];
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
  const [fullscreen, setFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Calculate diagram dimensions based on nodes
  useEffect(() => {
    if (nodes.length > 0 && containerRef.current) {
      const maxX = Math.max(...nodes.map(node => node.position.x)) + 150;
      const maxY = Math.max(...nodes.map(node => node.position.y)) + 100;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      setDimensions({
        width: Math.max(maxX, containerWidth),
        height: Math.max(maxY, containerHeight)
      });
    }
  }, [nodes, containerRef.current]);

  // Handle zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Get node status color
  const getNodeStatusColor = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green-500
      case 'in-progress':
        return '#3b82f6'; // blue-500
      case 'failed':
        return '#ef4444'; // red-500
      case 'skipped':
        return '#a1a1aa'; // zinc-400
      default:
        return '#d4d4d8'; // zinc-300
    }
  };

  // Get node status icon
  const getNodeStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'skipped':
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Render node based on type
  const renderNode = (node: Node) => {
    const statusColor = getNodeStatusColor(node.status);
    const isHovered = hoveredNode === node.id;
    
    switch (node.type) {
      case 'start':
        return (
          <g
            key={node.id}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            onClick={() => onNodeClick?.(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle 
              r="25" 
              fill="#f3f4f6" 
              stroke={statusColor} 
              strokeWidth="2"
              filter={isHovered ? "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))" : ""}
            />
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="12"
              fontWeight="bold"
            >
              Start
            </text>
          </g>
        );
      
      case 'end':
        return (
          <g
            key={node.id}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            onClick={() => onNodeClick?.(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle 
              r="25" 
              fill="#f3f4f6" 
              stroke={statusColor} 
              strokeWidth="2"
              filter={isHovered ? "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))" : ""}
            />
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="12"
              fontWeight="bold"
            >
              End
            </text>
          </g>
        );
      
      case 'task':
        return (
          <g
            key={node.id}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            onClick={() => onNodeClick?.(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect 
              x="-60" 
              y="-30" 
              width="120" 
              height="60" 
              rx="4" 
              fill="#f3f4f6" 
              stroke={statusColor} 
              strokeWidth="2"
              filter={isHovered ? "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))" : ""}
            />
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="12"
              fontWeight="bold"
            >
              {node.name}
            </text>
            <g transform="translate(0, 15)">
              <rect 
                x="-40" 
                y="-10" 
                width="80" 
                height="20" 
                rx="10" 
                fill={statusColor} 
                fillOpacity="0.2"
              />
              <g transform="translate(-30, 0)">
                {getNodeStatusIcon(node.status)}
              </g>
              <text 
                x="0" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize="10"
                fill={statusColor}
                fontWeight="500"
              >
                {node.status.replace('-', ' ')}
              </text>
            </g>
          </g>
        );
      
      case 'choice':
        return (
          <g
            key={node.id}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            onClick={() => onNodeClick?.(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <polygon 
              points="0,-40 40,0 0,40 -40,0" 
              fill="#f3f4f6" 
              stroke={statusColor} 
              strokeWidth="2"
              filter={isHovered ? "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))" : ""}
            />
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="12"
              fontWeight="bold"
            >
              {node.name}
            </text>
          </g>
        );
      
      case 'parallel':
        return (
          <g
            key={node.id}
            transform={`translate(${node.position.x}, ${node.position.y})`}
            onClick={() => onNodeClick?.(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <rect 
              x="-50" 
              y="-40" 
              width="100" 
              height="80" 
              rx="4" 
              fill="#f3f4f6" 
              stroke={statusColor} 
              strokeWidth="2"
              filter={isHovered ? "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))" : ""}
            />
            <line x1="-50" y1="0" x2="50" y2="0" stroke="#d1d5db" strokeWidth="1" />
            <line x1="0" y1="-40" x2="0" y2="40" stroke="#d1d5db" strokeWidth="1" />
            <text 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fontSize="12"
              fontWeight="bold"
            >
              {node.name}
            </text>
          </g>
        );
      
      default:
        return null;
    }
  };

  // Render edge
  const renderEdge = (edge: Edge) => {
    const source = nodes.find(node => node.id === edge.source);
    const target = nodes.find(node => node.id === edge.target);
    
    if (!source || !target) return null;
    
    // Calculate path
    const sourceX = source.position.x;
    const sourceY = source.position.y;
    const targetX = target.position.x;
    const targetY = target.position.y;
    
    // Determine source point based on node type
    let sourcePointX = sourceX;
    let sourcePointY = sourceY;
    
    if (source.type === 'task') {
      // If source is to the left of target
      if (sourceX < targetX) {
        sourcePointX = sourceX + 60;
      } 
      // If source is to the right of target
      else if (sourceX > targetX) {
        sourcePointX = sourceX - 60;
      }
      // If source is directly above target
      else if (sourceY < targetY) {
        sourcePointY = sourceY + 30;
      }
      // If source is directly below target
      else {
        sourcePointY = sourceY - 30;
      }
    } else if (source.type === 'choice') {
      // Calculate angle to determine which point of the diamond to use
      const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
      if (angle >= -Math.PI/4 && angle < Math.PI/4) {
        // Right point
        sourcePointX = sourceX + 40;
      } else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) {
        // Bottom point
        sourcePointY = sourceY + 40;
      } else if (angle >= -3*Math.PI/4 && angle < -Math.PI/4) {
        // Top point
        sourcePointY = sourceY - 40;
      } else {
        // Left point
        sourcePointX = sourceX - 40;
      }
    } else if (source.type === 'parallel') {
      // Similar logic to task, but with different dimensions
      if (sourceX < targetX) {
        sourcePointX = sourceX + 50;
      } else if (sourceX > targetX) {
        sourcePointX = sourceX - 50;
      } else if (sourceY < targetY) {
        sourcePointY = sourceY + 40;
      } else {
        sourcePointY = sourceY - 40;
      }
    } else {
      // For start and end nodes (circles)
      const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
      sourcePointX = sourceX + 25 * Math.cos(angle);
      sourcePointY = sourceY + 25 * Math.sin(angle);
    }
    
    // Determine target point based on node type
    let targetPointX = targetX;
    let targetPointY = targetY;
    
    if (target.type === 'task') {
      if (targetX < sourceX) {
        targetPointX = targetX + 60;
      } else if (targetX > sourceX) {
        targetPointX = targetX - 60;
      } else if (targetY < sourceY) {
        targetPointY = targetY + 30;
      } else {
        targetPointY = targetY - 30;
      }
    } else if (target.type === 'choice') {
      const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
      if (angle >= -Math.PI/4 && angle < Math.PI/4) {
        targetPointX = targetX - 40;
      } else if (angle >= Math.PI/4 && angle < 3*Math.PI/4) {
        targetPointY = targetY - 40;
      } else if (angle >= -3*Math.PI/4 && angle < -Math.PI/4) {
        targetPointY = targetY + 40;
      } else {
        targetPointX = targetX + 40;
      }
    } else if (target.type === 'parallel') {
      if (targetX < sourceX) {
        targetPointX = targetX + 50;
      } else if (targetX > sourceX) {
        targetPointX = targetX - 50;
      } else if (targetY < sourceY) {
        targetPointY = targetY + 40;
      } else {
        targetPointY = targetY - 40;
      }
    } else {
      const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
      targetPointX = targetX - 25 * Math.cos(angle);
      targetPointY = targetY - 25 * Math.sin(angle);
    }
    
    // Calculate control points for the curve
    const dx = Math.abs(targetPointX - sourcePointX);
    const dy = Math.abs(targetPointY - sourcePointY);
    const controlPointOffset = Math.min(dx, dy) * 0.5 + 50;
    
    let path = '';
    
    // If nodes are mostly horizontal
    if (dx > dy) {
      const midX = (sourcePointX + targetPointX) / 2;
      path = `M ${sourcePointX} ${sourcePointY} 
              C ${midX} ${sourcePointY}, ${midX} ${targetPointY}, ${targetPointX} ${targetPointY}`;
    } 
    // If nodes are mostly vertical
    else {
      const midY = (sourcePointY + targetPointY) / 2;
      path = `M ${sourcePointX} ${sourcePointY} 
              C ${sourcePointX} ${midY}, ${targetPointX} ${midY}, ${targetPointX} ${targetPointY}`;
    }
    
    // Calculate position for the label
    const labelX = (sourcePointX + targetPointX) / 2;
    const labelY = (sourcePointY + targetPointY) / 2 - 10;
    
    return (
      <g key={edge.id}>
        <defs>
          <marker
            id={`arrowhead-${edge.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
        <path
          d={path}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          markerEnd={`url(#arrowhead-${edge.id})`}
        />
        {edge.label && (
          <g transform={`translate(${labelX}, ${labelY})`}>
            <rect
              x="-30"
              y="-10"
              width="60"
              height="20"
              rx="10"
              fill="#f3f4f6"
              stroke="#e5e7eb"
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {edge.label}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <Card className={`${fullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <CardTitle>{workflowTitle} - Step Function View</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={resetView}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset View</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                    {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as SVG</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef} 
          className="relative overflow-auto border rounded-md bg-muted/20"
          style={{ height: fullscreen ? 'calc(100vh - 120px)' : '600px' }}
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`${-pan.x} ${-pan.y} ${dimensions.width / zoom} ${dimensions.height / zoom}`}
            style={{ 
              cursor: 'grab',
              background: 'white'
            }}
          >
            <g>
              {/* Render edges first so they appear behind nodes */}
              {edges.map(renderEdge)}
              {/* Then render nodes */}
              {nodes.map(renderNode)}
            </g>
          </svg>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Completed</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>In Progress</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>Failed</span>
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-zinc-400" />
              <span>Skipped</span>
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Zoom: {Math.round(zoom * 100)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowStepFunctionDiagram;