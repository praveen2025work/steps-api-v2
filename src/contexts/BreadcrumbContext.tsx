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
      return {
        ...state,
        nodes: action.payload,
        currentLevel: action.payload.length - 1,
        error: null,
      };
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload],
        currentLevel: state.nodes.length,
        error: null,
      };
    case 'NAVIGATE_TO_LEVEL':
      const targetLevel = action.payload;
      if (targetLevel === -1) {
        return {
          ...state,
          nodes: [],
          currentLevel: -1,
          error: null,
        };
      }
      return {
        ...state,
        nodes: state.nodes.slice(0, targetLevel + 1),
        currentLevel: targetLevel,
        error: null,
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
      return initialState;
    default:
      return state;
  }
}

// Context interface
interface BreadcrumbContextType {
  state: BreadcrumbState;
  setNodes: (nodes: BreadcrumbNode[]) => void;
  addNode: (node: BreadcrumbNode) => void;
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