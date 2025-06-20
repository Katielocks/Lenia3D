import React, { useContext, useState } from 'react';
import { EngineContext } from '../App';
import { InfoModal } from './InfoModal';  

export const Topbar = ({}) => {
  const { uiState, setUiState } = useContext(EngineContext);
  const [showInfo, setShowInfo] = useState(false);
  
  // Define sidebar state transitions:
  const transitions = {
    open: {
      nextState: 'reduced', 
    },
    reduced: {
      nextState: 'collapsed',
    },
    collapsed: {
      nextState: 'open',
    },
  };

  // Toggle Sidebar function:
  
  const toggleLayout = () => {
    setUiState(prev => ({
      ...prev,
      layout: prev.layout === 'row-main' ? 'col-main' : 'row-main'
    }));
  };
  function toggleSidebar() {
    const currentSidebarState = uiState.sidebarState;
    const nextInfo = transitions[currentSidebarState];
    const nextState = nextInfo ? nextInfo.nextState : currentSidebarState;
    setUiState(prev => ({
      ...prev,
      sidebarState: nextState,
    }))
  }

  return (
    <>
    <div className="topbar">
      {/* Sidebar Collapse Button */}
      <div className="sidebar-collapse-container">
        <button
          id="toggleSidebar"
          className="sidebar-collapse-button"
          onClick={() => toggleSidebar()}  // Pass function reference
        >
        </button>
      </div>

      {/* Layout Toggle Button */}
      <div className="layout-toggle-container">
        <button
          id="toggleLayout"
          className="sidebar-collapse-button"
          onClick={() => toggleLayout()}
        >
          <img class="icon row-icon" style={{display: 'none'}} ></img>
          <img class="icon col-icon" style={{display: 'block'}}></img>
        </button>
      </div>

      {/* Title */}
      <div className="topbar-text">Lenia3D</div>
      <button
        className="info-button"
        onClick={() => setShowInfo(true)}
        aria-label="Parameter info"
      >
        ?
      </button>
      {/* Right-Aligned Controls */}
      <div className="topbar-right-align">
        {/* 2D/3D Dimension Switch 
        <div className="switch-button-container">
          <button
            className={`button switch-button ${uiState.dimension === '2D' ? 'active' : ''}`}
            onClick={() => setUiState(prev => ({ ...prev, dimension: '2D' }))}
            id="render-dimension-button-2D"
          >
            2D
          </button>
          <button
            className={`button switch-button ${uiState.dimension === '3D' ? 'active' : ''}`}
            onClick={() => setUiState(prev => ({ ...prev, dimension: '3D' }))}
            id="render-dimension-button-3D"
          >
            3D
          </button>
        </div> */}

        {/* Play/Pause and Reset Controls */}
        <div id="playcontrol" className="play-controls-topbar">
        <label
            id="play-button"
            className="play-button-topbar"
          >
            <input
              type="checkbox"
              id="play-button-checkbox"
              className="play-button-checkbox"
              style={{ display: 'none' }} // or your preferred "hidden" technique
              checked={uiState.isRunning}
              onChange={() =>
                setUiState(prev => ({ ...prev, isRunning: !prev.isRunning }))
              }
            />
              <img
                src={`${process.env.PUBLIC_URL}/assets/images/startbutton.png`}
                className="play-button-image"
                alt="Play/Pause"
              />
      
          </label>
          <button
            className="reset-button"
            id="reset"
            onClick={()=>setUiState(prev => ({ ...prev, reset: prev.reset=true }))}
          >
          </button>
        </div>
      </div>
    </div>
    <InfoModal visible={showInfo} onClose={() => setShowInfo(false)} />
    </>
  );
};
