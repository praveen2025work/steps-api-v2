import { WorkflowStage, SubStage } from '@/types/workflow';

interface DiagramNode {
  id: string;
  name: string;
  type: 'start' | 'task' | 'choice' | 'parallel' | 'end';
  status: 'completed' | 'in-progress' | 'not-started' | 'failed' | 'skipped';
  position: { x: number; y: number };
  data?: any;
}

interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

/**
 * Converts workflow stages and substages to diagram nodes and edges
 */
export const convertWorkflowToDiagram = (
  stages: WorkflowStage[],
  tasks: Record<string, any[]> = {}
): { nodes: DiagramNode[], edges: DiagramEdge[] } => {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  
  // Add start node
  nodes.push({
    id: 'start',
    name: 'Start',
    type: 'start',
    status: 'completed',
    position: { x: 100, y: 300 }
  });
  
  let lastNodeId = 'start';
  let xPosition = 250;
  const yBase = 300;
  const xIncrement = 200;
  
  // Process each stage
  stages.forEach((stage, stageIndex) => {
    // Create stage node
    const stageNodeId = `stage-${stage.id}`;
    nodes.push({
      id: stageNodeId,
      name: stage.name,
      type: 'task',
      status: stage.status,
      position: { x: xPosition, y: yBase },
      data: { stageId: stage.id }
    });
    
    // Connect previous node to this stage
    edges.push({
      id: `edge-${lastNodeId}-${stageNodeId}`,
      source: lastNodeId,
      target: stageNodeId
    });
    
    lastNodeId = stageNodeId;
    xPosition += xIncrement;
    
    // If stage has substages, process them
    if (stage.substages && stage.substages.length > 0) {
      // Create a parallel node for substages
      const parallelNodeId = `parallel-${stage.id}`;
      nodes.push({
        id: parallelNodeId,
        name: 'Substages',
        type: 'parallel',
        status: stage.status,
        position: { x: xPosition, y: yBase },
        data: { stageId: stage.id }
      });
      
      // Connect stage to parallel node
      edges.push({
        id: `edge-${lastNodeId}-${parallelNodeId}`,
        source: lastNodeId,
        target: parallelNodeId
      });
      
      lastNodeId = parallelNodeId;
      xPosition += xIncrement;
      
      // Process substages
      const substageYOffset = 150;
      const substageYIncrement = 100;
      let substageYPosition = yBase - ((stage.substages.length - 1) * substageYIncrement / 2);
      
      stage.substages.forEach((substage, substageIndex) => {
        const substageNodeId = `substage-${substage.id}`;
        nodes.push({
          id: substageNodeId,
          name: substage.name,
          type: 'task',
          status: substage.status,
          position: { x: xPosition, y: substageYPosition },
          data: { 
            stageId: stage.id,
            substageId: substage.id,
            substage: substage
          }
        });
        
        // Connect parallel node to substage
        edges.push({
          id: `edge-${parallelNodeId}-${substageNodeId}`,
          source: parallelNodeId,
          target: substageNodeId
        });
        
        substageYPosition += substageYIncrement;
        
        // If this is the last substage, update lastNodeId
        if (substageIndex === stage.substages.length - 1) {
          lastNodeId = substageNodeId;
        }
      });
      
      // Create a join node after substages
      const joinNodeId = `join-${stage.id}`;
      nodes.push({
        id: joinNodeId,
        name: 'Join',
        type: 'parallel',
        status: stage.status,
        position: { x: xPosition + xIncrement, y: yBase },
        data: { stageId: stage.id }
      });
      
      // Connect all substages to join node
      stage.substages.forEach((substage) => {
        const substageNodeId = `substage-${substage.id}`;
        edges.push({
          id: `edge-${substageNodeId}-${joinNodeId}`,
          source: substageNodeId,
          target: joinNodeId
        });
      });
      
      lastNodeId = joinNodeId;
      xPosition += xIncrement;
    }
  });
  
  // Add end node
  nodes.push({
    id: 'end',
    name: 'End',
    type: 'end',
    status: stages.every(stage => stage.status === 'completed') ? 'completed' : 'not-started',
    position: { x: xPosition, y: yBase }
  });
  
  // Connect last node to end
  edges.push({
    id: `edge-${lastNodeId}-end`,
    source: lastNodeId,
    target: 'end'
  });
  
  return { nodes, edges };
};

