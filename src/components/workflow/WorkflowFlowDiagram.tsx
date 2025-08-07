import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Pause, CheckCircle, XCircle, Clock,
  Settings, Users, Upload, FileText, ChevronDown, ChevronRight
} from 'lucide-react';

// Define types
interface Substage {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'completed' | 'in_progress' | 'failed' | 'not_started';
  type: 'auto' | 'manual' | 'upload';
  dependencies: string[];
  [key: string]: any; // Allow other properties
}

interface Stage {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'completed' | 'in_progress' | 'failed' | 'not_started';
  substages: Substage[];
}

interface WorkflowData {
  stages: Stage[];
}

interface WorkflowFlowDiagramProps {
  workflowData: WorkflowData;
  onNodeClick: (node: Substage) => void;
  selectedNodeId?: string | null;
}

const WorkflowFlowDiagram: React.FC<WorkflowFlowDiagramProps> = ({ workflowData, onNodeClick, selectedNodeId }) => {
  const [expandedStages, setExpandedStages] = useState<{ [key: string]: boolean }>({});
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Expand all stages by default when component mounts or data changes
    const initialExpansionState = (workflowData.stages || []).reduce((acc, stage) => {
      acc[stage.id] = true;
      return acc;
    }, {} as { [key: string]: boolean });
    setExpandedStages(initialExpansionState);
  }, [workflowData]);

  // Memoize calculations for performance
  const { width, height, allSubstages } = useMemo(() => {
    if (!workflowData || !workflowData.stages || workflowData.stages.length === 0) {
      return { width: 800, height: 600, allSubstages: [] };
    }

    const allNodes = workflowData.stages.flatMap(stage => [
      { x: stage.x, y: stage.y },
      ...(stage.substages || []).map(substage => ({ x: substage.x, y: substage.y })),
    ]);

    const maxX = allNodes.length > 0 ? Math.max(...allNodes.map(node => node.x)) + 250 : 800;
    const maxY = allNodes.length > 0 ? Math.max(...allNodes.map(node => node.y)) + 150 : 600;
    
    const substages = workflowData.stages.flatMap(stage =>
      (stage.substages || []).map(substage => ({ ...substage, stageId: stage.id }))
    );

    return { width: Math.max(maxX, 1200), height: Math.max(maxY, 800), allSubstages: substages };
  }, [workflowData]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: '#10b981', bgColor: '#d1fae5', icon: CheckCircle };
      case 'in_progress':
        return { color: '#3b82f6', bgColor: '#dbeafe', icon: Clock };
      case 'failed':
        return { color: '#ef4444', bgColor: '#fee2e2', icon: XCircle };
      case 'not_started':
      default:
        return { color: '#6b7280', bgColor: '#f3f4f6', icon: Pause };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'auto': return Settings;
      case 'manual': return Users;
      case 'upload': return Upload;
      default: return FileText;
    }
  };

  const getConnectionPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const fromX = from.x + 150;
    const fromY = from.y + 25;
    const toX = to.x;
    const toY = to.y + 25;
    const midX1 = fromX + 50;
    const midX2 = toX - 50;
    return `M ${fromX} ${fromY} C ${midX1} ${fromY}, ${midX2} ${toY}, ${toX} ${toY}`;
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, stageId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleStageExpansion(stageId);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 overflow-auto p-4">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-white rounded-lg shadow-sm"
        role="img"
        aria-label="Workflow process flow diagram"
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
        </defs>

        {/* Draw connections */}
        {allSubstages.map(substage =>
          (substage.dependencies || []).map(depId => {
            const dependency = allSubstages.find(s => s.id === depId);
            if (!dependency) return null;
            return (
              <path
                key={`${dependency.id}-${substage.id}`}
                d={getConnectionPath(dependency, substage)}
                stroke="#9ca3af"
                strokeWidth="1.5"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="opacity-70"
              />
            );
          })
        )}

        {/* Draw nodes */}
        {(workflowData.stages || []).map(stage => {
          const statusConfig = getStatusConfig(stage.status);
          const isExpanded = expandedStages[stage.id];

          return (
            <g key={stage.id} role="button" tabIndex={0} onKeyDown={e => handleKeyDown(e, stage.id)}>
              {/* Stage node */}
              <rect
                x={stage.x}
                y={stage.y}
                width="180"
                height="50"
                fill={statusConfig.bgColor}
                stroke={statusConfig.color}
                strokeWidth="2"
                rx="8"
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => toggleStageExpansion(stage.id)}
                aria-label={`Toggle ${stage.name} stage`}
              />
              <g transform={`translate(${stage.x + 12}, ${stage.y + 17})`}>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" style={{ color: statusConfig.color }} />
                ) : (
                  <ChevronRight className="w-4 h-4" style={{ color: statusConfig.color }} />
                )}
              </g>
              <text
                x={stage.x + 40}
                y={stage.y + 30}
                fontSize="14"
                fontWeight="600"
                fill={statusConfig.color}
                className="pointer-events-none"
              >
                {stage.name}
              </text>

              {/* Draw substages if expanded */}
              {isExpanded &&
                (stage.substages || []).map(substage => {
                  const subStatusConfig = getStatusConfig(substage.status);
                  const TypeIcon = getTypeIcon(substage.type);
                  const isSelected = selectedNodeId === substage.id;

                  return (
                    <g key={substage.id} role="button" tabIndex={0} onClick={() => onNodeClick(substage)}>
                      <rect
                        x={substage.x}
                        y={substage.y}
                        width="150"
                        height="50"
                        fill={subStatusConfig.bgColor}
                        stroke={isSelected ? '#2563eb' : subStatusConfig.color}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        rx="6"
                        className="cursor-pointer transition-all hover:shadow-lg"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 5px #2563eb)' : 'none' }}
                        aria-label={`Select ${substage.name} substage`}
                      />
                      <g transform={`translate(${substage.x + 10}, ${substage.y + 10})`}>
                        <TypeIcon className="w-4 h-4" style={{ color: subStatusConfig.color }} />
                      </g>
                      <circle
                        cx={substage.x + 138}
                        cy={substage.y + 12}
                        r="5"
                        fill={subStatusConfig.color}
                        stroke="#fff"
                        strokeWidth="1"
                      />
                      <foreignObject x={substage.x + 10} y={substage.y + 28} width="130" height="20">
                        <div
                          xmlns="http://www.w3.org/1999/xhtml"
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            color: subStatusConfig.color,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '130px',
                          }}
                          title={substage.name}
                        >
                          {substage.name}
                        </div>
                      </foreignObject>
                      {/* Connection from stage to substage */}
                      <line
                        x1={stage.x + 180}
                        y1={stage.y + 25}
                        x2={substage.x}
                        y2={substage.y + 25}
                        stroke="#e5e7eb"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                    </g>
                  );
                })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WorkflowFlowDiagram;