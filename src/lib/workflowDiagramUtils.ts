import { MarkerType } from 'reactflow';

// Helper function to calculate stage status based on its substages
const calculateStageStatus = (substages: any[]): 'completed' | 'in_progress' | 'failed' | 'not_started' => {
    if (!substages || substages.length === 0) {
        return 'not_started';
    }
    if (substages.some(s => s.status === 'failed')) return 'failed';
    if (substages.some(s => s.status === 'in_progress')) return 'in_progress';
    if (substages.every(s => s.status === 'completed')) return 'completed';
    return 'not_started';
};

// Helper to map API status to diagram status
const mapStatus = (status: string | undefined): 'completed' | 'in_progress' | 'failed' | 'not_started' => {
    const s = status?.toLowerCase().replace(/_/g, ' ').trim();
    switch (s) {
        case 'completed':
            return 'completed';
        case 'in progress':
        case 'running':
            return 'in_progress';
        case 'failed':
        case 'error':
            return 'failed';
        case 'not started':
        case 'pending':
        default:
            return 'not_started';
    }
};

export const transformWorkflowToFlowDiagramData = (workflow: any) => {
    if (!workflow || !workflow.stages || !workflow.tasks) {
        return { stages: [] };
    }

    const allTasks = Object.values(workflow.tasks).flat() as any[];
    const allTasksById = new Map(allTasks.map(t => [t.id, t]));
    const allTasksByProcessId = new Map(allTasks.map(t => [t.processId, t]));

    const getTaskByDependency = (dep: any) => {
        if (!dep) return null;
        // Try matching by processId first, then by name as a fallback
        return allTasksByProcessId.get(dep.id) || allTasks.find(t => t.name === dep.name);
    };

    let currentY = 100; // Initial Y position
    const STAGE_V_GAP = 80;
    const SUBSTAGE_V_GAP = 100;
    const SUBSTAGE_H_GAP = 250;
    const SUBSTAGES_PER_ROW = 4;
    const STAGE_HEADER_HEIGHT = 60;

    const stages = workflow.stages.map((stage: any) => {
        const stageSubstagesSource = workflow.tasks[stage.id] || [];
        const numSubstages = stageSubstagesSource.length;

        // Calculate the height required for the current stage
        const stageContentHeight = numSubstages > 0 
            ? STAGE_HEADER_HEIGHT + (Math.ceil(numSubstages / SUBSTAGES_PER_ROW)) * SUBSTAGE_V_GAP
            : STAGE_HEADER_HEIGHT;

        const stageY = currentY;

        const stageSubstages = stageSubstagesSource.map((task: any, substageIndex: number) => {
            const processData = workflow.summaryData?.processData?.find((p: any) => p.id === task.processId) || {};
            
            let type: 'auto' | 'manual' | 'upload' = 'manual';
            if (task.config?.auto === 'Y') type = 'auto';
            if (task.config?.upload === 'Y') type = 'upload';

            const dependencies = (task.dependencies || [])
                .map(getTaskByDependency)
                .filter(Boolean)
                .map((t: any) => t.id);

            return {
                ...task,
                id: task.id,
                name: task.name,
                x: 300 + (substageIndex % SUBSTAGES_PER_ROW) * SUBSTAGE_H_GAP,
                y: stageY + STAGE_HEADER_HEIGHT + Math.floor(substageIndex / SUBSTAGES_PER_ROW) * SUBSTAGE_V_GAP,
                status: mapStatus(processData.status || task.status),
                type: type,
                dependencies: dependencies,
                processData: processData,
            };
        });

        const stageResult = {
            id: stage.id,
            name: stage.name,
            x: 50,
            y: stageY,
            status: calculateStageStatus(stageSubstages),
            substages: stageSubstages,
        };

        // Update Y for the next stage, ensuring a minimum gap
        currentY += stageContentHeight + STAGE_V_GAP;

        return stageResult;
    });

    return { stages };
};


