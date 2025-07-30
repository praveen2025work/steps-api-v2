import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Breadcrumb node interface
export interface BreadcrumbNode {
  id: string;
  name: string;
  level: number;
  childCount?: number;
  completionPercentage?: number;
  appId?: number;
  configId?: string;
  currentLevel?: number;
  nextLevel?: number;
  isWorkflowInstance?: boolean;
  metadata?: {
    type: string;
    configType?: string;
    isConfigured?: boolean;
    isWeekly?: boolean | string;
    [key: string]: any;
  };
}

// Breadcrumb state interface
export interface BreadcrumbState {
  nodes: BreadcrumbNode[];
  currentLevel: number;
  isLoading: boolean;
  error: string | null;
}

// Action types
type BreadcrumbAction =
  | { type: 'SET_NODES'; payload: BreadcrumbNode[] }
  | { type: 'ADD_NODE'; payload: BreadcrumbNode }
  | { type: 'BUILD_PATH'; payload: BreadcrumbNode[] }
  | { type: 'NAVIGATE_TO_LEVEL'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Initial state
const initialState: BreadcrumbState = {
  nodes: [],
  currentLevel: -1,
  isLoading: false,
  error: null,
};

// Reducer function
function breadcrumbReducer(state: BreadcrumbState, action: BreadcrumbAction): BreadcrumbState {
  switch (action.type) {
    case 'SET_NODES':
      // Completely replace the nodes array with the new one
      console.log('[BreadcrumbContext] SET_NODES:', action.payload.map(n => n.name).join(' → '));
      return {
        ...state,
        nodes: [...action.payload], // Create a new array to ensure immutability
        currentLevel: action.payload.length - 1,
        error: null,
        isLoading: false,
      };
    case 'ADD_NODE':
      // Add a single node to the existing path
      const newNodes = [...state.nodes, action.payload];
      console.log('[BreadcrumbContext] ADD_NODE:', newNodes.map(n => n.name).join(' → '));
      return {
        ...state,
        nodes: newNodes,
        currentLevel: newNodes.length - 1,
        error: null,
        isLoading: false,
      };
    case 'BUILD_PATH':
      // Build a complete path from scratch (used for proper navigation)
      console.log('[BreadcrumbContext] BUILD_PATH:', action.payload.map(n => n.name).join(' → '));
      return {
        ...state,
        nodes: [...action.payload],
        currentLevel: action.payload.length - 1,
        error: null,
        isLoading: false,
      };
    case 'NAVIGATE_TO_LEVEL':
      const targetLevel = action.payload;
      if (targetLevel === -1) {
        // Navigate to root (applications list)
        console.log('[BreadcrumbContext] NAVIGATE_TO_LEVEL: Root (applications)');
        return {
          ...state,
          nodes: [],
          currentLevel: -1,
          error: null,
          isLoading: false,
        };
      }
      // Navigate to a specific level by truncating the nodes array
      const truncatedNodes = state.nodes.slice(0, targetLevel + 1);
      console.log('[BreadcrumbContext] NAVIGATE_TO_LEVEL:', truncatedNodes.map(n => n.name).join(' → '));
      return {
        ...state,
        nodes: truncatedNodes,
        currentLevel: targetLevel,
        error: null,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'RESET':
      // Reset to initial state
      console.log('[BreadcrumbContext] RESET: Clearing all breadcrumbs');
      return {
        ...initialState,
        nodes: [],
        currentLevel: -1,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

// Context interface
interface BreadcrumbContextType {
  state: BreadcrumbState;
  setNodes: (nodes: BreadcrumbNode[]) => void;
  addNode: (node: BreadcrumbNode) => void;
  buildPath: (nodes: BreadcrumbNode[]) => void;
  navigateToLevel: (level: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Create context
const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

// Provider component
interface BreadcrumbProviderProps {
  children: ReactNode;
}

export const BreadcrumbProvider: React.FC<BreadcrumbProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(breadcrumbReducer, initialState);

  const setNodes = (nodes: BreadcrumbNode[]) => {
    dispatch({ type: 'SET_NODES', payload: nodes });
  };

  const addNode = (node: BreadcrumbNode) => {
    dispatch({ type: 'ADD_NODE', payload: node });
  };

  const buildPath = (nodes: BreadcrumbNode[]) => {
    dispatch({ type: 'BUILD_PATH', payload: nodes });
  };

  const navigateToLevel = (level: number) => {
    dispatch({ type: 'NAVIGATE_TO_LEVEL', payload: level });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const value: BreadcrumbContextType = {
    state,
    setNodes,
    addNode,
    buildPath,
    navigateToLevel,
    setLoading,
    setError,
    reset,
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

// Custom hook to use breadcrumb context
export const useBreadcrumb = (): BreadcrumbContextType => {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};