/**
 * Generates a sample workflow diagram for demonstration
 */
export const generateSampleWorkflowDiagram = () => {
  const nodes: DiagramNode[] = [
    {
      id: 'start',
      name: 'Start',
      type: 'start',
      status: 'completed',
      position: { x: 100, y: 300 }
    },
    {
      id: 'validate',
      name: 'Validate Input',
      type: 'task',
      status: 'completed',
      position: { x: 250, y: 300 }
    },
    {
      id: 'check',
      name: 'Check Conditions',
      type: 'choice',
      status: 'completed',
      position: { x: 450, y: 300 }
    },
    {
      id: 'process-a',
      name: 'Process A',
      type: 'task',
      status: 'completed',
      position: { x: 650, y: 200 }
    },
    {
      id: 'process-b',
      name: 'Process B',
      type: 'task',
      status: 'in-progress',
      position: { x: 650, y: 400 }
    },
    {
      id: 'parallel',
      name: 'Parallel Tasks',
      type: 'parallel',
      status: 'in-progress',
      position: { x: 850, y: 300 }
    },
    {
      id: 'task-1',
      name: 'Task 1',
      type: 'task',
      status: 'completed',
      position: { x: 1050, y: 200 }
    },
    {
      id: 'task-2',
      name: 'Task 2',
      type: 'task',
      status: 'in-progress',
      position: { x: 1050, y: 300 }
    },
    {
      id: 'task-3',
      name: 'Task 3',
      type: 'task',
      status: 'not-started',
      position: { x: 1050, y: 400 }
    },
    {
      id: 'join',
      name: 'Join',
      type: 'parallel',
      status: 'not-started',
      position: { x: 1250, y: 300 }
    },
    {
      id: 'final',
      name: 'Final Processing',
      type: 'task',
      status: 'not-started',
      position: { x: 1450, y: 300 }
    },
    {
      id: 'end',
      name: 'End',
      type: 'end',
      status: 'not-started',
      position: { x: 1600, y: 300 }
    }
  ];
  
  const edges: DiagramEdge[] = [
    {
      id: 'edge-start-validate',
      source: 'start',
      target: 'validate'
    },
    {
      id: 'edge-validate-check',
      source: 'validate',
      target: 'check'
    },
    {
      id: 'edge-check-process-a',
      source: 'check',
      target: 'process-a',
      label: 'Condition A'
    },
    {
      id: 'edge-check-process-b',
      source: 'check',
      target: 'process-b',
      label: 'Condition B'
    },
    {
      id: 'edge-process-a-parallel',
      source: 'process-a',
      target: 'parallel'
    },
    {
      id: 'edge-process-b-parallel',
      source: 'process-b',
      target: 'parallel'
    },
    {
      id: 'edge-parallel-task-1',
      source: 'parallel',
      target: 'task-1'
    },
    {
      id: 'edge-parallel-task-2',
      source: 'parallel',
      target: 'task-2'
    },
    {
      id: 'edge-parallel-task-3',
      source: 'parallel',
      target: 'task-3'
    },
    {
      id: 'edge-task-1-join',
      source: 'task-1',
      target: 'join'
    },
    {
      id: 'edge-task-2-join',
      source: 'task-2',
      target: 'join'
    },
    {
      id: 'edge-task-3-join',
      source: 'task-3',
      target: 'join'
    },
    {
      id: 'edge-join-final',
      source: 'join',
      target: 'final'
    },
    {
      id: 'edge-final-end',
      source: 'final',
      target: 'end'
    }
  ];
  
  return { nodes, edges };
};