export const generateSampleWorkflowDiagram = () => {
  return {
    nodes: [
      { id: 'start', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 } },
      { id: 'stage-1', data: { label: 'Stage 1: Data Ingestion' }, position: { x: 100, y: 100 } },
      { id: 'substage-1-1', data: { label: 'Load Market Data' }, position: { x: 0, y: 200 } },
      { id: 'substage-1-2', data: { label: 'Validate Data Quality' }, position: { x: 200, y: 200 } },
      { id: 'stage-2', data: { label: 'Stage 2: Risk Calculation' }, position: { x: 100, y: 300 } },
      { id: 'substage-2-1', data: { label: 'Calculate VaR' }, position: { x: 0, y: 400 } },
      { id: 'substage-2-2', data: { label: 'Run Stress Tests' }, position: { x: 200, y: 400 } },
      { id: 'end', type: 'output', data: { label: 'End' }, position: { x: 250, y: 500 } },
    ],
    edges: [
      { id: 'e-start-s1', source: 'start', target: 'stage-1', animated: true },
      { id: 'e-s1-ss11', source: 'stage-1', target: 'substage-1-1' },
      { id: 'e-s1-ss12', source: 'stage-1', target: 'substage-1-2' },
      { id: 'e-ss12-s2', source: 'substage-1-2', target: 'stage-2', label: 'on success' },
      { id: 'e-s2-ss21', source: 'stage-2', target: 'substage-2-1' },
      { id: 'e-s2-ss22', source: 'stage-2', target: 'substage-2-2' },
      { id: 'e-ss21-end', source: 'substage-2-1', target: 'end' },
      { id: 'e-ss22-end', source: 'substage-2-2', target: 'end' },
    ],
  };
};

export const generateWorkflowGraph = (workflow: any) => {
    const nodes: any[] = [];
    const edges: any[] = [];
    const stageNodeWidth = 800;
    const taskNodeWidth = 250;
    const taskNodeHeight = 80;
    let yPos = 50;

    if (!workflow || !workflow.stages || !workflow.tasks) {
        return { nodes: [], edges: [] };
    }

    const allTasksMap = new Map();
    Object.values(workflow.tasks).flat().forEach((task: any) => {
        allTasksMap.set(task.id, task);
        if (task.processId) {
            allTasksMap.set(task.processId, task);
        }
    });

    workflow.stages.forEach((stage: any, stageIndex: number) => {
        const stageTasks = workflow.tasks[stage.id] || [];
        if (stageTasks.length === 0) return;

        const stageNodeId = `stage-${stage.id}`;
        const stageHeight = Math.ceil(stageTasks.length / 3) * (taskNodeHeight + 40) + 60;

        nodes.push({
            id: stageNodeId,
            type: 'group',
            data: {
                label: `${stage.name} (Stage ${stageIndex + 1})`,
                stageId: stage.id,
            },
            position: { x: 50, y: yPos },
            style: {
                width: stageNodeWidth,
                height: stageHeight,
                backgroundColor: 'rgba(240, 240, 240, 0.2)',
            },
        });

        stageTasks.forEach((task: any, taskIndex: number) => {
            const taskNodeId = `task-${task.id}`;
            nodes.push({
                id: taskNodeId,
                data: {
                    label: task.name,
                    status: task.status,
                    ...task
                },
                position: {
                    x: (taskIndex % 3) * (taskNodeWidth + 20) + 20,
                    y: Math.floor(taskIndex / 3) * (taskNodeHeight + 40) + 40,
                },
                style: {
                    width: taskNodeWidth,
                    height: taskNodeHeight,
                },
                parentNode: stageNodeId,
                extent: 'parent',
            });

            if (task.dependencies && task.dependencies.length > 0) {
                task.dependencies.forEach((dep: any) => {
                    const depId = dep.id || dep.processId || dep.name;
                    const sourceTask = allTasksMap.get(depId);
                    if (sourceTask) {
                        edges.push({
                            id: `edge-${sourceTask.id}-${task.id}`,
                            source: `task-${sourceTask.id}`,
                            target: taskNodeId,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                            },
                        });
                    }
                });
            }
        });

        yPos += stageHeight + 50;
    });
    
    // Add edges between stages
    for (let i = 0; i < workflow.stages.length - 1; i++) {
        const sourceStage = workflow.stages[i];
        const targetStage = workflow.stages[i+1];
        const sourceTasks = workflow.tasks[sourceStage.id] || [];
        const targetTasks = workflow.tasks[targetStage.id] || [];

        if (sourceTasks.length > 0 && targetTasks.length > 0) {
            // Connect last task of source stage to first task of target stage
            const lastSourceTask = sourceTasks[sourceTasks.length - 1];
            const firstTargetTask = targetTasks[0];
            
            edges.push({
                id: `edge-stage-${sourceStage.id}-${targetStage.id}`,
                source: `task-${lastSourceTask.id}`,
                target: `task-${firstTargetTask.id}`,
                type: 'smoothstep',
                label: 'Next Stage',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                },
            });
        }
    }


    return { nodes, edges };
};