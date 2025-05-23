import React, { useRef, useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  GitBranch, 
  GitMerge, 
  Workflow, 
  Cog, 
  RefreshCw,
  FileText,
  ArrowDown,
  ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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

interface WorkflowFlowchartDiagramProps {
  workflowId: string;
  workflowTitle: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const WorkflowFlowchartDiagram: React.FC<WorkflowFlowchartDiagramProps> = ({
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

  // Reorganize nodes for a top-down flowchart layout
  const reorganizedNodes = React.useMemo(() => {
    // Create a deep copy of nodes to avoid mutating the original
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    
    // Find start and end nodes
    const startNode = nodesCopy.find((n: DiagramNode) => n.id === 'start');
    const endNode = nodesCopy.find((n: DiagramNode) => n.id === 'end');
    
    // Find stage nodes (they connect directly to start or other stages)
    const stageNodes = nodesCopy.filter((n: DiagramNode) => n.id.startsWith('stage-'));
    
    // Find substage nodes
    const substageNodes = nodesCopy.filter((n: DiagramNode) => n.id.startsWith('substage-'));
    
    // Calculate positions for a top-down flowchart
    const CANVAS_WIDTH = 1200;
    const CENTER_X = CANVAS_WIDTH / 2;
    const NODE_VERTICAL_SPACING = 100;
    const STAGE_HORIZONTAL_SPACING = 250;
    
    // Position start node at the top center
    if (startNode) {
      startNode.x = CENTER_X - startNode.width / 2;
      startNode.y = 50;
    }
    
    // Position stage nodes in a vertical line
    stageNodes.forEach((stage: DiagramNode, index: number) => {
      stage.x = CENTER_X - stage.width / 2;
      stage.y = (index + 1) * NODE_VERTICAL_SPACING + 100;
    });
    
    // Group substage nodes by their parent stage
    const substagesByStage: Record<string, DiagramNode[]> = {};
    
    substageNodes.forEach((substage: DiagramNode) => {
      const stageId = substage.data?.stageId;
      if (stageId) {
        if (!substagesByStage[stageId]) {
          substagesByStage[stageId] = [];
        }
        substagesByStage[stageId].push(substage);
      }
    });
    
    // Position substage nodes horizontally under their parent stage
    Object.entries(substagesByStage).forEach(([stageId, substages]) => {
      const parentStage = stageNodes.find((s: DiagramNode) => s.data?.stageId === stageId);
      if (parentStage) {
        const stageIndex = stageNodes.indexOf(parentStage);
        const stageY = parentStage.y;
        
        // Calculate total width needed for substages
        const totalWidth = substages.length * substages[0].width + (substages.length - 1) * 40;
        const startX = CENTER_X - totalWidth / 2;
        
        // Position substages in a horizontal line under the stage
        substages.forEach((substage: DiagramNode, index: number) => {
          substage.x = startX + index * (substage.width + 40);
          substage.y = stageY + NODE_VERTICAL_SPACING;
        });
      }
    });
    
    // Position end node at the bottom
    if (endNode) {
      endNode.x = CENTER_X - endNode.width / 2;
      endNode.y = (stageNodes.length + 1) * NODE_VERTICAL_SPACING + 150;
    }
    
    return nodesCopy;
  }, [nodes]);

  // Calculate diagram dimensions
  const diagramDimensions = React.useMemo(() => {
    if (!reorganizedNodes.length) return { width: 800, height: 600 };
    
    const maxX = Math.max(...reorganizedNodes.map((node: DiagramNode) => node.x + node.width));
    const maxY = Math.max(...reorganizedNodes.map((node: DiagramNode) => node.y + node.height));
    
    return {
      width: Math.max(maxX + 100, 800),
      height: Math.max(maxY + 100, 600)
    };
  }, [reorganizedNodes]);

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      document.body.classList.add('cursor-grabbing');
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
    document.body.classList.remove('cursor-grabbing');
  };

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newZoom = Math.max(0.3, Math.min(3, zoom + delta));
      setZoom(newZoom);
    }
  };

  // Handle node click
  const handleNodeClick = (nodeId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  };

  // Get node color based on status
  const getNodeColor = (status: string, type: string) => {
    const colors = {
      completed: '#059669', // Green
      'in-progress': '#2563eb', // Blue
      pending: '#d97706', // Amber
      failed: '#dc2626', // Red
      default: '#4b5563', // Gray
    };
    
    return colors[status as keyof typeof colors] || colors.default;
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
      case 'map':
        return <Workflow className="h-5 w-5 text-gray-500" />;
      default:
        return <Cog className="h-5 w-5 text-gray-500" />;
    }
  };

  // Render nodes
  const renderNodes = () => {
    return reorganizedNodes.map((node: DiagramNode) => {
      const isSelected = node.id === selectedNode;
      const nodeColor = getNodeColor(node.status, node.type);
      
      // Different shapes based on node type
      let nodeShape;
      if (node.type === 'choice') {
        // Diamond shape for choice nodes
        nodeShape = (
          <polygon 
            points={`${node.width/2},0 ${node.width},${node.height/2} ${node.width/2},${node.height} 0,${node.height/2}`}
            fill={isSelected ? `${nodeColor}15` : 'white'} 
            stroke={nodeColor} 
            strokeWidth={isSelected ? 3 : 2}
            rx="4" 
            ry="4"
          />
        );
      } else if (node.type === 'parallel' || node.type === 'map') {
        // Dashed rectangle for parallel/map nodes
        nodeShape = (
          <rect 
            width={node.width} 
            height={node.height} 
            fill={isSelected ? `${nodeColor}15` : 'white'} 
            stroke={nodeColor} 
            strokeWidth={isSelected ? 3 : 2}
            rx="6" 
            ry="6"
            strokeDasharray="5,2"
          />
        );
      } else {
        // Regular rectangle for other nodes
        nodeShape = (
          <rect 
            width={node.width} 
            height={node.height} 
            fill={isSelected ? `${nodeColor}15` : 'white'} 
            stroke={nodeColor} 
            strokeWidth={isSelected ? 3 : 2}
            rx="6" 
            ry="6"
          />
        );
      }
      
      return (
        <g 
          key={node.id} 
          transform={`translate(${node.x}, ${node.y})`}
          onClick={(e) => handleNodeClick(node.id, e)}
          style={{ cursor: 'pointer' }}
          className={`transition-all duration-200 ${isSelected ? 'scale-105' : ''}`}
        >
          {nodeShape}
          
          {/* Node icon */}
          <foreignObject x="8" y="8" width="24" height="24">
            <div className="flex items-center justify-center">
              {getNodeIcon(node.type, node.status)}
            </div>
          </foreignObject>
          
          {/* Node label */}
          <foreignObject x="8" y="32" width={node.width - 16} height={node.height - 40}>
            <div className="flex flex-col items-center justify-center h-full">
              {/* Process name */}
              <div className="text-xs font-semibold text-center line-clamp-2 px-1 py-0.5 bg-white/90 rounded border border-gray-200 shadow-sm">
                {node.label}
              </div>
              
              {/* Status badge */}
              {node.status && (
                <div className={`text-xs mt-1 px-2 py-0.5 rounded-full font-medium shadow-sm ${
                  node.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                  node.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  node.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' :
                  'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {node.status}
                </div>
              )}
              
              {/* Process ID */}
              {node.data?.processId && (
                <div className="text-[10px] font-medium bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded mt-1 border border-gray-200">
                  ID: {node.data.processId}
                </div>
              )}
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  // Render edges with a simpler, more direct style for flowchart
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = reorganizedNodes.find((n: DiagramNode) => n.id === edge.source);
      const targetNode = reorganizedNodes.find((n: DiagramNode) => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      // Calculate edge points
      const sourceX = sourceNode.x + sourceNode.width / 2;
      const sourceY = sourceNode.y + sourceNode.height;
      const targetX = targetNode.x + targetNode.width / 2;
      const targetY = targetNode.y;
      
      // For flowchart, use more direct lines with right angles
      let path;
      
      // If nodes are aligned vertically
      if (Math.abs(sourceX - targetX) < 10) {
        // Direct vertical line
        path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      } else {
        // Right-angled line with horizontal segment in the middle
        const midY = (sourceY + targetY) / 2;
        path = `M ${sourceX} ${sourceY} 
                L ${sourceX} ${midY} 
                L ${targetX} ${midY} 
                L ${targetX} ${targetY}`;
      }
      
      // Arrow marker for the edge
      const markerId = `arrow-${edge.id}`;
      const edgeColor = edge.type === 'success' ? '#059669' : 
                        edge.type === 'failure' ? '#dc2626' : 
                        edge.type === 'condition' ? '#d97706' : '#6b7280';
      
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
              <path d="M 0 0 L 10 5 L 0 10 z" fill={edgeColor} />
            </marker>
          </defs>
          <path
            d={path}
            fill="none"
            stroke={edgeColor}
            strokeWidth={2}
            strokeDasharray={edge.type === 'condition' ? '5,5' : undefined}
            markerEnd={`url(#${markerId})`}
            className="transition-opacity duration-200"
          />
          {edge.label && (
            <foreignObject
              x={(sourceX + targetX) / 2 - 50}
              y={(sourceY + targetY) / 2 - 10}
              width="100"
              height="20"
            >
              <div className="flex items-center justify-center">
                <span className="text-xs px-1 py-0.5 rounded bg-white border text-gray-600">
                  {edge.label}
                </span>
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
      className="relative border rounded-md bg-white h-[700px]"
    >
      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-white border-b p-2">
        <div className="flex items-center gap-2">
          <ArrowDown className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-medium">{workflowTitle}</h2>
            <div className="text-xs text-muted-foreground">ID: {workflowId}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <ArrowDown className="h-3 w-3" />
            Flowchart View
          </Badge>
        </div>
      </div>
      
      {/* Main diagram area */}
      <div className="pt-12 h-full flex">
        <div 
          className="w-full h-full overflow-hidden cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
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
      </div>
    </div>
  );
};

export default WorkflowFlowchartDiagram;