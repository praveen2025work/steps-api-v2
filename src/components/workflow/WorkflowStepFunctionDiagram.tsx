import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  MoveHorizontal,
  FileText,
  Info,
  Users,
  Calendar,
  BarChart,
  Search,
  Filter,
  Home
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

  // State for minimap
  const [showMinimap, setShowMinimap] = useState(true);
  const [minimapPosition, setMinimapPosition] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNodes, setFilteredNodes] = useState<string[]>([]);
  
  // Calculate visible area for minimap
  const visibleArea = useMemo(() => {
    if (!containerRef.current) return { x: 0, y: 0, width: 0, height: 0 };
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const visibleWidth = containerRect.width / zoom;
    const visibleHeight = containerRect.height / zoom;
    
    return {
      x: -pan.x / zoom,
      y: -pan.y / zoom,
      width: visibleWidth,
      height: visibleHeight
    };
  }, [pan, zoom]);
  
  // Handle mouse events for panning with improved performance
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      
      // Add a dragging class to the body for cursor styling
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

  // Handle zoom with smooth transitions and wheel support
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newZoom = Math.max(0.3, Math.min(3, zoom + delta));
      
      // Calculate zoom point (mouse position)
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate new pan to zoom toward mouse position
      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);
      
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  // Toggle fullscreen with keyboard support
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent handling if in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleResetView();
          }
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else if (selectedNode) {
            setSelectedNode(null);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedNode, zoom]);
  
  // Handle search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNodes([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const matches = nodes.filter(node => 
      node.label.toLowerCase().includes(term) || 
      (node.data?.processId && node.data.processId.toLowerCase().includes(term))
    ).map(node => node.id);
    
    setFilteredNodes(matches);
    
    // If we have matches, select the first one
    if (matches.length > 0 && !selectedNode) {
      setSelectedNode(matches[0]);
      
      // Find the node and center the view on it
      const node = nodes.find(n => n.id === matches[0]);
      if (node) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const centerX = containerRect.width / 2;
          const centerY = containerRect.height / 2;
          
          setPan({
            x: centerX - node.x - node.width / 2,
            y: centerY - node.y - node.height / 2
          });
        }
      }
    }
  }, [searchTerm, nodes]);

  // Get node color based on status with improved accessibility
  const getNodeColor = (status: string, type: string) => {
    // Base colors
    const colors = {
      completed: '#10b981', // Green
      'in-progress': '#3b82f6', // Blue
      pending: '#f59e0b', // Amber
      failed: '#ef4444', // Red
      default: '#6b7280', // Gray
    };
    
    // Adjust color based on node type
    if (type === 'parallel' || type === 'map') {
      // Use slightly different shades for container nodes
      return {
        completed: '#059669', // Darker green
        'in-progress': '#2563eb', // Darker blue
        pending: '#d97706', // Darker amber
        failed: '#dc2626', // Darker red
        default: '#4b5563', // Darker gray
      }[status] || colors.default;
    }
    
    return colors[status as keyof typeof colors] || colors.default;
  };

  // Get node icon based on type and status with improved visual cues
  const getNodeIcon = (type: string, status: string) => {
    // Status-based icons take precedence
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'in-progress') {
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    } else if (status === 'failed') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else if (status === 'pending') {
      return <Clock className="h-5 w-5 text-amber-500" />;
    }

    // Type-based icons as fallback
    switch (type) {
      case 'choice':
        return <GitBranch className="h-5 w-5 text-gray-500" />;
      case 'parallel':
        return <GitMerge className="h-5 w-5 text-gray-500" />;
      case 'map':
        return <Workflow className="h-5 w-5 text-gray-500" />;
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

  // Get edge color based on type with improved contrast
  const getEdgeColor = (type?: string, isHighlighted: boolean = false) => {
    const baseColors = {
      success: '#10b981', // Green
      failure: '#ef4444', // Red
      condition: '#f59e0b', // Amber
      default: '#6b7280', // Gray
    };
    
    // Highlighted edges are more vibrant
    const highlightColors = {
      success: '#059669', // Darker green
      failure: '#dc2626', // Darker red
      condition: '#d97706', // Darker amber
      default: '#374151', // Darker gray
    };
    
    const colors = isHighlighted ? highlightColors : baseColors;
    return colors[type as keyof typeof colors] || colors.default;
  };
  
  // Get edge style based on type
  const getEdgeStyle = (type?: string) => {
    switch (type) {
      case 'condition':
        return { strokeDasharray: '5,5' }; // Dashed line for conditions
      case 'failure':
        return { strokeWidth: 2.5 }; // Thicker line for failures
      default:
        return {};
    }
  };

  // Handle node click with improved selection behavior
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
    
    // If a node is selected, highlight its connections
    if (nodeId !== selectedNode) {
      // Find the node's connected edges
      const connectedEdges = edges.filter(
        edge => edge.source === nodeId || edge.target === nodeId
      );
      
      // Find connected nodes
      const connectedNodeIds = new Set<string>();
      connectedEdges.forEach(edge => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
    }
  };
  
  // Check if a node is in the search results
  const isNodeHighlighted = (nodeId: string) => {
    return filteredNodes.includes(nodeId);
  };
  
  // Check if a node is connected to the selected node
  const isNodeConnected = (nodeId: string) => {
    if (!selectedNode) return false;
    
    // Direct connection
    const directConnection = edges.some(
      edge => (edge.source === selectedNode && edge.target === nodeId) || 
             (edge.target === selectedNode && edge.source === nodeId)
    );
    
    return directConnection;
  };
  
  // Check if an edge is connected to the selected node
  const isEdgeConnected = (edge: DiagramEdge) => {
    if (!selectedNode) return false;
    return edge.source === selectedNode || edge.target === selectedNode;
  };

  // Render nodes with improved visuals and interactions
  const renderNodes = () => {
    return nodes.map(node => {
      const isSelected = node.id === selectedNode;
      const isHighlighted = isNodeHighlighted(node.id);
      const isConnected = isNodeConnected(node.id);
      const nodeColor = getNodeColor(node.status, node.type);
      
      // Calculate opacity based on selection state
      let opacity = 1;
      if (selectedNode && !isSelected && !isConnected) {
        opacity = 0.4;
      }
      if (filteredNodes.length > 0 && !isHighlighted) {
        opacity = 0.3;
      }
      
      return (
        <g 
          key={node.id} 
          transform={`translate(${node.x}, ${node.y})`}
          onClick={() => handleNodeClick(node.id)}
          style={{ cursor: 'pointer', opacity }}
          className={`transition-all duration-200 ${isSelected ? 'scale-105' : ''}`}
        >
          {/* Node shape based on type with improved styling */}
          {node.type === 'choice' ? (
            <polygon 
              points={`${node.width/2},0 ${node.width},${node.height/2} ${node.width/2},${node.height} 0,${node.height/2}`}
              fill={isSelected ? `${nodeColor}15` : 'white'} 
              stroke={nodeColor} 
              strokeWidth={isSelected || isHighlighted ? 3 : 2}
              rx="4" 
              ry="4"
            />
          ) : node.type === 'parallel' || node.type === 'map' ? (
            <rect 
              width={node.width} 
              height={node.height} 
              fill={isSelected ? `${nodeColor}15` : 'white'} 
              stroke={nodeColor} 
              strokeWidth={isSelected || isHighlighted ? 3 : 2}
              rx="6" 
              ry="6"
              strokeDasharray="5,2"
            />
          ) : (
            <rect 
              width={node.width} 
              height={node.height} 
              fill={isSelected ? `${nodeColor}15` : 'white'} 
              stroke={nodeColor} 
              strokeWidth={isSelected || isHighlighted ? 3 : 2}
              rx="6" 
              ry="6"
              className={isHighlighted ? 'animate-pulse' : ''}
            />
          )}
          
          {/* Node icon with improved positioning */}
          <foreignObject x="8" y="8" width="24" height="24">
            <div className="flex items-center justify-center">
              {getNodeIcon(node.type, node.status)}
            </div>
          </foreignObject>
          
          {/* Node label with improved typography and layout */}
          <foreignObject x="8" y="32" width={node.width - 16} height={node.height - 40}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-xs font-medium text-center line-clamp-2">{node.label}</div>
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
              
              {/* Show process ID if available */}
              {node.data?.processId && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  {node.data.processId}
                </div>
              )}
            </div>
          </foreignObject>
        </g>
      );
    });
  };

  // Render edges with improved styling and interaction
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const isConnectedToSelected = isEdgeConnected(edge);
      
      // Calculate edge points with improved positioning
      let sourceX, sourceY, targetX, targetY;
      
      // For choice nodes (diamond shape), adjust connection points
      if (sourceNode.type === 'choice') {
        sourceX = sourceNode.x + sourceNode.width / 2;
        sourceY = sourceNode.y + sourceNode.height;
      } else {
        sourceX = sourceNode.x + sourceNode.width / 2;
        sourceY = sourceNode.y + sourceNode.height;
      }
      
      if (targetNode.type === 'choice') {
        targetX = targetNode.x + targetNode.width / 2;
        targetY = targetNode.y;
      } else {
        targetX = targetNode.x + targetNode.width / 2;
        targetY = targetNode.y;
      }
      
      // Calculate control points for curved edges
      const midY = (sourceY + targetY) / 2;
      
      // For dependency edges (horizontal connections), use a different curve
      let path;
      if (edge.id.startsWith('edge-dep-')) {
        // This is a dependency edge, likely horizontal
        const controlPointOffset = 50; // Adjust this for curve intensity
        path = `M ${sourceX} ${sourceY} 
                C ${sourceX + controlPointOffset} ${sourceY}, 
                  ${targetX - controlPointOffset} ${targetY}, 
                  ${targetX} ${targetY}`;
      } else {
        // Standard vertical flow edge
        path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
      }
      
      // Arrow marker for the edge
      const markerId = `arrow-${edge.id}`;
      
      // Calculate opacity based on selection state
      let opacity = 0.7;
      if (selectedNode) {
        opacity = isConnectedToSelected ? 1 : 0.2;
      }
      
      const edgeStyle = getEdgeStyle(edge.type);
      
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
              <path d="M 0 0 L 10 5 L 0 10 z" fill={getEdgeColor(edge.type, isConnectedToSelected)} />
            </marker>
          </defs>
          <path
            d={path}
            fill="none"
            stroke={getEdgeColor(edge.type, isConnectedToSelected)}
            strokeWidth={isConnectedToSelected ? 3 : 2}
            strokeDasharray={edgeStyle.strokeDasharray}
            markerEnd={`url(#${markerId})`}
            style={{ opacity }}
            className="transition-opacity duration-200"
          />
          {edge.label && (
            <foreignObject
              x={(sourceX + targetX) / 2 - 50}
              y={midY - 10}
              width="100"
              height="20"
              style={{ opacity }}
            >
              <div className="flex items-center justify-center">
                <span className={`text-xs px-1 py-0.5 rounded ${
                  isConnectedToSelected 
                    ? 'bg-blue-50 border border-blue-200 text-blue-800' 
                    : 'bg-white border text-gray-600'
                }`}>
                  {edge.label}
                </span>
              </div>
            </foreignObject>
          )}
        </g>
      );
    });
  };
  
  // Render minimap
  const renderMinimap = () => {
    if (!showMinimap) return null;
    
    const minimapWidth = 150;
    const minimapHeight = 100;
    const minimapPadding = 5;
    
    // Calculate scale factor for minimap
    const diagramWidth = diagramDimensions.width;
    const diagramHeight = diagramDimensions.height;
    const scaleX = (minimapWidth - minimapPadding * 2) / diagramWidth;
    const scaleY = (minimapHeight - minimapPadding * 2) / diagramHeight;
    const scale = Math.min(scaleX, scaleY);
    
    return (
      <div 
        className="absolute bottom-2 right-2 bg-white border rounded-md shadow-md overflow-hidden"
        style={{ width: minimapWidth, height: minimapHeight }}
      >
        {/* Minimap nodes */}
        <svg width={minimapWidth} height={minimapHeight}>
          <g transform={`translate(${minimapPadding}, ${minimapPadding}) scale(${scale})`}>
            {/* Render simplified nodes */}
            {nodes.map(node => (
              <rect
                key={`minimap-${node.id}`}
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                fill={getNodeColor(node.status, node.type)}
                opacity={0.7}
                rx={4}
                ry={4}
              />
            ))}
            
            {/* Render visible area rectangle */}
            <rect
              x={visibleArea.x}
              y={visibleArea.y}
              width={visibleArea.width}
              height={visibleArea.height}
              fill="none"
              stroke="#000"
              strokeWidth={2 / scale}
              strokeDasharray={`${4 / scale},${4 / scale}`}
            />
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`relative border rounded-md bg-white ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : 'h-[700px]'
      }`}
    >
      {/* Top toolbar with improve controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-white border-b p-2">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-blue-600" />
          <h2 className="text-sm font-medium">{workflowTitle}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-2 text-xs rounded-md border border-input bg-background"
            />
            {filteredNodes.length > 0 && (
              <Badge variant="secondary" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {filteredNodes.length}
              </Badge>
            )}
          </div>
          
          {/* View controls */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomIn} title="Zoom In (Ctrl +)">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomOut} title="Zoom Out (Ctrl -)">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleResetView} title="Reset View (Ctrl 0)">
              <MoveHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setShowMinimap(!showMinimap)} title="Toggle Minimap">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={toggleFullscreen} title="Toggle Fullscreen (Ctrl F)">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main diagram area */}
      <div className="pt-12 h-full flex">
        {/* SVG Diagram */}
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
        
        {/* Render minimap */}
        {renderMinimap()}
      </div>
      
      {/* Node details panel with improved layout and tabs */}
      {selectedNode && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t rounded-t-md shadow-lg max-h-[300px] overflow-auto">
          <div className="flex justify-between items-center p-2 border-b">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">Node Details</h3>
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (node) {
                  return (
                    <Badge variant={
                      node.status === 'completed' ? 'default' :
                      node.status === 'in-progress' ? 'secondary' :
                      node.status === 'failed' ? 'destructive' :
                      'outline'
                    }>
                      {node.status}
                    </Badge>
                  );
                }
                return null;
              })()}
            </div>
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
            
            // Format node details based on type with improved tabs
            if (node.id.startsWith('substage-') && node.data) {
              // This is a substage/task node
              return (
                <Tabs defaultValue="overview" className="p-2" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 h-8">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="dependencies" className="text-xs">Dependencies</TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
                    <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{node.label}</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {node.data.processId && (
                          <>
                            <div className="font-medium">Process ID:</div>
                            <div>{node.data.processId}</div>
                          </>
                        )}
                        
                        {node.data.stageId && (
                          <>
                            <div className="font-medium">Stage:</div>
                            <div>{node.data.stageName || node.data.stageId}</div>
                          </>
                        )}
                        
                        {node.data.duration && (
                          <>
                            <div className="font-medium">Duration:</div>
                            <div>{node.data.duration} min</div>
                          </>
                        )}
                        
                        {node.data.expectedStart && (
                          <>
                            <div className="font-medium">Expected Start:</div>
                            <div>{node.data.expectedStart}</div>
                          </>
                        )}
                        
                        {node.data.updatedBy && (
                          <>
                            <div className="font-medium">Updated By:</div>
                            <div>{node.data.updatedBy}</div>
                          </>
                        )}
                        
                        {node.data.updatedAt && (
                          <>
                            <div className="font-medium">Updated At:</div>
                            <div>{node.data.updatedAt}</div>
                          </>
                        )}
                      </div>
                      
                      {/* Progress indicator if available */}
                      {node.data.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{node.data.progress}%</span>
                          </div>
                          <Progress value={node.data.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dependencies" className="pt-2">
                    {node.data.dependencies && node.data.dependencies.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground mb-2">
                          This task depends on the following tasks to be completed:
                        </div>
                        <div className="space-y-2">
                          {node.data.dependencies.map((dep: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-1.5 bg-muted rounded-md text-xs">
                              <div className="flex items-center gap-2">
                                {dep.status === 'completed' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-500" />
                                )}
                                <span>{dep.name}</span>
                              </div>
                              <Badge variant={dep.status === 'completed' ? 'default' : 'outline'}>
                                {dep.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground p-4 text-center">
                        No dependencies found for this task.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="documents" className="pt-2">
                    {node.data.documents && node.data.documents.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground mb-2">
                          Documents associated with this task:
                        </div>
                        <div className="space-y-1.5">
                          {node.data.documents.map((doc: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-1.5 bg-muted rounded-md text-xs">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span>{doc.name}</span>
                              </div>
                              <span className="text-muted-foreground">{doc.size}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground p-4 text-center">
                        No documents found for this task.
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="messages" className="pt-2">
                    {node.data.messages && node.data.messages.length > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground mb-2">
                          System messages for this task:
                        </div>
                        <div className="space-y-1.5">
                          {node.data.messages.map((msg: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-1.5 bg-muted rounded-md text-xs">
                              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>{msg}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground p-4 text-center">
                        No messages found for this task.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              );
            } else if (node.id.startsWith('stage-') && node.data) {
              // This is a stage node
              return (
                <Tabs defaultValue="overview" className="p-2">
                  <TabsList className="grid grid-cols-2 h-8">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="tasks" className="text-xs">Tasks</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="pt-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{node.label}</h4>
                      </div>
                      
                      {node.data.description && (
                        <div className="text-xs text-muted-foreground">{node.data.description}</div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="font-medium">Stage ID:</div>
                        <div>{node.data.stageId}</div>
                        
                        <div className="font-medium">Order:</div>
                        <div>{node.data.order || 'N/A'}</div>
                        
                        <div className="font-medium">Total Tasks:</div>
                        <div>{node.data.totalSubtasks || 0}</div>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{node.data.progress || 0}%</span>
                        </div>
                        <Progress value={node.data.progress || 0} className="h-2" />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tasks" className="pt-2">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground mb-2">
                        Tasks in this stage:
                      </div>
                      <div className="space-y-1.5">
                        {nodes
                          .filter(n => n.id.startsWith('substage-') && n.data?.stageId === node.data.stageId)
                          .map((task, i) => (
                            <div 
                              key={i} 
                              className="flex items-center justify-between p-1.5 bg-muted rounded-md text-xs cursor-pointer hover:bg-muted/80"
                              onClick={() => setSelectedNode(task.id)}
                            >
                              <div className="flex items-center gap-2">
                                {getNodeIcon(task.type, task.status)}
                                <span>{task.label}</span>
                              </div>
                              <Badge variant={
                                task.status === 'completed' ? 'default' :
                                task.status === 'in-progress' ? 'secondary' :
                                task.status === 'failed' ? 'destructive' :
                                'outline'
                              }>
                                {task.status}
                              </Badge>
                            </div>
                          ))}
                        
                        {nodes.filter(n => n.id.startsWith('substage-') && n.data?.stageId === node.data.stageId).length === 0 && (
                          <div className="text-xs text-muted-foreground p-4 text-center">
                            No tasks found in this stage.
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              );
            } else {
              // Default node details (start/end nodes)
              return (
                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{node.label}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
                  
                  {node.data && node.data.description && (
                    <div className="text-xs text-muted-foreground mt-2">{node.data.description}</div>
                  )}
                  
                  {/* Show workflow start/end time if available */}
                  {node.id === 'start' && node.data?.startTime && (
                    <div className="mt-2 text-xs">
                      <div className="font-medium mb-1">Started At:</div>
                      <div className="text-muted-foreground">
                        {new Date(node.data.startTime).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {node.id === 'end' && node.data?.endTime && (
                    <div className="mt-2 text-xs">
                      <div className="font-medium mb-1">Completed At:</div>
                      <div className="text-muted-foreground">
                        {new Date(node.data.endTime).toLocaleString()}
                      </div>
                    </div>
                  )}
                  
                  {node.id === 'end' && !node.data?.endTime && node.data?.estimatedCompletion && (
                    <div className="mt-2 text-xs">
                      <div className="font-medium mb-1">Estimated Completion:</div>
                      <div className="text-muted-foreground">
                        {new Date(node.data.estimatedCompletion).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          })()}
        </div>
      )}
    </div>
  );
};

export default WorkflowStepFunctionDiagram;