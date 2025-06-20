import React, { useContext } from 'react';
import { EngineContext } from '../App';
export const MainContent = ({ children}) => {
  const { uiState} = useContext(EngineContext);
  return <div className={`main ${uiState.layout}`} > {children}</div>;
};