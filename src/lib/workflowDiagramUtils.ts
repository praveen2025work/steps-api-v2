/**
 * Utility functions for generating workflow diagrams in AWS Step Function style
 */

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

interface WorkflowDiagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

/**
 * Generate a sample workflow diagram for demonstration purposes
 */
export function generateSampleWorkflowDiagram(): WorkflowDiagram {
  // Create nodes
  const nodes: DiagramNode[] = [
    {
      id: 'start',
      type: 'task',
      label: 'Start Process',
      status: 'completed',
      x: 350,
      y: 50,
      width: 120,
      height: 80,
      data: { description: 'Initiates the workflow process' }
    },
    {
      id: 'validate-input',
      type: 'task',
      label: 'Validate Input',
      status: 'completed',
      x: 350,
      y: 180,
      width: 120,
      height: 80,
      data: { description: 'Validates the input data' }
    },
    {
      id: 'check-conditions',
      type: 'choice',
      label: 'Check Conditions',
      status: 'completed',
      x: 350,
      y: 310,
      width: 120,
      height: 80,
      data: { description: 'Checks conditions for processing' }
    },
    {
      id: 'process-a',
      type: 'task',
      label: 'Process A',
      status: 'completed',
      x: 200,
      y: 440,
      width: 120,
      height: 80,
      data: { description: 'Executes Process A' }
    },
    {
      id: 'process-b',
      type: 'task',
      label: 'Process B',
      status: 'in-progress',
      x: 500,
      y: 440,
      width: 120,
      height: 80,
      data: { description: 'Executes Process B' }
    },
    {
      id: 'parallel-tasks',
      type: 'parallel',
      label: 'Parallel Tasks',
      status: 'in-progress',
      x: 350,
      y: 570,
      width: 120,
      height: 80,
      data: { description: 'Executes tasks in parallel' }
    },
    {
      id: 'task-1',
      type: 'task',
      label: 'Task 1',
      status: 'completed',
      x: 200,
      y: 700,
      width: 120,
      height: 80,
      data: { description: 'Executes Task 1' }
    },
    {
      id: 'task-2',
      type: 'task',
      label: 'Task 2',
      status: 'pending',
      x: 500,
      y: 700,
      width: 120,
      height: 80,
      data: { description: 'Executes Task 2' }
    },
    {
      id: 'finalize',
      type: 'task',
      label: 'Finalize',
      status: 'pending',
      x: 350,
      y: 830,
      width: 120,
      height: 80,
      data: { description: 'Finalizes the workflow' }
    },
    {
      id: 'end',
      type: 'succeed',
      label: 'End Process',
      status: 'pending',
      x: 350,
      y: 960,
      width: 120,
      height: 80,
      data: { description: 'Ends the workflow process' }
    }
  ];

  // Create edges
  const edges: DiagramEdge[] = [
    {
      id: 'edge-start-validate',
      source: 'start',
      target: 'validate-input',
      type: 'default'
    },
    {
      id: 'edge-validate-check',
      source: 'validate-input',
      target: 'check-conditions',
      type: 'default'
    },
    {
      id: 'edge-check-process-a',
      source: 'check-conditions',
      target: 'process-a',
      label: 'Condition A',
      type: 'condition'
    },
    {
      id: 'edge-check-process-b',
      source: 'check-conditions',
      target: 'process-b',
      label: 'Condition B',
      type: 'condition'
    },
    {
      id: 'edge-process-a-parallel',
      source: 'process-a',
      target: 'parallel-tasks',
      type: 'success'
    },
    {
      id: 'edge-process-b-parallel',
      source: 'process-b',
      target: 'parallel-tasks',
      type: 'success'
    },
    {
      id: 'edge-parallel-task-1',
      source: 'parallel-tasks',
      target: 'task-1',
      type: 'default'
    },
    {
      id: 'edge-parallel-task-2',
      source: 'parallel-tasks',
      target: 'task-2',
      type: 'default'
    },
    {
      id: 'edge-task-1-finalize',
      source: 'task-1',
      target: 'finalize',
      type: 'success'
    },
    {
      id: 'edge-task-2-finalize',
      source: 'task-2',
      target: 'finalize',
      type: 'success'
    },
    {
      id: 'edge-finalize-end',
      source: 'finalize',
      target: 'end',
      type: 'success'
    }
  ];

  return { nodes, edges };
}

/**
 * Convert a workflow object to a diagram representation
 * @param workflow The workflow object to convert
 */
