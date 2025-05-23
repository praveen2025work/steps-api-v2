import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
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
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

  // Improved force simulation with better performance
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Create a deep copy of nodes to avoid mutating the original
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    
    // Initialize positions for force layout with better initial placement
    const networkNodes = nodesCopy.map((node: DiagramNode) => {
      // Assign initial positions based on node type for better starting layout
      let initialX, initialY;
      
      if (node.id === 'start') {
        initialX = 600;
        initialY = 200;
      } else if (node.id === 'end') {
        initialX = 600;
        initialY = 800;
      } else if (node.id.startsWith('stage-')) {
        // Place stages in a vertical line
        const stageNumber = parseInt(node.id.replace('stage-', ''), 10) || 0;
        initialX = 600;
        initialY = 300 + stageNumber * 100;
      } else if (node.id.startsWith('substage-')) {
        // Place substages with some randomness but near their stages
        const stageId = node.data?.stageId;
        const stageNode = nodesCopy.find((n: DiagramNode) => n.id === `stage-${stageId}`);
        
        if (stageNode) {
          initialX = stageNode.x + (Math.random() - 0.5) * 300;
          initialY = stageNode.y + 100 + (Math.random() - 0.5) * 100;
        } else {
          initialX = 600 + (Math.random() - 0.5) * 400;
          initialY = 500 + (Math.random() - 0.5) * 300;
        }
      } else {
        // Random position for other nodes
        initialX = 600 + (Math.random() - 0.5) * 400;
        initialY = 400 + (Math.random() - 0.5) * 300;
      }
      
      return {
        ...node,
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        // Add radius for force calculation - larger for more important nodes
        radius: node.id === 'start' || node.id === 'end' ? 70 :
                node.id.startsWith('stage-') ? 60 : 
                node.id.startsWith('substage-') ? 40 : 50
      };
    });
    
    setSimulationNodes(networkNodes);
    
    // Start optimized force simulation
    const simulationId = startOptimizedForceSimulation(networkNodes);
    
    return () => {
      // Cleanup simulation
      setSimulationRunning(false);
      if (simulationId) {
        cancelAnimationFrame(simulationId);
      }
    };
  }, [nodes]);

  // Optimized force simulation with better physics and performance
  const startOptimizedForceSimulation = (networkNodes: any[]) => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    // Improved force simulation parameters
    const centerX = 600;
    const centerY = 400;
    const repulsionForce = 250; // Stronger repulsion for better spacing
    const attractionForce = 0.08; // Gentler attraction for smoother layout
    const centeringForce = 0.02; // Gentler centering force
    const damping = 0.92; // Better damping for smoother motion
    const collisionPadding = 10; // Prevent nodes from overlapping
    
    // Create a map for quick node lookup
    const nodeMap = new Map();
    networkNodes.forEach(node => {
      nodeMap.set(node.id, node);
    });
    
    // Create edge map for quick lookup
    const edgeMap = new Map();
    edges.forEach(edge => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      if (!edgeMap.has(edge.target)) {
        edgeMap.set(edge.target, []);
      }
      edgeMap.get(edge.source).push(edge.target);
      edgeMap.get(edge.target).push(edge.source);
    });
    
    // Animation frame for simulation
    let frameId: number | null = null;
    let iteration = 0;
    const maxIterations = 200; // Fewer iterations for better performance
    
    // Track energy to detect stabilization
    let totalEnergy = 1;
    const energyThreshold = 0.001;
    
    const runSimulation = () => {
      if (!simulationRunning || iteration >= maxIterations || totalEnergy < energyThreshold) {
        setSimulationRunning(false);
        return null;
      }
      
      totalEnergy = 0;
      
      // Apply forces
      networkNodes.forEach(node => {
        // Initialize forces
        let fx = 0;
        let fy = 0;
        
        // Repulsion force between nodes (optimized to avoid unnecessary calculations)
        networkNodes.forEach(otherNode => {
          if (node.id !== otherNode.id) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distanceSquared = dx * dx + dy * dy;
            const distance = Math.sqrt(distanceSquared);
            const minDistance = node.radius + otherNode.radius + collisionPadding;
            
            // Only apply repulsion if nodes are close enough
            if (distance < minDistance * 3) {
              // Stronger repulsion for closer nodes
              const force = repulsionForce / distanceSquared;
              
              // Collision detection - prevent nodes from overlapping
              if (distance < minDistance) {
                const collisionForce = (minDistance - distance) * 0.5;
                fx += (dx / distance) * collisionForce;
                fy += (dy / distance) * collisionForce;
              }
              
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          }
        });
        
        // Attraction force along edges (optimized to use edge map)
        const connectedNodes = edgeMap.get(node.id) || [];
        connectedNodes.forEach(connectedId => {
          const connectedNode = nodeMap.get(connectedId);
          if (connectedNode) {
            const dx = connectedNode.x - node.x;
            const dy = connectedNode.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply attraction force with distance-based scaling
            const force = Math.min(attractionForce * distance, 10); // Cap force to prevent extreme movement
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        });
        
        // Special forces for specific node types
        if (node.id === 'start') {
          // Pull start node toward top
          fy += (200 - node.y) * 0.1;
        } else if (node.id === 'end') {
          // Pull end node toward bottom
          fy += (800 - node.y) * 0.1;
        } else if (node.id.startsWith('stage-')) {
          // Keep stages more central
          fx += (centerX - node.x) * 0.05;
        }
        
        // Gentle centering force to keep diagram in view
        fx += (centerX - node.x) * centeringForce;
        fy += (centerY - node.y) * centeringForce;
        
        // Update velocity with damping
        node.vx = (node.vx + fx) * damping;
        node.vy = (node.vy + fy) * damping;
        
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        
        // Calculate energy for stabilization detection
        totalEnergy += Math.abs(node.vx) + Math.abs(node.vy);
      });
      
      // Update state to trigger re-render (only every few frames for better performance)
      if (iteration % 3 === 0 || iteration >= maxIterations - 1 || totalEnergy < energyThreshold) {
        setSimulationNodes([...networkNodes]);
      }
      
      iteration++;
      
      // Continue simulation if not stabilized
      if (iteration < maxIterations && totalEnergy >= energyThreshold) {
        frameId = requestAnimationFrame(runSimulation);
      } else {
        // Final update and mark as complete
        setSimulationNodes([...networkNodes]);
        setSimulationRunning(false);
      }
      
      return frameId;
    };
    
    frameId = requestAnimationFrame(runSimulation);
    return frameId;
  };

  // Calculate diagram dimensions with better padding and bounds
  const diagramDimensions = useMemo(() => {
    if (!simulationNodes.length) return { width: 1200, height: 800 };
    
    // Calculate bounds with padding
    const padding = 150; // More padding for better visibility
    
    const maxX = Math.max(...simulationNodes.map(node => node.x + node.radius));
    const maxY = Math.max(...simulationNodes.map(node => node.y + node.radius));
    const minX = Math.min(...simulationNodes.map(node => node.x - node.radius));
    const minY = Math.min(...simulationNodes.map(node => node.y - node.radius));
    
    return {
      width: Math.max(maxX - minX + padding * 2, 1200),
      height: Math.max(maxY - minY + padding * 2, 800)
    };
  }, [simulationNodes]);

  // Handle mouse events for panning - optimized with useCallback
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      document.body.classList.add('cursor-grabbing');
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.classList.remove('cursor-grabbing');
  }, []);

  // Handle zoom with smoother behavior
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newZoom = Math.max(0.3, Math.min(3, zoom + delta));
      setZoom(newZoom);
    }
  }, [zoom]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(3, prev + 0.1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.3, prev - 0.1));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Handle node click with improved event handling
  const handleNodeClick = useCallback((nodeId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  }, [selectedNode, onNodeClick]);

  // Get node color based on status - memoized for consistency
  const getNodeColor = useCallback((status: string, type: string) => {
    const colors = {
      completed: '#059669', // Green
      'in-progress': '#2563eb', // Blue
      pending: '#d97706', // Amber
      failed: '#dc2626', // Red
      default: '#4b5563', // Gray
    };
    
    return colors[status as keyof typeof colors] || colors.default;
  }, []);

  // Get node icon based on type and status - memoized for consistency
  const getNodeIcon = useCallback((type: string, status: string) => {
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
  }, []);

  // Render nodes - memoized for better performance
  const renderNodes = useMemo(() => {
    return simulationNodes.map(node => {
      const isSelected = node.id === selectedNode;
      const nodeColor = getNodeColor(node.status, node.type);
      
      // Adjust node size based on type for better visual hierarchy
      const nodeSize = node.id === 'start' || node.id === 'end' ? 110 :
                       node.id.startsWith('stage-') ? 100 : 
                       node.id.startsWith('substage-') ? 80 : 90;
      
      // For network view, use circular nodes with improved styling
      return (
        <g 
          key={node.id} 
          transform={`translate(${node.x - nodeSize/2}, ${node.y - nodeSize/2})`}
          onClick={(e) => handleNodeClick(node.id, e)}
          style={{ cursor: 'pointer' }}
          className={`transition-all duration-200 ${isSelected ? 'scale-110' : ''}`}
        >
          {/* Node shadow for depth */}
          <circle 
            cx={nodeSize/2} 
            cy={nodeSize/2 + 2} 
            r={nodeSize/2 - 1}
            fill="rgba(0,0,0,0.1)" 
          />
          
          {/* Main node circle */}
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
              
              {/* Process ID - only show for selected node or important nodes */}
              {(isSelected || node.id === 'start' || node.id === 'end' || node.id.startsWith('stage-')) && node.data?.processId && (
                <div className="text-[10px] font-medium bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded mt-1 border border-gray-200">
                  ID: {node.data.processId}
                </div>
              )}
            </div>
          </foreignObject>
        </g>
      );
    });
  }, [simulationNodes, selectedNode, getNodeColor, getNodeIcon, handleNodeClick]);

  // Render edges - memoized for better performance
  const renderEdges = useMemo(() => {
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
      
      // Create a curved path with adaptive curvature based on distance
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      
      // Adjust curve intensity based on distance for more natural curves
      const curveFactor = Math.min(distance * 0.2, 50); 
      
      // Perpendicular vector for curve control point
      const perpX = -ny * curveFactor;
      const perpY = nx * curveFactor;
      
      // Create path with smoother curve
      const path = `M ${startX} ${startY} 
                    Q ${midX + perpX} ${midY + perpY}, ${endX} ${endY}`;
      
      // Arrow marker for the edge
      const markerId = `arrow-network-${edge.id}`;
      const edgeColor = edge.type === 'success' ? '#059669' : 
                        edge.type === 'failure' ? '#dc2626' : 
                        edge.type === 'condition' ? '#d97706' : '#6b7280';
      
      // Determine edge thickness based on type
      const strokeWidth = edge.type === 'success' || edge.type === 'failure' ? 2.5 : 2;
      
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
          
          {/* Edge shadow for depth */}
          <path
            d={path}
            fill="none"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={strokeWidth}
            strokeDasharray={edge.type === 'condition' ? '5,5' : undefined}
            transform="translate(1, 1)"
          />
          
          {/* Main edge path */}
          <path
            d={path}
            fill="none"
            stroke={edgeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={edge.type === 'condition' ? '5,5' : undefined}
            markerEnd={`url(#${markerId})`}
            className="transition-opacity duration-200"
          />
          
          {/* Edge label */}
          {edge.label && (
            <foreignObject
              x={midX + perpX - 50}
              y={midY + perpY - 10}
              width="100"
              height="20"
            >
              <div className="flex items-center justify-center">
                <span className="text-xs px-1 py-0.5 rounded bg-white border text-gray-600 shadow-sm">
                  {edge.label}
                </span>
              </div>
            </foreignObject>
          )}
        </g>
      );
    });
  }, [edges, simulationNodes]);

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
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 ml-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleZoomOut}
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleZoomIn}
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7 ml-1" 
              onClick={handleResetView}
              title="Reset view"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          
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
            {/* Enhanced background with gradient */}
            <defs>
              <pattern id="networkGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" />
              </pattern>
              <radialGradient id="networkGradient" cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#f9fafb" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#networkGradient)" />
            <rect width="100%" height="100%" fill="url(#networkGrid)" fillOpacity="0.8" />
            
            {/* Render edges first so they appear behind nodes */}
            {renderEdges}
            
            {/* Render nodes */}
            {renderNodes}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WorkflowNetworkDiagram;