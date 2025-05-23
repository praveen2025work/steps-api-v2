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
  
  // Constants for layout with improved spacing
  const CANVAS_WIDTH = 1200;
  const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
  const VERTICAL_SPACING = 180; // Increased for better readability
  const NODE_WIDTH = 180; // Wider nodes for better text display
  const NODE_HEIGHT = 90; // Taller nodes for better text display
  const SUBSTAGE_NODE_WIDTH = 160; // Wider substage nodes
  const SUBSTAGE_NODE_HEIGHT = 80; // Taller substage nodes
  const HORIZONTAL_SPACING = 220; // More horizontal space
  
  // Start node
  nodes.push({
    id: 'start',
    type: 'task',
    label: 'Start Process',
    status: 'completed',
    x: CANVAS_CENTER_X - NODE_WIDTH / 2,
    y: 50,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    data: { 
      description: 'Initiates the workflow process',
      startTime: workflow.startTime || new Date().toISOString(),
      workflowId: workflow.id
    }
  });
  
  let currentY = 50 + NODE_HEIGHT + VERTICAL_SPACING;
  
  // Process stages as nodes
  if (workflow.stages && Array.isArray(workflow.stages)) {
    const totalStages = workflow.stages.length;
    
    workflow.stages.forEach((stage: any, stageIndex: number) => {
      // Create stage node with improved data
      const stageNode: DiagramNode = {
        id: `stage-${stage.id}`,
        type: 'parallel',
        label: stage.name,
        status: getStageStatus(stage, workflow),
        x: CANVAS_CENTER_X - NODE_WIDTH / 2,
        y: currentY,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        data: { 
          stageId: stage.id,
          processId: `S-${stage.id}`, // Add a process ID for the stage
          description: stage.description || `Stage ${stageIndex + 1} of the workflow process`,
          progress: stage.progress || 0,
          order: stageIndex + 1,
          totalSubtasks: workflow.tasks?.[stage.id]?.length || 0
        }
      };
      
      nodes.push(stageNode);
      
      // Connect to previous node
      const sourceId = stageIndex === 0 ? 'start' : `stage-${workflow.stages[stageIndex - 1].id}`;
      edges.push({
        id: `edge-${sourceId}-${stageNode.id}`,
        source: sourceId,
        target: stageNode.id,
        type: 'default'
      });
      
      // Process substages if available
      const stageTasks = workflow.tasks?.[stage.id] || [];
      
      if (stageTasks.length > 0) {
        currentY += NODE_HEIGHT + 80; // Space for stage node and some padding
        
        // Calculate layout for substage nodes
        const tasksPerRow = Math.min(stageTasks.length, 5); // Max 5 tasks per row
        const rows = Math.ceil(stageTasks.length / tasksPerRow);
        
        // Calculate total width needed for this row of tasks
        const totalRowWidth = tasksPerRow * SUBSTAGE_NODE_WIDTH + (tasksPerRow - 1) * 40; // 40px spacing between nodes
        const startX = CANVAS_CENTER_X - totalRowWidth / 2;
        
        // Process substages
        stageTasks.forEach((task: any, taskIndex: number) => {
          // Calculate position for substage
          const row = Math.floor(taskIndex / tasksPerRow);
          const col = taskIndex % tasksPerRow;
          
          const x = startX + col * (SUBSTAGE_NODE_WIDTH + 40);
          const y = currentY + row * (SUBSTAGE_NODE_HEIGHT + 40);
          
          // Normalize task status
          let taskStatus = task.status;
          if (taskStatus === 'in_progress') taskStatus = 'in-progress';
          
          // Create substage node with improved data
          const substageNode: DiagramNode = {
            id: `substage-${task.id}`,
            type: 'task',
            label: task.name,
            status: taskStatus as 'completed' | 'in-progress' | 'pending' | 'failed',
            x: x,
            y: y,
            width: SUBSTAGE_NODE_WIDTH,
            height: SUBSTAGE_NODE_HEIGHT,
            data: { 
              taskId: task.id,
              processId: task.processId || `T-${task.id}`, // Ensure process ID is always available
              duration: task.duration,
              expectedStart: task.expectedStart,
              updatedBy: task.updatedBy,
              updatedAt: task.updatedAt,
              dependencies: task.dependencies,
              documents: task.documents,
              messages: task.messages,
              stageId: stage.id,
              stageName: stage.name,
              // Add more descriptive information
              description: task.description || `Task in ${stage.name} stage`,
              priority: task.priority || 'Normal',
              type: task.type || 'Standard'
            }
          };
          
          nodes.push(substageNode);
          
          // Connect stage to substage
          edges.push({
            id: `edge-${stageNode.id}-${substageNode.id}`,
            source: stageNode.id,
            target: substageNode.id,
            type: 'default'
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
        
        // Update currentY for next stage
        currentY += rows * (SUBSTAGE_NODE_HEIGHT + 40) + 40; // Add extra padding after substages
      } else {
        // If no tasks, just add spacing for the next stage
        currentY += NODE_HEIGHT + VERTICAL_SPACING;
      }
    });
    
    // Add end node
    nodes.push({
      id: 'end',
      type: 'succeed',
      label: 'End Process',
      status: workflow.status === 'completed' ? 'completed' : 'pending',
      x: CANVAS_CENTER_X - NODE_WIDTH / 2,
      y: currentY,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      data: { 
        description: 'Completes the workflow process',
        endTime: workflow.endTime || null,
        estimatedCompletion: workflow.estimatedCompletion || null
      }
    });
    
    // Connect last stage to end
    if (workflow.stages.length > 0) {
      const lastStage = workflow.stages[workflow.stages.length - 1];
      edges.push({
        id: `edge-stage-${lastStage.id}-end`,
        source: `stage-${lastStage.id}`,
        target: 'end',
        type: 'default'
      });
    } else {
      // If no stages, connect start to end
      edges.push({
        id: 'edge-start-end',
        source: 'start',
        target: 'end',
        type: 'default'
      });
    }
  } else {
    // If no stages, just connect start to end
    nodes.push({
      id: 'end',
      type: 'succeed',
      label: 'End Process',
      status: 'pending',
      x: CANVAS_CENTER_X - NODE_WIDTH / 2,
      y: currentY,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      data: { description: 'Completes the workflow process' }
    });
    
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