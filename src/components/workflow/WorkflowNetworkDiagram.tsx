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
  Network,
  FileText
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

interface WorkflowNetworkDiagramProps {
  workflowId: string;
  workflowTitle: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  onNodeClick?: (nodeId: string) => void;
}

const WorkflowNetworkDiagram: React.FC<WorkflowNetworkDiagramProps> = ({
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
  const [simulationNodes, setSimulationNodes] = useState<any[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(true);

  // Convert diagram nodes to force simulation nodes
  useEffect(() => {
    // Create a deep copy of nodes to avoid mutating the original
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    
    // Initialize positions for force layout
    const networkNodes = nodesCopy.map((node: DiagramNode) => {
      return {
        ...node,
        // Use existing positions as starting points
        fx: null, // Allow x to be determined by force
        fy: null, // Allow y to be determined by force
        // Add radius for force calculation
        radius: node.id.startsWith('substage-') ? 40 : 60
      };
    });
    
    setSimulationNodes(networkNodes);
    
    // Start force simulation
    startForceSimulation(networkNodes);
    
    return () => {
      // Cleanup simulation
      setSimulationRunning(false);
    };
  }, [nodes]);

  // Force simulation
  const startForceSimulation = (networkNodes: any[]) => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Simple force simulation implementation
    const centerX = 600;
    const centerY = 400;
    const repulsionForce = 200; // Repulsion between nodes
    const attractionForce = 0.1; // Attraction along edges
    const centeringForce = 0.03; // Force pulling nodes to center
    const damping = 0.9; // Damping factor to stabilize
    
    // Initialize velocities
    networkNodes.forEach(node => {
      node.vx = 0;
      node.vy = 0;
      
      // Start with random positions if not set
      if (node.x === undefined) node.x = centerX + (Math.random() - 0.5) * 400;
      if (node.y === undefined) node.y = centerY + (Math.random() - 0.5) * 400;
    });
    
    // Create a map for quick node lookup
    const nodeMap = new Map();
    networkNodes.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    // Animation frame for simulation
    let frameId: number;
    let iteration = 0;
    const maxIterations = 300; // Limit iterations to prevent infinite loop
    
    const runSimulation = () => {
      if (!simulationRunning || iteration >= maxIterations) {
        return;
      }
      
      // Apply forces
      networkNodes.forEach(node => {
        // Initialize forces
        let fx = 0;
        let fy = 0;
        
        // Repulsion force between nodes
        networkNodes.forEach(otherNode => {
          if (node.id !== otherNode.id) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = node.radius + otherNode.radius;
            
            if (distance < minDistance * 3) {
              const force = repulsionForce / (distance * distance);
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          }
        });
        
        // Attraction force along edges
        edges.forEach(edge => {
          if (edge.source === node.id) {
            const targetNode = nodeMap.get(edge.target);
            if (targetNode) {
              const dx = targetNode.x - node.x;
              const dy = targetNode.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              fx += (dx / distance) * attractionForce * distance;
              fy += (dy / distance) * attractionForce * distance;
            }
          } else if (edge.target === node.id) {
            const sourceNode = nodeMap.get(edge.source);
            if (sourceNode) {
              const dx = sourceNode.x - node.x;
              const dy = sourceNode.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              fx += (dx / distance) * attractionForce * distance;
              fy += (dy / distance) * attractionForce * distance;
            }
          }
        });
        
        // Centering force
        fx += (centerX - node.x) * centeringForce;
        fy += (centerY - node.y) * centeringForce;
        
        // Update velocity with damping
        node.vx = (node.vx + fx) * damping;
        node.vy = (node.vy + fy) * damping;
        
        // Update position
        node.x += node.vx;
        node.y += node.vy;
      });
      
      // Update state to trigger re-render
      setSimulationNodes([...networkNodes]);
      
      iteration++;
      
      // Continue simulation if not stabilized
      if (iteration < maxIterations) {
        frameId = requestAnimationFrame(runSimulation);
      } else {
        setSimulationRunning(false);
      }
    };
    
    frameId = requestAnimationFrame(runSimulation);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  };

  // Calculate diagram dimensions
  const diagramDimensions = React.useMemo(() => {
    if (!simulationNodes.length) return { width: 1200, height: 800 };
    
    const maxX = Math.max(...simulationNodes.map(node => node.x + node.width / 2));
    const maxY = Math.max(...simulationNodes.map(node => node.y + node.height / 2));
    const minX = Math.min(...simulationNodes.map(node => node.x - node.width / 2));
    const minY = Math.min(...simulationNodes.map(node => node.y - node.height / 2));
    
    return {
      width: Math.max(maxX - minX + 200, 1200),
      height: Math.max(maxY - minY + 200, 800)
    };
  }, [simulationNodes]);

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
    return simulationNodes.map(node => {
      const isSelected = node.id === selectedNode;
      const nodeColor = getNodeColor(node.status, node.type);
      const nodeSize = node.id.startsWith('substage-') ? 80 : 100;
      
      // For network view, use circular nodes
      return (
        <g 
          key={node.id} 
          transform={`translate(${node.x - nodeSize/2}, ${node.y - nodeSize/2})`}
          onClick={(e) => handleNodeClick(node.id, e)}
          style={{ cursor: 'pointer' }}
          className={`transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}
        >
          <circle 
            cx={nodeSize/2} 
            cy={nodeSize/2} 
            r={nodeSize/2 - 2}
            fill={isSelected ? `${nodeColor}15` : 'white'} 
            stroke={nodeColor} 
            strokeWidth={isSelected ? 3 : 2}
          />
          
          {/* Node icon */}
          <foreignObject x={nodeSize/2 - 12} y={nodeSize/4 - 12} width="24" height="24">
            <div className="flex items-center justify-center">
              {getNodeIcon(node.type, node.status)}
            </div>
          </foreignObject>
          
          {/* Node label */}
          <foreignObject x="10" y={nodeSize/3} width={nodeSize - 20} height={nodeSize/2}>
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
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  // Render edges
  const renderEdges = () => {
    if (!simulationNodes.length) return null;
    
    // Create a map for quick node lookup
    const nodeMap = new Map();
    simulationNodes.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    return edges.map(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      // Calculate edge points
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Normalize direction vector
      const nx = dx / distance;
      const ny = dy / distance;
      
      // Calculate start and end points (offset from node centers to avoid overlapping with nodes)
      const sourceRadius = sourceNode.radius || 50;
      const targetRadius = targetNode.radius || 50;
      
      const startX = sourceNode.x + nx * sourceRadius;
      const startY = sourceNode.y + ny * sourceRadius;
      const endX = targetNode.x - nx * targetRadius;
      const endY = targetNode.y - ny * targetRadius;
      
      // Create a curved path
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const curveFactor = 30; // Adjust for curve intensity
      
      // Perpendicular vector for curve control point
      const perpX = -ny * curveFactor;
      const perpY = nx * curveFactor;
      
      const path = `M ${startX} ${startY} 
                    Q ${midX + perpX} ${midY + perpY}, ${endX} ${endY}`;
      
      // Arrow marker for the edge
      const markerId = `arrow-network-${edge.id}`;
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
              x={midX + perpX - 50}
              y={midY + perpY - 10}
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
          <Network className="h-5 w-5 text-purple-600" />
          <div>
            <h2 className="text-sm font-medium">{workflowTitle}</h2>
            <div className="text-xs text-muted-foreground">ID: {workflowId}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Network className="h-3 w-3" />
            Network View
          </Badge>
          {simulationRunning && (
            <Badge variant="secondary" className="animate-pulse">
              Optimizing Layout...
            </Badge>
          )}
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
              <radialGradient id="networkGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#f9fafb" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#networkGradient)" />
            
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

export default WorkflowNetworkDiagram;