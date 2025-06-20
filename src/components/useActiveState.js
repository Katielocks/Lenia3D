import { useContext } from 'react';
import { EngineContext } from '../App';

/**
 * Provides the currently "active" state (simState or genState) based on menumode.
 * Useful for components that handle parameter changes differently in
 * "generate" vs. "edit" modes.
 */
export function useActiveState() {
  const { uiState, simState, setSimState, genState, setGenState } = useContext(EngineContext);

  if (uiState.menumode === 'generate') {
    return {
      activeState: genState,
      setActiveState: setGenState,
    };
  } else {
    return {
      activeState: simState,
      setActiveState: setSimState,
    };
  }
}
