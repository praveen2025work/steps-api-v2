import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  GitBranch, 
  GitMerge, 
  Workflow, 
  Cog, 
  RefreshCw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  FileText,
  Info,
  Users,
  Search,
  Home,
  Clock3,
  RotateCcw
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

  // Calculate diagram dimensions with memoization for better performance
  const diagramDimensions = useMemo(() => {
    if (!nodes.length) return { width: 800, height: 600 };
    
    const maxX = Math.max(...nodes.map(node => node.x + node.width));
    const maxY = Math.max(...nodes.map(node => node.y + node.height));
    
    return {
      width: Math.max(maxX + 100, 800),
      height: Math.max(maxY + 100, 600)
    };
  }, [nodes]);

  // State for minimap
  const [showMinimap, setShowMinimap] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [viewMode, setViewMode] = useState<'flat' | 'timeline'>('flat');
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

  // Get node color based on status with improved accessibility and contrast
  const getNodeColor = (status: string, type: string) => {
    // Base colors with improved contrast
    const colors = {
      completed: '#059669', // Darker green for better contrast
      'in-progress': '#2563eb', // Darker blue for better contrast
      pending: '#d97706', // Darker amber for better contrast
      failed: '#dc2626', // Darker red for better contrast
      default: '#4b5563', // Darker gray for better contrast
    };
    
    // Adjust color based on node type
    if (type === 'parallel' || type === 'map') {
      // Use slightly different shades for container nodes
      return {
        completed: '#047857', // Even darker green
        'in-progress': '#1d4ed8', // Even darker blue
        pending: '#b45309', // Even darker amber
        failed: '#b91c1c', // Even darker red
        default: '#374151', // Even darker gray
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

  // State for file preview
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showActionPanel, setShowActionPanel] = useState(false);

  // Handle node click with improved selection behavior and fixed positioning
  const handleNodeClick = (nodeId: string, event?: React.MouseEvent) => {
    // If event is provided, stop propagation to prevent diagram panning
    if (event) {
      event.stopPropagation();
    }
    
    // Toggle selection without changing pan state
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
    
    // Close file preview when selecting a different node
    if (nodeId !== selectedNode) {
      setShowFilePreview(false);
      setSelectedFile(null);
    }
    
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
  
  // Handle file preview
  const handleViewFile = (file: any) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };
  
  // Handle action on node
  const handleNodeAction = (action: string) => {
    const node = nodes.find(n => n.id === selectedNode);
    if (!node) return;
    
    console.log(`Performing action "${action}" on node:`, node);
    // In a real app, you would dispatch an action to update the workflow
    
    // Show a temporary success message
    alert(`Action "${action}" performed on "${node.label}"`);
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
          onClick={(e) => handleNodeClick(node.id, e)}
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
              fill={isSelected ? `${nodeColor}15` : 'rgba(248, 250, 252, 0.95)'} 
              stroke={nodeColor} 
              strokeWidth={isSelected || isHighlighted ? 3 : 2}
              rx="8" 
              ry="8"
              strokeDasharray="8,4"
            />
          ) : (
            <rect 
              width={node.width} 
              height={node.height} 
              fill={isSelected ? `${nodeColor}15` : 'white'} 
              stroke={nodeColor} 
              strokeWidth={isSelected || isHighlighted ? 3 : 2}
              rx="8" 
              ry="8"
              className={isHighlighted ? 'animate-pulse' : ''}
              filter="url(#drop-shadow)"
            />
          )}
          
          {/* Node content with better layout */}
          {node.type === 'parallel' || node.type === 'map' ? (
            // Stage container node
            <>
              {/* Stage header */}
              <rect 
                x="0" 
                y="0" 
                width={node.width} 
                height="40" 
                fill={nodeColor} 
                rx="8" 
                ry="8"
                opacity="0.1"
              />
              
              {/* Stage icon */}
              <foreignObject x="12" y="8" width="24" height="24">
                <div className="flex items-center justify-center">
                  {getNodeIcon(node.type, node.status)}
                </div>
              </foreignObject>
              
              {/* Stage title */}
              <text 
                x="45" 
                y="20" 
                fontSize="14" 
                fontWeight="600" 
                fill={nodeColor}
                textAnchor="start"
                dominantBaseline="middle"
              >
                {node.label}
              </text>
              
              {/* Stage progress */}
              {node.data?.progress !== undefined && (
                <text 
                  x={node.width - 12} 
                  y="20" 
                  fontSize="12" 
                  fontWeight="500" 
                  fill={nodeColor}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {node.data.progress}%
                </text>
              )}
              
              {/* Stage info */}
              {node.data?.totalSubtasks && (
                <text 
                  x="12" 
                  y="32" 
                  fontSize="10" 
                  fill="#6b7280"
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  {node.data.totalSubtasks} tasks
                </text>
              )}
            </>
          ) : (
            // Task/substage node
            <>
              {/* Task icon */}
              <foreignObject x="12" y="12" width="20" height="20">
                <div className="flex items-center justify-center">
                  {getNodeIcon(node.type, node.status)}
                </div>
              </foreignObject>
              
              {/* Task name - improved text rendering */}
              <text 
                x="40" 
                y="22" 
                fontSize="13" 
                fontWeight="600" 
                fill="#1f2937"
                textAnchor="start"
                dominantBaseline="middle"
              >
                {node.label.length > 35 ? `${node.label.substring(0, 35)}...` : node.label}
              </text>
              
              {/* Status badge */}
              <rect 
                x="40" 
                y="32" 
                width="80" 
                height="16" 
                rx="8" 
                ry="8"
                fill={
                  node.status === 'completed' ? '#dcfce7' :
                  node.status === 'in-progress' ? '#dbeafe' :
                  node.status === 'failed' ? '#fee2e2' :
                  '#fef3c7'
                }
                stroke={
                  node.status === 'completed' ? '#16a34a' :
                  node.status === 'in-progress' ? '#2563eb' :
                  node.status === 'failed' ? '#dc2626' :
                  '#d97706'
                }
                strokeWidth="1"
              />
              
              <text 
                x="80" 
                y="40" 
                fontSize="10" 
                fontWeight="500" 
                fill={
                  node.status === 'completed' ? '#16a34a' :
                  node.status === 'in-progress' ? '#2563eb' :
                  node.status === 'failed' ? '#dc2626' :
                  '#d97706'
                }
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {node.status?.toUpperCase()}
              </text>
              
              {/* Process ID */}
              {node.data?.processId && (
                <text 
                  x="40" 
                  y="58" 
                  fontSize="9" 
                  fontFamily="monospace"
                  fill="#6b7280"
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  ID: {node.data.processId}
                </text>
              )}
              
              {/* Updated by info */}
              {node.data?.updatedBy && (
                <text 
                  x="40" 
                  y="72" 
                  fontSize="9" 
                  fill="#9ca3af"
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  By: {node.data.updatedBy}
                </text>
              )}
              
              {/* Progress bar for in-progress tasks */}
              {node.status === 'in-progress' && node.data?.progress !== undefined && (
                <>
                  <rect 
                    x="40" 
                    y="82" 
                    width="100" 
                    height="4" 
                    rx="2" 
                    ry="2"
                    fill="#e5e7eb"
                  />
                  <rect 
                    x="40" 
                    y="82" 
                    width={node.data.progress} 
                    height="4" 
                    rx="2" 
                    ry="2"
                    fill="#2563eb"
                  />
                </>
              )}
            </>
          )}
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
      {/* Top toolbar with improved controls and workflow info */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-white border-b p-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-medium">{workflowTitle}</h2>
            <div className="text-xs text-muted-foreground">ID: {workflowId}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
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
          
          {/* View mode selector */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
            <Button 
              variant={viewMode === 'flat' ? "default" : "outline"} 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('flat')}
              title="Flat View"
            >
              <GitBranch className="h-3.5 w-3.5 mr-1" />
              Flat
            </Button>
            <Button 
              variant={viewMode === 'timeline' ? "default" : "outline"} 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('timeline')}
              title="Timeline View"
            >
              <Clock3 className="h-3.5 w-3.5 mr-1" />
              Timeline
            </Button>
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
              <RotateCcw className="h-4 w-4" />
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
          className="w-full h-full overflow-hidden cursor-grab relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Zoom percentage indicator */}
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border text-xs font-medium z-10 flex items-center gap-2">
            <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
            {Math.round(zoom * 100)}%
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-5 w-5 p-0 ml-1" 
              onClick={handleResetView}
              title="Reset Zoom"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
          
          {viewMode === 'flat' && (
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
              {/* Enhanced grid background with gradient */}
              <defs>
                <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
                </pattern>
                
                {/* Drop shadow for nodes */}
                <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
                </filter>
                
                {/* Glow effect for selected nodes */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#bg-gradient)" />
              <rect width="100%" height="100%" fill="url(#grid)" fillOpacity="0.7" />
              
              {/* Render edges first so they appear behind nodes */}
              {renderEdges()}
              
              {/* Render nodes */}
              {renderNodes()}
            </svg>
          )}
          
          {viewMode === 'timeline' && (
            <div className="w-full h-full overflow-auto p-6">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Clock3 className="h-5 w-5 mr-2 text-blue-500" />
                  Workflow Timeline View
                </h3>
                
                <div className="relative">
                  {/* Timeline header */}
                  <div className="flex border-b mb-4 pb-2">
                    <div className="w-1/4 font-medium text-sm">Stage/Task</div>
                    <div className="w-3/4 font-medium text-sm">Timeline</div>
                  </div>
                  
                  {/* Timeline content */}
                  <div className="space-y-4">
                    {nodes
                      .filter(node => node.id !== 'start' && node.id !== 'end')
                      .sort((a, b) => {
                        // Sort by stage first, then by task
                        if (a.id.startsWith('stage-') && b.id.startsWith('substage-')) return -1;
                        if (a.id.startsWith('substage-') && b.id.startsWith('stage-')) return 1;
                        return a.y - b.y;
                      })
                      .map((node, index) => {
                        // Calculate progress percentage for timeline bar
                        const progress = node.data?.progress || 
                                        (node.status === 'completed' ? 100 : 
                                         node.status === 'in-progress' ? 50 : 
                                         node.status === 'failed' ? 30 : 10);
                        
                        // Calculate color based on status
                        const color = node.status === 'completed' ? 'bg-green-500' :
                                     node.status === 'in-progress' ? 'bg-blue-500' :
                                     node.status === 'failed' ? 'bg-red-500' : 'bg-amber-500';
                        
                        return (
                          <div key={node.id} className="flex items-center">
                            {/* Node info */}
                            <div className="w-1/4 pr-4">
                              <div className="flex items-start">
                                <div className={`mt-1 w-3 h-3 rounded-full ${color} flex-shrink-0`}></div>
                                <div className="ml-2">
                                  <div className="font-medium text-sm">{node.label}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {node.id.startsWith('stage-') ? 'Stage' : 'Task'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Timeline bar */}
                            <div className="w-3/4 pl-2">
                              <div className="h-6 bg-gray-100 rounded-full overflow-hidden relative">
                                <div 
                                  className={`h-full ${color} rounded-full`}
                                  style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}
                                ></div>
                                
                                {/* Timeline markers */}
                                <div className="absolute inset-0 flex items-center justify-between px-3">
                                  <div className="text-xs font-medium text-white z-10">
                                    {node.data?.startTime ? new Date(node.data.startTime).toLocaleDateString() : 'Start'}
                                  </div>
                                  <div className="text-xs font-medium z-10">
                                    {progress}%
                                  </div>
                                  <div className="text-xs font-medium text-gray-700 z-10">
                                    {node.data?.endTime ? new Date(node.data.endTime).toLocaleDateString() : 'End'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Timeline details */}
                              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                <div>
                                  {node.data?.duration ? `${node.data.duration} min` : ''}
                                </div>
                                <div>
                                  {node.data?.updatedBy ? `Updated by ${node.data.updatedBy}` : ''}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setViewMode('flat')}
                    className="flex items-center"
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Switch to Diagram View
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Render minimap */}
        {renderMinimap()}
      </div>
      
      {/* File Preview Panel */}
      {showFilePreview && selectedFile && (
        <div className="absolute inset-0 bg-white z-10 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h3 className="text-lg font-medium">{selectedFile.name || 'File Preview'}</h3>
              <p className="text-sm text-muted-foreground">
                {nodes.find(n => n.id === selectedNode)?.label || 'Document'} • {selectedFile.type || 'File'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowFilePreview(false);
                setSelectedFile(null);
              }}
            >
              Close Preview
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="border rounded-md p-4 h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">{selectedFile.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Preview not available in this view. Please use the Modern View for full file preview functionality.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowFilePreview(false);
                    setSelectedFile(null);
                  }}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Panel */}
      {showActionPanel && selectedNode && (
        <div className="absolute top-16 right-4 bg-white border rounded-md shadow-lg z-10 w-64">
          <div className="p-3 border-b">
            <h3 className="font-medium">Actions</h3>
          </div>
          <div className="p-2 space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleNodeAction('approve')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleNodeAction('reject')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleNodeAction('reassign')}
            >
              <Users className="h-4 w-4 mr-2" />
              Reassign
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleNodeAction('message')}
            >
              <Info className="h-4 w-4 mr-2" />
              Add Message
            </Button>
            <Separator className="my-2" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => setShowActionPanel(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Node details panel with improved layout and tabs */}
      {selectedNode && !showFilePreview && (
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
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7"
                onClick={() => setShowActionPanel(!showActionPanel)}
              >
                Actions
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setSelectedNode(null)}
              >
                ×
              </Button>
            </div>
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
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">{doc.size}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleViewFile(doc)}
                                >
                                  <Search className="h-3 w-3" />
                                </Button>
                              </div>
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => handleNodeAction('message')}
                        >
                          Add Message
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-xs text-muted-foreground p-4 text-center">
                          No messages found for this task.
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleNodeAction('message')}
                        >
                          Add Message
                        </Button>
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
                      
                      {/* Action buttons for stage */}
                      <div className="mt-3 flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleNodeAction('refresh')}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Refresh
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleNodeAction('details')}
                        >
                          <Info className="h-4 w-4 mr-1" />
                          Details
                        </Button>
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