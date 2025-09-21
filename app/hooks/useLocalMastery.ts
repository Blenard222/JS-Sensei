import { useState, useEffect } from 'react';

export interface MasteryState {
  isDemoMode: boolean;
  mastery: {
    variables_types: number;
    arrays_objects: number;
    loops_conditionals: number;
  };
}

export function useLocalMastery(): MasteryState {
  const [state, setState] = useState<MasteryState>({
    isDemoMode: false,
    mastery: {
      variables_types: 0,
      arrays_objects: 0,
      loops_conditionals: 0
    }
  });

  useEffect(() => {
    // Initial load
    const updateState = () => {
      const demoStatus = localStorage.getItem('demo');
      const storedMastery = localStorage.getItem('mastery');

      setState({
        isDemoMode: demoStatus === 'true',
        mastery: storedMastery 
          ? JSON.parse(storedMastery) 
          : {
              variables_types: 0,
              arrays_objects: 0,
              loops_conditionals: 0
            }
      });
    };

    // Initial update
    updateState();

    // Listen for custom event
    const handleDemoChanged = () => {
      updateState();
    };

    // Add event listener
    document.addEventListener('demo-changed', handleDemoChanged);

    // Cleanup
    return () => {
      document.removeEventListener('demo-changed', handleDemoChanged);
    };
  }, []);

  return { ...state, isDemo: state.isDemoMode } as MasteryState & { isDemo: boolean };
}