export function convertWorkflowToDiagram(workflow: any): WorkflowDiagram {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  
  // Start node
  nodes.push({
    id: 'start',
    type: 'task',
    label: 'Start Process',
    status: 'completed',
    x: 350,
    y: 50,
    width: 120,
    height: 80,
    data: { description: 'Initiates the workflow process' }
  });
  
  // Process stages as nodes
  if (workflow.stages && Array.isArray(workflow.stages)) {
    // Calculate total height needed for all stages and their tasks
    const totalStages = workflow.stages.length;
    
    workflow.stages.forEach((stage: any, index: number) => {
      // Create stage node
      const stageNode: DiagramNode = {
        id: `stage-${stage.id}`,
        type: 'parallel',
        label: stage.name,
        status: getStageStatus(stage, workflow),
        x: 350,
        y: 180 + index * 250, // Increase vertical spacing between stages
        width: 150, // Make stage nodes wider
        height: 80,
        data: { 
          stageId: stage.id,
          description: stage.description || `Stage ${index + 1} of the workflow process`
        }
      };
      
      nodes.push(stageNode);
      
      // Connect to previous node
      const sourceId = index === 0 ? 'start' : `stage-${workflow.stages[index - 1].id}`;
      edges.push({
        id: `edge-${sourceId}-${stageNode.id}`,
        source: sourceId,
        target: stageNode.id,
        type: 'default'
      });
      
      // Process substages if available
      const stageTasks = workflow.tasks?.[stage.id] || [];
      
      if (stageTasks.length > 0) {
        // For better visualization, we'll use a map node instead of a choice node
        const mapNode: DiagramNode = {
          id: `map-${stage.id}`,
          type: 'map',
          label: `${stage.name} Tasks`,
          status: getStageStatus(stage, workflow),
          x: 350,
          y: 180 + index * 250 + 100, // Position below the stage node
          width: 150,
          height: 60,
          data: { stageId: stage.id }
        };
        
        nodes.push(mapNode);
        
        // Connect stage to map
        edges.push({
          id: `edge-${stageNode.id}-${mapNode.id}`,
          source: stageNode.id,
          target: mapNode.id,
          type: 'default'
        });
        
        // Calculate layout for substage nodes
        const tasksPerRow = 3; // Number of tasks to display per row
        const horizontalSpacing = 180; // Spacing between tasks horizontally
        const verticalSpacing = 100; // Spacing between rows
        
        // Process substages
        stageTasks.forEach((task: any, taskIndex: number) => {
          // Calculate position for substage
          const row = Math.floor(taskIndex / tasksPerRow);
          const col = taskIndex % tasksPerRow;
          const centerX = 350; // Center position
          const startX = centerX - ((Math.min(stageTasks.length, tasksPerRow) - 1) * horizontalSpacing) / 2;
          
          const x = startX + col * horizontalSpacing;
          const y = 180 + index * 250 + 180 + row * verticalSpacing;
          
          // Normalize task status
          let taskStatus = task.status;
          if (taskStatus === 'in_progress') taskStatus = 'in-progress';
          
          // Create substage node
          const substageNode: DiagramNode = {
            id: `substage-${task.id}`,
            type: 'task',
            label: task.name,
            status: taskStatus as 'completed' | 'in-progress' | 'pending' | 'failed',
            x: x,
            y: y,
            width: 140,
            height: 80,
            data: { 
              taskId: task.id,
              processId: task.processId,
              duration: task.duration,
              expectedStart: task.expectedStart,
              updatedBy: task.updatedBy,
              updatedAt: task.updatedAt,
              dependencies: task.dependencies,
              documents: task.documents,
              messages: task.messages
            }
          };
          
          nodes.push(substageNode);
          
          // Connect map to substage
          edges.push({
            id: `edge-${mapNode.id}-${substageNode.id}`,
            source: mapNode.id,
            target: substageNode.id,
            type: 'condition',
            label: task.processId
          });
          
          // If task has dependencies, add edges from dependency tasks
          if (task.dependencies && Array.isArray(task.dependencies)) {
            task.dependencies.forEach((dep: any) => {
              // Find the dependency task node
              const depTask = stageTasks.find((t: any) => t.name === dep.name);
              if (depTask) {
                edges.push({
                  id: `edge-dep-${depTask.id}-${task.id}`,
                  source: `substage-${depTask.id}`,
                  target: `substage-${task.id}`,
                  type: dep.status === 'completed' ? 'success' : 'default',
                  label: 'depends on'
                });
              }
            });
          }
        });
      }
      
      // If this is the last stage, connect to end
      if (index === workflow.stages.length - 1) {
        // Add end node
        const endNode: DiagramNode = {
          id: 'end',
          type: 'succeed',
          label: 'End Process',
          status: workflow.status === 'completed' ? 'completed' : 'pending',
          x: 350,
          y: 180 + (index + 1) * 250 + 50,
          width: 120,
          height: 80,
          data: { description: 'Completes the workflow process' }
        };
        
        nodes.push(endNode);
        
        // If there are tasks, connect the map node to end
        if (workflow.tasks?.[stage.id]?.length > 0) {
          edges.push({
            id: `edge-map-${stage.id}-end`,
            source: `map-${stage.id}`,
            target: 'end',
            type: 'success'
          });
        } else {
          // Otherwise connect the stage directly to end
          edges.push({
            id: `edge-${stageNode.id}-end`,
            source: stageNode.id,
            target: 'end',
            type: 'success'
          });
        }
      }
    });
  } else {
    // If no stages, just connect start to end
    // Add end node
    nodes.push({
      id: 'end',
      type: 'succeed',
      label: 'End Process',
      status: 'pending',
      x: 350,
      y: 180,
      width: 120,
      height: 80,
      data: { description: 'Completes the workflow process' }
    });
    
    // Connect start to end
    edges.push({
      id: 'edge-start-end',
      source: 'start',
      target: 'end',
      type: 'default'
    });
  }
  
  return { nodes, edges };
}

/**
 * Determine the status of a stage based on its tasks
 */
function getStageStatus(stage: any, workflow: any): 'completed' | 'in-progress' | 'pending' | 'failed' {
  const stageTasks = workflow.tasks?.[stage.id] || [];
  
  if (stageTasks.length === 0) return 'pending';
  
  const completedTasks = stageTasks.filter((task: any) => task.status === 'completed').length;
  const failedTasks = stageTasks.filter((task: any) => task.status === 'failed').length;
  const inProgressTasks = stageTasks.filter((task: any) => task.status === 'in-progress' || task.status === 'in_progress').length;
  
  if (failedTasks > 0) return 'failed';
  if (completedTasks === stageTasks.length) return 'completed';
  if (inProgressTasks > 0) return 'in-progress';
  
  return 'pending';
}